"use client";

import { Volume2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { VOCAB, type VocabWord } from "@/content/vocab";
import { masteredCount, recordCard } from "@/lib/progress";
import { MASTERED_BOX, buildQueue, dayNumber, review, type Grade } from "@/lib/srs";
import { updateProgress, useHydrated, useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

const BY_ID = new Map(VOCAB.map((w) => [w.id, w]));
const ALL_IDS = VOCAB.map((w) => w.id);
const AGAIN_GAP = 3;

function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "en-GB";
  utterance.rate = 0.9;
  window.speechSynthesis.speak(utterance);
}

/** Misol gapdagi so'zni (yoki uning shaklini) marker bilan belgilaydi. */
function Highlighted({ sentence, word }: { sentence: string; word: string }) {
  const stem = word.slice(0, Math.max(4, word.length - 2));
  const match = new RegExp(`\\b${stem}\\w*`, "i").exec(sentence);
  if (!match) return <>{sentence}</>;
  const start = match.index;
  const end = start + match[0].length;
  return (
    <>
      {sentence.slice(0, start)}
      <span className="marker-hl">{sentence.slice(start, end)}</span>
      {sentence.slice(end)}
    </>
  );
}

function Session() {
  const progress = useProgress();
  const [day] = useState(() => dayNumber());
  const [queue, setQueue] = useState<string[]>(() => buildQueue(ALL_IDS, progress.cards, day));
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);

  const currentId = queue[0];
  const word = currentId ? BY_ID.get(currentId) : undefined;

  const grade = useCallback(
    (g: Grade) => {
      if (!currentId) return;
      updateProgress((data) => recordCard(data, currentId, review(data.cards[currentId], g, day), day));
      setQueue((q) => {
        const [first, ...rest] = q;
        if (first === undefined) return q;
        if (g !== "again") return rest;
        const at = Math.min(AGAIN_GAP, rest.length);
        return [...rest.slice(0, at), first, ...rest.slice(at)];
      });
      setReviewed((n) => n + 1);
      setFlipped(false);
    },
    [currentId, day],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target && /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName)) return;
      if (event.key === " " || event.key === "Enter") {
        if (target?.tagName === "BUTTON") return;
        event.preventDefault();
        setFlipped((f) => !f);
      } else if (flipped && event.key === "1") grade("again");
      else if (flipped && event.key === "2") grade("good");
      else if (flipped && event.key === "3") grade("easy");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flipped, grade]);

  const mastered = masteredCount(progress.cards);
  const dueNow = ALL_IDS.filter((id) => {
    const s = progress.cards[id];
    return s !== undefined && s.due <= day;
  }).length;
  const unseen = ALL_IDS.filter((id) => progress.cards[id] === undefined).length;

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_18rem]">
      <div>
        {word ? (
          <Card word={word} flipped={flipped} onFlip={() => setFlipped((f) => !f)} remaining={queue.length} />
        ) : (
          <div className="rounded-md border border-border bg-card p-8">
            <h2 className="text-2xl font-bold">Bugungi navbat tugadi</h2>
            <p className="mt-2 max-w-[48ch] text-muted-foreground">
              {reviewed} ta so&apos;z takrorlandi.{" "}
              {unseen > 0
                ? `Yana ${unseen} ta yangi so'z kutmoqda.`
                : "Hamma so'z ko'rilgan, qolganlari o'z vaqtida qaytib keladi."}
            </p>
            {unseen > 0 && (
              <Button
                className="mt-5 h-10 px-4"
                onClick={() => setQueue(buildQueue(ALL_IDS, progress.cards, day))}
              >
                Yangi so&apos;zlarni boshlash
              </Button>
            )}
          </div>
        )}

        {word && (
          <div className="mt-5 flex flex-wrap items-center gap-3">
            {!flipped ? (
              <Button className="h-11 px-5 text-base" onClick={() => setFlipped(true)}>
                Javobni ko&apos;rsatish
              </Button>
            ) : (
              <>
                <Button variant="outline" className="h-11 px-4 text-base text-pen" onClick={() => grade("again")}>
                  Bilmayman <kbd className="ml-1 text-xs opacity-60">1</kbd>
                </Button>
                <Button variant="secondary" className="h-11 px-4 text-base" onClick={() => grade("good")}>
                  Esladim <kbd className="ml-1 text-xs opacity-60">2</kbd>
                </Button>
                <Button variant="outline" className="h-11 px-4 text-base text-samarkand" onClick={() => grade("easy")}>
                  Juda oson <kbd className="ml-1 text-xs opacity-60">3</kbd>
                </Button>
              </>
            )}
            <span className="text-sm text-muted-foreground">Bo&apos;sh joy: javobni ochish</span>
          </div>
        )}
      </div>

      <aside aria-label="Bugungi holat" className="space-y-5 lg:pt-1">
        <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1">
          <Stat label="Navbatda" value={dueNow + Math.min(unseen, 8)} />
          <Stat label="O'zlashtirilgan" value={`${mastered} / ${VOCAB.length}`} />
          <Stat label="Hali ko'rilmagan" value={unseen} />
        </dl>
      </aside>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-3xl font-bold tabular-nums tracking-tight">{value}</dd>
    </div>
  );
}

