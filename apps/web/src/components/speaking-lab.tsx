"use client";

import { useEffect, useId, useRef, useState } from "react";
import { AnnotatedEssay } from "@/components/correction";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  PART_LABEL,
  PREP_SECONDS,
  SPEAKING_PROMPTS,
  type SpeakingPart,
  type SpeakingPrompt,
} from "@/content/speaking";
import { LEVELS, LEVEL_LABEL } from "@/content/vocab";
import { formatBand } from "@/lib/band";
import { recordSpeaking } from "@/lib/progress";
import { analyseSpeech, type SpeechResult } from "@/lib/speaking-analysis";
import { dayNumber } from "@/lib/srs";
import { updateProgress, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

/* Brauzerning ovoz tanish interfeysi (Chrome, Edge). TypeScript kutubxonasida yo'q, shuning uchun minimal tur. */
interface RecognitionAlternative {
  transcript: string;
}
interface RecognitionResult {
  isFinal: boolean;
  0: RecognitionAlternative;
}
interface RecognitionEvent {
  resultIndex: number;
  results: ArrayLike<RecognitionResult>;
}
interface Recognition {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: RecognitionEvent) => void) | null;
  onerror: ((event: { error: string }) => void) | null;
  onend: (() => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}
type RecognitionCtor = new () => Recognition;

