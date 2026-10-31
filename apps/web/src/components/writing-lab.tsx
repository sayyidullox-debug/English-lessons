"use client";

import { useId, useState } from "react";
import { AnnotatedEssay } from "@/components/correction";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MIN_WORDS, WRITING_PROMPTS, type WritingPrompt } from "@/content/writing";
import { formatBand, overallBand } from "@/lib/band";
import type { Feedback } from "@/lib/feedback";
import { recordEssay } from "@/lib/progress";
import { dayNumber } from "@/lib/srs";
import { updateProgress, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

interface Result {
  mode: "ai" | "demo";
  feedback: Feedback;
  essay: string;
}

const CRITERIA: Array<{ key: keyof Feedback["bands"]; label: string }> = [
  { key: "task", label: "Task Response" },
  { key: "coherence", label: "Coherence and Cohesion" },
  { key: "lexical", label: "Lexical Resource" },
  { key: "grammar", label: "Grammatical Range and Accuracy" },
];

const draftKey = (id: string) => `qizil-qalam:draft:${id}`;

function countWords(text: string): number {
  return text.match(/[\p{L}][\p{L}'’-]*/gu)?.length ?? 0;
}

function loadDraft(id: string): string {
  try {
    return window.localStorage.getItem(draftKey(id)) ?? "";
  } catch {
    return "";
  }
}

/** Bitta mavzu uchun muharrir. `key={prompt.id}` tufayli mavzu almashganda holati yangilanadi. */
function Editor({ prompt }: { prompt: WritingPrompt }) {
  const promptId = prompt.id;
  const [essay, setEssay] = useState(() => loadDraft(promptId));
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const areaId = useId();

  const onChange = (value: string) => {
    setEssay(value);
    try {
      window.localStorage.setItem(draftKey(promptId), value);
    } catch {
      // saqlash imkonsiz bo'lsa ham yozish davom etadi
    }
  };

  const words = countWords(essay);
  const progress = Math.min(100, Math.round((words / MIN_WORDS) * 100));

  const submit = async () => {
    setStatus("loading");
    setError("");
    try {
      const response = await fetch("/api/writing-feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ prompt: prompt.question, essay }),
      });
      const body = (await response.json()) as { mode?: "ai" | "demo"; feedback?: Feedback; error?: string };
      if (!response.ok || !body.feedback || !body.mode) {
        throw new Error(body.error ?? "Tekshiruv amalga oshmadi");
      }
      const { feedback, mode } = body;
      setResult({ mode, feedback, essay });
      setStatus("idle");
      updateProgress((data) =>
        recordEssay(
          data,
          {
            at: Date.now(),
            promptId,
            words: countWords(essay),
            overall: overallBand(Object.values(feedback.bands)),
            mode,
          },
          dayNumber(),
        ),
      );
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Noma'lum xato");
    }
  };

  return (
    <>
      <p className="max-w-[56ch] font-serif text-2xl leading-snug">{prompt.question}</p>
      <p className="mt-3 max-w-[56ch] text-sm text-muted-foreground">Reja: {prompt.plan}</p>

        <label htmlFor={areaId} className="mt-8 block text-sm font-medium">
          Inshongiz (inglizcha)
        </label>
        <Textarea
          id={areaId}
          value={essay}
          onChange={(e) => onChange(e.target.value)}
          lang="en"
          spellCheck
          placeholder="Write your essay here. Use separate paragraphs for the introduction, body and conclusion."
          className="mt-2 min-h-[22rem] bg-card font-serif text-lg leading-8"
        />

        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3">
          <div className="min-w-48 flex-1">
            <div className="flex justify-between text-sm">
              <span className={cn("tabular-nums", words >= MIN_WORDS ? "text-samarkand" : "text-muted-foreground")}>
                {words} / {MIN_WORDS} so&apos;z
              </span>
            </div>
            <div className="mt-1 h-1 rounded-full bg-muted" role="presentation">
              <div
                className={cn("h-full rounded-full transition-all", words >= MIN_WORDS ? "bg-samarkand" : "bg-foreground/60")}
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
          <Button className="h-11 px-5 text-base" onClick={submit} disabled={words < 20 || status === "loading"}>
            {status === "loading" ? "Tekshirilmoqda..." : "Qizil qalam bilan tekshirish"}
          </Button>
        </div>
        {words < 20 && <p className="mt-2 text-sm text-muted-foreground">Tekshirish uchun kamida 20 so&apos;z yozing.</p>}
        {status === "error" && (
          <p role="alert" className="mt-3 text-pen">
            {error}. Qayta urinib ko&apos;ring.
          </p>
        )}

        {result && <ResultView result={result} />}
    </>
  );
}

export function WritingLab() {
  const [promptId, setPromptId] = useState(WRITING_PROMPTS[0]?.id ?? "");
  const hydrated = useHydrated();
  const prompt = WRITING_PROMPTS.find((p) => p.id === promptId) ?? WRITING_PROMPTS[0];

  return (
    <div className="grid gap-10 lg:grid-cols-[17rem_minmax(0,1fr)] lg:gap-14">
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">Mavzu</legend>
        <ul className="mt-3 divide-y divide-border border-y border-border">
          {WRITING_PROMPTS.map((p) => (
            <li key={p.id}>
              <label className="block cursor-pointer">
                <input
                  type="radio"
                  name="prompt"
                  value={p.id}
                  checked={p.id === promptId}
                  onChange={() => setPromptId(p.id)}
                  className="peer sr-only"
                />
                <span className="block px-3 py-3 transition-colors hover:bg-muted peer-checked:bg-marker/60 peer-focus-visible:outline-2 peer-focus-visible:-outline-offset-2 peer-focus-visible:outline-samarkand">
                  <span className="block font-semibold">{p.topic}</span>
                  <span className="block text-sm text-muted-foreground">{p.type}</span>
                </span>
              </label>
            </li>
          ))}
        </ul>
      </fieldset>

      <div className="min-w-0">
        {prompt && hydrated ? <Editor key={prompt.id} prompt={prompt} /> : <div className="min-h-[30rem]" aria-hidden="true" />}
      </div>
    </div>
  );
}

function ResultView({ result }: { result: Result }) {
  const { feedback, mode, essay } = result;
  const overall = overallBand(Object.values(feedback.bands));

  return (
    <section aria-labelledby="natija" className="mt-14 border-t-2 border-foreground pt-8" aria-live="polite">
      <div className="flex flex-wrap items-end gap-x-8 gap-y-3">
        <div>
          <h2 id="natija" className="text-sm font-medium text-muted-foreground">
            Taxminiy band
          </h2>
          <p className="font-serif text-8xl font-semibold italic leading-none text-pen">{formatBand(overall)}</p>
        </div>
        <Badge variant={mode === "ai" ? "default" : "outline"} className="mb-3 h-6 px-2">
          {mode === "ai" ? "AI tekshiruvi" : "Bepul tekshiruv"}
        </Badge>
      </div>
      <p className="mt-5 max-w-[62ch] leading-relaxed">{feedback.summary}</p>

      <table className="mt-8 w-full max-w-2xl border-collapse text-left">
        <caption className="sr-only">Mezonlar bo&apos;yicha ballar</caption>
        <tbody>
          {CRITERIA.map(({ key, label }) => {
            const band = feedback.bands[key];
            return (
              <tr key={key} className="border-b border-border">
                <th scope="row" className="py-3 pr-4 font-serif text-lg font-medium italic">
                  {label}
                </th>
                <td className="w-40 py-3 pr-4">
                  <div className="h-1.5 rounded-full bg-muted" role="presentation">
                    <div className="h-full rounded-full bg-samarkand" style={{ width: `${(band / 9) * 100}%` }} />
                  </div>
                </td>
                <td className="w-12 py-3 text-right text-lg font-semibold tabular-nums">{formatBand(band)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 className="mt-12 text-2xl font-bold tracking-tight">Qizil qalamdagi inshongiz</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        {feedback.annotations.length === 0
          ? "Belgilangan joy yo'q."
          : "Chizilgan so'zning ustiga olib boring yoki Tab bilan tanlang: sababi ko'rinadi."}
      </p>
      <div className="mt-5 max-w-[68ch] rounded-md border border-border bg-card p-6 sm:p-8">
        <AnnotatedEssay text={essay} annotations={feedback.annotations} />
      </div>

      <div className="mt-10 grid gap-10 md:grid-cols-2">
        {feedback.strengths.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-samarkand">Yaxshi chiqqan</h3>
            <ul className="mt-3 space-y-2">
              {feedback.strengths.map((s) => (
                <li key={s} className="max-w-[44ch] leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
        {feedback.nextSteps.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-pen">Keyingi qadam</h3>
            <ul className="mt-3 space-y-2">
              {feedback.nextSteps.map((s) => (
                <li key={s} className="max-w-[44ch] leading-relaxed">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {feedback.annotations.length > 0 && (
        <details className="mt-10 max-w-2xl">
          <summary className="cursor-pointer font-semibold">Barcha tuzatishlar ro&apos;yxati ({feedback.annotations.length})</summary>
          <ul className="mt-4 divide-y divide-border border-y border-border">
            {feedback.annotations.map((a, i) => (
              <li key={`${a.quote}-${i}`} className="py-3">
                <p className="font-serif text-lg">
                  <span className="pen-wrong">{a.quote}</span>
                  {a.fix && <span className="pen-fix ml-2">{a.fix}</span>}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{a.why}</p>
              </li>
            ))}
          </ul>
        </details>
      )}
    </section>
  );
}
