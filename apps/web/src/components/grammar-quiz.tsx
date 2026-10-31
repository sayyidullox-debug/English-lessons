"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { GRAMMAR, TOPIC_LABEL, type GrammarQuestion, type GrammarTopic } from "@/content/grammar";
import { dayNumber } from "@/lib/srs";
import { recordGrammar } from "@/lib/progress";
import { updateProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

type Filter = GrammarTopic | "all";

const TOPICS = Object.keys(TOPIC_LABEL) as GrammarTopic[];

function shuffle<T>(items: readonly T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

export function GrammarQuiz() {
  const [filter, setFilter] = useState<Filter>("all");
  const [run, setRun] = useState<GrammarQuestion[] | null>(null);

  if (run) return <Run questions={run} onExit={() => setRun(null)} />;

  const count = filter === "all" ? GRAMMAR.length : GRAMMAR.filter((q) => q.topic === filter).length;

  return (
    <div>
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">Mavzu</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["all", ...TOPICS] as Filter[]).map((t) => (
            <label key={t} className="cursor-pointer">
              <input
                type="radio"
                name="topic"
                value={t}
                checked={filter === t}
                onChange={() => setFilter(t)}
                className="peer sr-only"
              />
              <span className="inline-block rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors peer-checked:border-foreground peer-checked:bg-marker peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-samarkand">
                {t === "all" ? "Hammasi" : TOPIC_LABEL[t]}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <Button
        className="mt-8 h-11 px-5 text-base"
        onClick={() =>
          setRun(shuffle(filter === "all" ? GRAMMAR : GRAMMAR.filter((q) => q.topic === filter)))
        }
      >
        Boshlash ({count} ta savol)
      </Button>
    </div>
  );
}

function Run({ questions, onExit }: { questions: GrammarQuestion[]; onExit: () => void }) {
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<GrammarQuestion[]>([]);
  const [day] = useState(() => dayNumber());

  const done = index >= questions.length;
  const question = questions[index];
  const score = questions.length - wrong.length;

  const byTopic = useMemo(() => {
    const result = new Map<GrammarTopic, { right: number; total: number }>();
    for (const q of questions) {
      const entry = result.get(q.topic) ?? { right: 0, total: 0 };
      entry.total++;
      if (!wrong.includes(q)) entry.right++;
      result.set(q.topic, entry);
    }
    return [...result.entries()];
  }, [questions, wrong]);

  if (done) {
    return (
      <div>
        <h2 className="text-3xl font-bold tracking-tight">
          {score} / {questions.length}
        </h2>
        <ul className="mt-6 max-w-md divide-y divide-border border-y border-border">
          {byTopic.map(([topic, { right, total }]) => (
            <li key={topic} className="flex items-baseline justify-between py-2.5">
              <span>{TOPIC_LABEL[topic]}</span>
              <span className={cn("font-semibold tabular-nums", right === total ? "text-samarkand" : "text-pen")}>
                {right} / {total}
              </span>
            </li>
          ))}
        </ul>
        {wrong.length > 0 && (
          <section className="mt-8">
            <h3 className="text-lg font-semibold">Xato qilingan savollar</h3>
            <ul className="mt-3 space-y-4">
              {wrong.map((q) => (
                <li key={q.id} className="max-w-[60ch]">
                  <p className="font-serif text-lg">{q.sentence.replace("____", q.options[q.answer])}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{q.explanation}</p>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="mt-8 flex gap-3">
          <Button className="h-11 px-5 text-base" onClick={onExit}>
            Yana mashq qilish
          </Button>
        </div>
      </div>
    );
  }

  if (!question) return null;
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    const correct = i === question.answer;
    setPicked(i);
    if (!correct) setWrong((w) => [...w, question]);
    updateProgress((data) => recordGrammar(data, question.id, correct, day));
  };

  const next = () => {
    setPicked(null);
    setIndex((n) => n + 1);
  };

  return (
    <div>
      <div className="flex items-baseline justify-between text-sm text-muted-foreground">
        <span>{TOPIC_LABEL[question.topic]}</span>
        <span className="tabular-nums">
          {index + 1} / {questions.length}
        </span>
      </div>

      <p className="mt-4 max-w-[34ch] font-serif text-3xl leading-snug sm:text-4xl">{question.sentence}</p>

      <ul className="mt-8 grid max-w-2xl gap-2.5 sm:grid-cols-2" aria-label="Javob variantlari">
        {question.options.map((option, i) => {
          const isRight = i === question.answer;
          const isPicked = picked === i;
          return (
            <li key={option}>
              <button
                type="button"
                disabled={answered}
                onClick={() => choose(i)}
                aria-pressed={isPicked}
                className={cn(
                  "flex min-h-14 w-full items-baseline justify-between gap-3 rounded-md border border-border bg-card px-4 py-3 text-left font-serif text-xl transition-colors",
                  !answered && "hover:border-foreground hover:bg-muted",
                  answered && isRight && "border-samarkand bg-samarkand/10",
                  answered && isPicked && !isRight && "border-pen bg-pen/5",
                  answered && !isRight && !isPicked && "opacity-60",
                )}
              >
                <span className={cn(answered && isPicked && !isRight && "pen-wrong")}>{option}</span>
                {answered && isPicked && !isRight && (
                  <span className="pen-fix text-lg">{question.options[question.answer]}</span>
                )}
                {answered && isRight && <span className="sr-only">to&apos;g&apos;ri javob</span>}
              </button>
            </li>
          );
        })}
      </ul>

      {answered && (
        <div className="mt-6 max-w-2xl" aria-live="polite">
          <p className={cn("text-lg font-semibold", picked === question.answer ? "text-samarkand" : "text-pen")}>
            {picked === question.answer ? "To'g'ri" : "Noto'g'ri"}
          </p>
          <p className="mt-1 max-w-[60ch] leading-relaxed">{question.explanation}</p>
          <Button className="mt-5 h-11 px-5 text-base" onClick={next} autoFocus>
            {index + 1 === questions.length ? "Natijani ko'rish" : "Keyingi savol"}
          </Button>
        </div>
      )}
    </div>
  );
}
