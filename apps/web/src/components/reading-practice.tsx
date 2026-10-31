"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import type { ReadingPassage, ReadingQuestion, TfngAnswer } from "@/content/reading";
import { formatBand, readingBand } from "@/lib/band";
import { recordReading } from "@/lib/progress";
import { dayNumber } from "@/lib/srs";
import { shuffle, shuffleChoices } from "@/lib/shuffle";
import { updateProgress, useHydrated } from "@/lib/store";
import { cn } from "@/lib/utils";

type Answers = Record<string, number | TfngAnswer>;

const TFNG: Array<{ value: TfngAnswer; label: string }> = [
  { value: "true", label: "True" },
  { value: "false", label: "False" },
  { value: "not-given", label: "Not Given" },
];

function isCorrect(question: ReadingQuestion, answer: Answers[string] | undefined): boolean {
  return answer !== undefined && answer === question.answer;
}

function formatClock(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function useElapsed(running: boolean): number {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, [running]);
  return seconds;
}

/** Savollar tartibini va tanlov variantlarini aralashtiradi: har urinishda har kimga boshqacha. */
function prepareReading(passage: ReadingPassage): ReadingPassage {
  return {
    ...passage,
    questions: shuffle(passage.questions).map((q) =>
      q.kind === "choice" ? { ...q, ...shuffleChoices(q.options, q.answer) } : q,
    ),
  };
}