function Card({
  word,
  flipped,
  onFlip,
  remaining,
}: {
  word: VocabWord;
  flipped: boolean;
  onFlip: () => void;
  remaining: number;
}) {
  return (
    <div className="min-h-[22rem] rounded-md border border-border bg-card p-6 sm:p-9">
      <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
        <span>{word.pos}</span>
        <span className="tabular-nums">navbatda: {remaining}</span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={onFlip}
          className="text-left font-serif text-5xl font-medium tracking-tight sm:text-6xl"
          aria-label={flipped ? "Javobni yashirish" : "Javobni ko'rsatish"}
        >
          {word.word}
        </button>
        <Button variant="ghost" size="icon" aria-label={`${word.word} so'zini tinglash`} onClick={() => speak(word.word)}>
          <Volume2 />
        </Button>
      </div>

      {flipped ? (
        <div className="mt-8 space-y-5">
          <p className="text-2xl font-semibold text-samarkand">{word.uz}</p>
          <p className="max-w-[56ch] text-muted-foreground">{word.meaning}</p>
          <p className="max-w-[56ch] font-serif text-xl leading-relaxed">
            <Highlighted sentence={word.example} word={word.word} />
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Birga ishlatiladigan iboralar">
            {word.collocations.map((c) => (
              <li key={c}>
                <Badge variant="outline" className="h-6 px-2 font-serif text-sm italic">
                  {c}
                </Badge>
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">Ma&apos;nosini o&apos;ylab ko&apos;ring, keyin javobni oching.</p>
      )}
    </div>
  );
}

function WordList() {
  const progress = useProgress();
  return (
    <section aria-labelledby="barcha-sozlar" className="mt-16">
      <h2 id="barcha-sozlar" className="text-2xl font-bold tracking-tight">
        Barcha so&apos;zlar
      </h2>
      <ul className="mt-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {VOCAB.map((w) => {
          const box = progress.cards[w.id]?.box ?? 0;
          return (
            <li key={w.id} className="flex items-baseline justify-between gap-3 border-t border-border py-2.5">
              <span>
                <span className="font-serif text-lg font-medium">{w.word}</span>
                <span className="ml-2 text-sm text-muted-foreground">{w.uz.split(",")[0]}</span>
              </span>
              <span
                role="img"
                aria-label={box === 0 ? "ko'rilmagan" : `${box}-quti, ${box >= MASTERED_BOX ? "o'zlashtirilgan" : "o'rganilmoqda"}`}
                className="flex shrink-0 gap-0.5"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span
                    key={n}
                    className={cn("size-1.5 rounded-full", n <= box ? "bg-samarkand" : "bg-border")}
                  />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function Flashcards() {
  const hydrated = useHydrated();
  return (
    <>
      {hydrated ? <Session /> : <div className="min-h-[22rem] rounded-md border border-border bg-card" aria-hidden="true" />}
      <WordList />
    </>
  );
}