function getRecognition(): RecognitionCtor | null {
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

const ERROR_TEXT: Record<string, string> = {
  "not-allowed": "Mikrofonga ruxsat berilmagan. Manzil satridagi qulf belgisidan ruxsat bering.",
  "service-not-allowed": "Brauzer ovoz tanishga ruxsat bermadi.",
  "audio-capture": "Mikrofon topilmadi. Uni ulang va qayta urining.",
  network: "Ovoz tanish uchun internet kerak. Ulanishni tekshiring.",
};

function useCountdown(seconds: number, running: boolean): number {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return left;
}

function clock(total: number): string {
  return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`;
}

function countWords(text: string): number {
  return text.match(/[\p{L}][\p{L}'’-]*/gu)?.length ?? 0;
}

function Editor({ prompt }: { prompt: SpeakingPrompt }) {
  const [supported] = useState(() => getRecognition() !== null);
  const [transcript, setTranscript] = useState("");
  const [interim, setInterim] = useState("");
  const [listening, setListening] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [prepRunning, setPrepRunning] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState<SpeechResult | null>(null);
  const [analysed, setAnalysed] = useState("");

  const recognition = useRef<Recognition | null>(null);
  const wantListening = useRef(false);
  const finalText = useRef("");
  const areaId = useId();
  const prepLeft = useCountdown(PREP_SECONDS, prepRunning);

  useEffect(() => {
    if (!listening) return;
    const id = window.setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [listening]);

  useEffect(
    () => () => {
      wantListening.current = false;
      recognition.current?.abort();
    },
    [],
  );

  const start = () => {
    const Ctor = getRecognition();
    if (!Ctor) return;
    setError("");
    setResult(null);
    setPrepRunning(false);

    const rec = new Ctor();
    rec.lang = "en-US";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (event) => {
      let pending = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const item = event.results[i];
        if (!item) continue;
        if (item.isFinal) {
          finalText.current = `${finalText.current} ${item[0].transcript}`.trim();
          setTranscript(finalText.current);
        } else {
          pending += item[0].transcript;
        }
      }
      setInterim(pending);
    };
    rec.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      wantListening.current = false;
      setListening(false);
      setError(ERROR_TEXT[event.error] ?? `Ovoz tanishda xato: ${event.error}`);
    };
    rec.onend = () => {
      // Brauzer jimlikdan keyin o'zi to'xtatadi: foydalanuvchi to'xtatmagan bo'lsa davom ettiramiz
      if (wantListening.current) {
        try {
          rec.start();
        } catch {
          wantListening.current = false;
          setListening(false);
        }
      } else {
        setListening(false);
        setInterim("");
      }
    };

    recognition.current = rec;
    wantListening.current = true;
    setListening(true);
    try {
      rec.start();
    } catch {
      wantListening.current = false;
      setListening(false);
    }
  };

  const stop = () => {
    wantListening.current = false;
    recognition.current?.stop();
    setListening(false);
  };

  const onEdit = (value: string) => {
    finalText.current = value;
    setTranscript(value);
  };

  const check = () => {
    const text = transcript.trim();
    const seconds = elapsed > 0 ? elapsed : null;
    const analysis = analyseSpeech(text, seconds, prompt);
    setResult(analysis);
    setAnalysed(text);
    updateProgress((data) =>
      recordSpeaking(
        data,
        { at: Date.now(), promptId: prompt.id, words: analysis.words, overall: analysis.overall },
        dayNumber(),
      ),
    );
  };

  const reset = () => {
    stop();
    finalText.current = "";
    setTranscript("");
    setInterim("");
    setElapsed(0);
    setResult(null);
    setPrepRunning(false);
  };

  const words = countWords(transcript);

  return (
    <>
      <p className="max-w-[56ch] font-serif text-2xl leading-snug">{prompt.question}</p>
      {prompt.bullets && (
        <div className="mt-4 max-w-[48ch] border-l-2 border-marker pl-4">
          <p className="text-sm font-medium text-muted-foreground">You should say:</p>
          <ul className="mt-1 list-disc pl-5 font-serif text-lg leading-relaxed">
            {prompt.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="mt-4 text-sm text-muted-foreground">
        Tavsiya: {prompt.seconds.min}-{prompt.seconds.max} soniya, taxminan {prompt.words.min}-{prompt.words.max} so&apos;z.
      </p>

      {prompt.part === 2 && (
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            className="h-10 px-4"
            onClick={() => setPrepRunning(true)}
            disabled={prepRunning || listening}
          >
            Tayyorlanish: {PREP_SECONDS} soniya
          </Button>
          {prepRunning && (
            <span className="font-mono tabular-nums" aria-live="off">
              {prepLeft > 0 ? clock(prepLeft) : "Vaqt tugadi, gapirishni boshlang"}
            </span>
          )}
        </div>
      )}

      {supported ? (
        <div className="mt-8 flex flex-wrap items-center gap-4">
          {listening ? (
            <Button className="h-12 bg-pen px-6 text-base text-white hover:bg-pen/90" onClick={stop}>
              To&apos;xtatish
            </Button>
          ) : (
            <Button className="h-12 px-6 text-base" onClick={start}>
              {transcript ? "Davom ettirish" : "Gapirishni boshlash"}
            </Button>
          )}
          <span className="font-mono text-lg tabular-nums" aria-label={`Gapirilgan vaqt ${clock(elapsed)}`}>
            {clock(elapsed)}
          </span>
          {listening && (
            <span className="flex items-center gap-2 text-sm text-pen" role="status">
              <span className="size-2 animate-pulse rounded-full bg-pen motion-reduce:animate-none" />
              Eshitilmoqda
            </span>
          )}
        </div>
      ) : (
        <p className="mt-8 max-w-[56ch] rounded-md border border-border bg-card p-4 text-sm leading-relaxed">
          Bu brauzer ovozni matnga aylantirmaydi. <strong>Chrome</strong> yoki <strong>Edge</strong> da oching. Hozircha
          javobingizni quyida yozib tekshirtirishingiz mumkin, lekin gapirish tezligi baholanmaydi.
        </p>
      )}

      {error && (
        <p role="alert" className="mt-3 text-pen">
          {error}
        </p>
      )}

      <label htmlFor={areaId} className="mt-8 block text-sm font-medium">
        Gapirgan matningiz (inglizcha)
      </label>
      <Textarea
        id={areaId}
        value={listening && interim ? `${transcript} ${interim}`.trim() : transcript}
        onChange={(e) => onEdit(e.target.value)}
        readOnly={listening}
        lang="en"
        placeholder={supported ? "Gapirganingiz shu yerda yoziladi. Xatolarni qo'lda tuzatishingiz mumkin." : "Javobingizni shu yerga yozing."}
        className="mt-2 min-h-40 bg-card font-serif text-lg leading-8"
      />

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <Button className="h-11 px-5 text-base" onClick={check} disabled={words < 8 || listening}>
          Tekshirish
        </Button>
        <Button variant="ghost" className="h-11 px-4" onClick={reset} disabled={transcript === "" && elapsed === 0}>
          Boshidan
        </Button>
        <span className="text-sm tabular-nums text-muted-foreground">{words} so&apos;z</span>
      </div>
      {words < 8 && <p className="mt-2 text-sm text-muted-foreground">Tekshirish uchun kamida 8 so&apos;z kerak.</p>}

      {result && <SpeechResultView result={result} text={analysed} />}
    </>
  );
}

function SpeechResultView({ result, text }: { result: SpeechResult; text: string }) {
  const rows: Array<{ label: string; band: number | null }> = [
    { label: "Fluency and Coherence", band: result.bands.fluency },
    { label: "Lexical Resource", band: result.bands.lexical },
    { label: "Grammatical Range and Accuracy", band: result.bands.grammar },
  ];

  return (
    <section aria-labelledby="speaking-natija" className="mt-14 border-t-2 border-foreground pt-8" aria-live="polite">
      <h2 id="speaking-natija" className="text-sm font-medium text-muted-foreground">
        Taxminiy band
      </h2>
      <p className="font-serif text-8xl font-semibold italic leading-none text-pen">{formatBand(result.overall)}</p>
      <p className="mt-4 max-w-[60ch] text-sm leading-relaxed text-muted-foreground">
        Talaffuz (Pronunciation) baholanmagan: uni faqat jonli tinglovchi aytib bera oladi. Ball ovoz tanish matniga
        qarab taxmin qilingan.
      </p>

      <table className="mt-6 w-full max-w-2xl border-collapse text-left">
        <caption className="sr-only">Mezonlar bo&apos;yicha ballar</caption>
        <tbody>
          {rows.map(({ label, band }) => (
            <tr key={label} className="border-b border-border">
              <th scope="row" className="py-3 pr-4 font-serif text-lg font-medium italic">
                {label}
              </th>
              <td className="w-40 py-3 pr-4">
                <div className="h-1.5 rounded-full bg-muted" role="presentation">
                  <div
                    className={cn("h-full rounded-full", band === null ? "bg-transparent" : "bg-samarkand")}
                    style={{ width: `${((band ?? 0) / 9) * 100}%` }}
                  />
                </div>
              </td>
              <td className="w-16 py-3 text-right text-lg font-semibold tabular-nums">
                {band === null ? "-" : formatBand(band)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {result.bands.fluency === null && (
        <p className="mt-2 text-sm text-muted-foreground">Ravonlik baholanmadi: gapirish vaqti o&apos;lchanmagan.</p>
      )}

      <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <dt className="text-sm text-muted-foreground">So&apos;z soni</dt>
          <dd className="text-2xl font-bold tabular-nums">{result.words}</dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">Tezlik</dt>
          <dd className="text-2xl font-bold tabular-nums">
            {result.wpm === null ? "-" : `${result.wpm} so'z/daq`}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-muted-foreground">To&apos;ldiruvchi so&apos;zlar</dt>
          <dd className="text-2xl font-bold tabular-nums">
            {result.fillers.reduce((n, f) => n + f.count, 0)}
          </dd>
        </div>
      </dl>
      <p className="mt-1 text-xs text-muted-foreground">
        Brauzerlar um va uh kabi so&apos;zlarni ko&apos;pincha yozmaydi, shuning uchun bu son kam ko&apos;rsatilishi mumkin.
      </p>

      <h3 className="mt-10 text-2xl font-bold tracking-tight">Qizil qalamdagi javobingiz</h3>
      <div className="mt-4 max-w-[68ch] rounded-md border border-border bg-card p-6">
        <AnnotatedEssay text={text} annotations={result.annotations} />
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {result.strengths.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-samarkand">Yaxshi chiqqan</h3>
            <ul className="mt-3 space-y-2">
              {result.strengths.map((s) => (
                <li key={s} className="max-w-[44ch] leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {result.nextSteps.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-pen">Keyingi qadam</h3>
            <ul className="mt-3 space-y-2">
              {result.nextSteps.map((s) => (
                <li key={s} className="max-w-[44ch] leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

/** Savollarni daraja bo'yicha guruhlaydi; IELTS darajasi esa Part 1/2/3 ga bo'linadi. */
function speakingGroups(): Array<{ label: string; prompts: SpeakingPrompt[] }> {
  const groups: Array<{ label: string; prompts: SpeakingPrompt[] }> = [];
  for (const level of LEVELS) {
    if (level === "IELTS") {
      for (const part of [1, 2, 3] as const satisfies readonly SpeakingPart[]) {
        const prompts = SPEAKING_PROMPTS.filter((p) => p.level === "IELTS" && p.part === part);
        if (prompts.length > 0) groups.push({ label: `IELTS ${PART_LABEL[part]}`, prompts });
      }
    } else {
      const prompts = SPEAKING_PROMPTS.filter((p) => p.level === level);
      if (prompts.length > 0) groups.push({ label: `${level}, ${LEVEL_LABEL[level].toLowerCase()}`, prompts });
    }
  }
  return groups;
}

export function SpeakingLab() {
  const [promptId, setPromptId] = useState(SPEAKING_PROMPTS[0]?.id ?? "");
  const hydrated = useHydrated();
  const prompt = SPEAKING_PROMPTS.find((p) => p.id === promptId) ?? SPEAKING_PROMPTS[0];
  const groups = speakingGroups();

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">Savol</legend>
        <div className="mt-3 space-y-5">
          {groups.map(({ label, prompts }) => (
            <div key={label}>
              <p className="text-sm font-semibold">{label}</p>
              <ul className="mt-1 divide-y divide-border border-y border-border">
                {prompts.map((p) => (
                  <li key={p.id}>
                    <label className="block cursor-pointer">
                      <input
                        type="radio"
                        name="speaking-prompt"
                        value={p.id}
                        checked={p.id === promptId}
                        onChange={() => setPromptId(p.id)}
                        className="peer sr-only"
                      />
                      <span className="block px-3 py-2.5 text-sm leading-snug transition-colors hover:bg-muted peer-checked:bg-marker/60 peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-samarkand">
                        {p.question.length > 62 ? `${p.question.slice(0, 60)}...` : p.question}
                      </span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </fieldset>

      <div className="min-w-0">
        {prompt && hydrated ? <Editor key={prompt.id} prompt={prompt} /> : <div className="min-h-[30rem]" aria-hidden="true" />}
      </div>
    </div>
  );
}