export function ReadingPractice({ passages }: { passages: ReadingPassage[] }) {
  const hydrated = useHydrated();
  const [attempt, setAttempt] = useState(0);
  const [passageId, setPassageId] = useState(passages[0]?.id ?? "");
  const passage = passages.find((p) => p.id === passageId) ?? passages[0];

  return (
    <div>
      {passages.length > 1 && (
        <fieldset className="mb-10">
          <legend className="text-sm font-medium text-muted-foreground">Matn</legend>
          <div className="mt-3 flex flex-wrap gap-2">
            {passages.map((p) => (
              <label key={p.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="passage"
                  value={p.id}
                  checked={p.id === passageId}
                  onChange={() => setPassageId(p.id)}
                  className="peer sr-only"
                />
                <span className="inline-block rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors peer-checked:border-foreground peer-checked:bg-marker peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-samarkand">
                  {p.title}
                </span>
              </label>
            ))}
          </div>
        </fieldset>
      )}
      {/* Tasodifiy tartib faqat brauzerda tuziladi, aks holda server va mijoz tartibi mos kelmaydi */}
      {!hydrated || !passage ? (
        <div className="min-h-[40rem]" aria-hidden="true" />
      ) : (
        <Practice
          key={`${passage.id}-${attempt}`}
          passage={passage}
          onRetry={() => setAttempt((n) => n + 1)}
        />
      )}
    </div>
  );
}

function Practice({ passage: source, onRetry }: { passage: ReadingPassage; onRetry: () => void }) {
  const [passage] = useState(() => prepareReading(source));
  const [answers, setAnswers] = useState<Answers>({});
  const [submitted, setSubmitted] = useState(false);
  const elapsed = useElapsed(!submitted);
  const limit = passage.minutes * 60;

  const total = passage.questions.length;
  const answeredCount = Object.keys(answers).length;
  const correct = passage.questions.filter((q) => isCorrect(q, answers[q.id])).length;
  const band = readingBand(correct, total);

  const submit = () => {
    setSubmitted(true);
    updateProgress((data) =>
      recordReading(
        data,
        { passageId: passage.id, at: Date.now(), correct, total, band },
        dayNumber(),
      ),
    );
  };

  const reset = () => {
    window.scrollTo({ top: 0 });
    onRetry();
  };

  return (
    <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
      <article aria-labelledby="matn-sarlavha">
        <h2 id="matn-sarlavha" className="text-3xl font-bold tracking-tight">
          {passage.title}
        </h2>
        <div className="mt-6 space-y-5">
          {passage.paragraphs.map((text, i) => (
            <div key={i} className="grid grid-cols-[1.75rem_1fr] gap-x-2">
              <span aria-hidden="true" className="select-none pt-1.5 text-sm font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <p className="passage">
                <span className="sr-only">{i + 1}-abzats. </span>
                {text}
              </p>
            </div>
          ))}
        </div>
      </article>

      <section aria-labelledby="savollar" className="lg:sticky lg:top-6 lg:self-start">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="savollar" className="text-2xl font-bold tracking-tight">
            Savollar
          </h2>
          <span
            className={cn("font-mono text-sm tabular-nums", elapsed > limit ? "text-pen" : "text-muted-foreground")}
            aria-label={`Vaqt: ${formatClock(elapsed)} dan ${formatClock(limit)}`}
          >
            {formatClock(elapsed)} / {formatClock(limit)}
          </span>
        </div>

        {submitted && (
          <div className="mt-5 border-y border-border py-5" aria-live="polite">
            <p className="text-sm text-muted-foreground">Taxminiy band</p>
            <p className="font-serif text-6xl font-semibold italic leading-none text-pen">{formatBand(band)}</p>
            <p className="mt-3">
              <span className="font-semibold tabular-nums">
                {correct} / {total}
              </span>{" "}
              to&apos;g&apos;ri. Ball 40 savollik imtihon jadvaliga o&apos;lchab hisoblangan, shuning uchun taxminiy.
            </p>
          </div>
        )}

        <ol className="mt-6 space-y-7">
          {passage.questions.map((q, index) => {
            const answer = answers[q.id];
            const ok = isCorrect(q, answer);
            return (
              <li key={q.id}>
                <fieldset disabled={submitted}>
                  <legend className="max-w-[48ch] text-base leading-snug">
                    <span className="mr-2 font-semibold tabular-nums">{index + 1}.</span>
                    {q.statement}
                  </legend>

                  {q.kind === "tfng" ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {TFNG.map(({ value, label }) => (
                        <ChoiceChip
                          key={value}
                          name={q.id}
                          label={label}
                          checked={answer === value}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: value }))}
                          state={submitted ? (value === q.answer ? "right" : answer === value ? "wrong" : "idle") : "idle"}
                        />
                      ))}
                    </div>
                  ) : (
                    <div className="mt-3 grid gap-2">
                      {q.options.map((option, i) => (
                        <ChoiceChip
                          key={option}
                          name={q.id}
                          label={option}
                          checked={answer === i}
                          onChange={() => setAnswers((a) => ({ ...a, [q.id]: i }))}
                          state={submitted ? (i === q.answer ? "right" : answer === i ? "wrong" : "idle") : "idle"}
                          block
                        />
                      ))}
                    </div>
                  )}
                </fieldset>

                {submitted && (
                  <p className={cn("mt-2 max-w-[52ch] text-sm leading-relaxed", ok ? "text-samarkand" : "text-pen")}>
                    {ok ? "To'g'ri. " : "Noto'g'ri. "}
                    <span className="text-muted-foreground">{q.evidence}</span>
                  </p>
                )}
              </li>
            );
          })}
        </ol>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          {submitted ? (
            <Button className="h-11 px-5 text-base" onClick={reset}>
              Qayta urinish
            </Button>
          ) : (
            <>
              <Button className="h-11 px-5 text-base" onClick={submit} disabled={answeredCount === 0}>
                Javoblarni tekshirish
              </Button>
              <span className="text-sm text-muted-foreground tabular-nums">
                {answeredCount} / {total} javob berildi
              </span>
            </>
          )}
        </div>
      </section>
    </div>
  );
}

function ChoiceChip({
  name,
  label,
  checked,
  onChange,
  state,
  block,
}: {
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
  state: "idle" | "right" | "wrong";
  block?: boolean;
}) {
  return (
    <label className={cn("cursor-pointer", block && "block")}>
      <input type="radio" name={name} checked={checked} onChange={onChange} className="peer sr-only" />
      <span
        className={cn(
          "inline-block rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-samarkand",
          block && "block w-full",
          state === "idle" && "peer-checked:border-foreground peer-checked:bg-marker peer-checked:text-ink hover:border-foreground",
          state === "right" && "border-samarkand bg-samarkand/10",
          state === "wrong" && "border-pen bg-pen/5 pen-wrong",
        )}
      >
        {label}
      </span>
    </label>
  );
}
