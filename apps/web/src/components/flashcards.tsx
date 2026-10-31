"use client";

import { Volume2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LEVELS, LEVEL_LABEL, VOCAB, wordsOfLevel, type Level, type VocabWord } from "@/content/vocab";
import {
  acceptedEnglish,
  acceptedUz,
  checkEn,
  checkUz,
  type CheckResult,
} from "@/lib/answer-check";
import { recordCard } from "@/lib/progress";
import { MASTERED_BOX, buildQueue, dayNumber, isMastered, review } from "@/lib/srs";
import { updateProgress, useHydrated, useProgress } from "@/lib/store";
import { cn } from "@/lib/utils";

type Direction = "en-uz" | "uz-en";
type LevelFilter = Level | "all";

const BY_ID = new Map(VOCAB.map((w) => [w.id, w]));
const AGAIN_GAP = 3;

/** en→uz kartalari so'zning id'si bilan, uz→en kartalari `r:` old qo'shimchasi bilan saqlanadi. */
const cardKey = (id: string, direction: Direction) => (direction === "en-uz" ? id : `r:${id}`);
const wordOfKey = (key: string) => BY_ID.get(key.startsWith("r:") ? key.slice(2) : key);

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
  const stem = word.slice(0, Math.max(3, word.length - 2));
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

function masteryOf(level: LevelFilter, cards: ReturnType<typeof useProgress>["cards"]) {
  const words = wordsOfLevel(level);
  return { done: words.filter((w) => isMastered(cards[w.id])).length, total: words.length };
}

/** Tavsiya etilgan daraja: ko'pi o'zlashtirilmagan eng pastki daraja. */
function recommendedLevel(cards: ReturnType<typeof useProgress>["cards"]): Level {
  for (const level of LEVELS) {
    const { done, total } = masteryOf(level, cards);
    if (done / total < 0.6) return level;
  }
  return "IELTS";
}

function Session({ level, direction }: { level: LevelFilter; direction: Direction }) {
  const progress = useProgress();
  const [day] = useState(() => dayNumber());
  const [queue, setQueue] = useState<string[]>(() => startQueue(level, direction, progress.cards, day));
  const [typed, setTyped] = useState("");
  const [outcome, setOutcome] = useState<{ check: CheckResult; typed: string; skipped: boolean } | null>(null);
  const [tally, setTally] = useState({ right: 0, wrong: 0 });

  const key = queue[0];
  const word = key ? wordOfKey(key) : undefined;

  const answer = (skipped: boolean) => {
    if (!key || !word || outcome) return;
    const check: CheckResult = skipped
      ? { verdict: "wrong" }
      : direction === "en-uz"
        ? checkUz(typed, acceptedUz(word))
        : checkEn(typed, acceptedEnglish(word, VOCAB));
    const grade = check.verdict === "wrong" ? "again" : "good";
    updateProgress((data) => recordCard(data, key, review(data.cards[key], grade, day), day));
    setOutcome({ check, typed, skipped });
    setTally((t) => ({
      right: t.right + (check.verdict === "wrong" ? 0 : 1),
      wrong: t.wrong + (check.verdict === "wrong" ? 1 : 0),
    }));
  };

  const next = () => {
    if (!outcome) return;
    const wrong = outcome.check.verdict === "wrong";
    setQueue((q) => {
      const [first, ...rest] = q;
      if (first === undefined) return q;
      if (!wrong) return rest;
      const at = Math.min(AGAIN_GAP, rest.length);
      return [...rest.slice(0, at), first, ...rest.slice(at)];
    });
    setOutcome(null);
    setTyped("");
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (outcome) next();
    else if (typed.trim() !== "") answer(false);
  };

  const pool = wordsOfLevel(level);
  const unseen = pool.filter((w) => progress.cards[cardKey(w.id, direction)] === undefined).length;
  const dueNow = pool.filter((w) => {
    const s = progress.cards[cardKey(w.id, direction)];
    return s !== undefined && s.due <= day;
  }).length;
  const { done, total } = masteryOf(level, progress.cards);

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_16rem]">
      <div>
        {word ? (
          <form key={key} onSubmit={onSubmit} className="rounded-md border border-border bg-card p-6 sm:p-9">
            <div className="flex items-center justify-between gap-4 text-sm text-muted-foreground">
              <span>
                {word.pos} · {word.level === "IELTS" ? "IELTS" : `${word.level}, ${LEVEL_LABEL[word.level].toLowerCase()}`}
              </span>
              <span className="tabular-nums">navbatda: {queue.length}</span>
            </div>

            <div className="mt-6 flex items-center gap-3">
              {direction === "en-uz" ? (
                <>
                  <p className="font-serif text-5xl font-medium tracking-tight sm:text-6xl">{word.word}</p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    aria-label={`${word.word} so'zini tinglash`}
                    onClick={() => speak(word.word)}
                  >
                    <Volume2 />
                  </Button>
                </>
              ) : (
                <p className="font-serif text-4xl font-medium tracking-tight sm:text-5xl">{word.uz}</p>
              )}
            </div>

            <label htmlFor="javob" className="mt-8 block text-sm font-medium">
              {direction === "en-uz" ? "O'zbekcha tarjimasini yozing" : "Inglizcha so'zni yozing"}
            </label>
            <input
              id="javob"
              value={outcome ? outcome.typed : typed}
              onChange={(e) => setTyped(e.target.value)}
              readOnly={outcome !== null}
              autoFocus
              autoComplete="off"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              lang={direction === "en-uz" ? "uz" : "en"}
              className={cn(
                "mt-2 h-12 w-full max-w-md rounded-md border border-input bg-background px-3 font-serif text-xl outline-none transition-colors focus-visible:border-samarkand",
                outcome?.check.verdict === "correct" && "border-samarkand",
                outcome?.check.verdict === "wrong" && "border-pen",
              )}
            />

            {outcome ? (
              <Outcome word={word} outcome={outcome} direction={direction} />
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">
                {direction === "en-uz"
                  ? "Kirill yoki lotin, o' va g' ni qanday yozsangiz ham bo'ladi."
                  : "Faqat so'zning o'zini yozing."}
              </p>
            )}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {outcome ? (
                <Button type="submit" className="h-11 px-5 text-base">
                  Keyingi so&apos;z
                </Button>
              ) : (
                <>
                  <Button type="submit" className="h-11 px-5 text-base" disabled={typed.trim() === ""}>
                    Tekshirish
                  </Button>
                  <Button type="button" variant="ghost" className="h-11 px-4" onClick={() => answer(true)}>
                    Bilmayman
                  </Button>
                </>
              )}
            </div>
          </form>
        ) : (
          <div className="rounded-md border border-border bg-card p-8">
            <h2 className="text-2xl font-bold">Bugungi navbat tugadi</h2>
            <p className="mt-2 max-w-[48ch] text-muted-foreground">
              To&apos;g&apos;ri: {tally.right}, noto&apos;g&apos;ri: {tally.wrong}.{" "}
              {unseen > 0
                ? `Bu darajada yana ${unseen} ta yangi so'z kutmoqda.`
                : "Bu darajadagi hamma so'z ko'rilgan, qolganlari o'z vaqtida qaytib keladi. Keyingi darajaga o'ting."}
            </p>
            {unseen > 0 && (
              <Button
                className="mt-5 h-10 px-4"
                onClick={() => setQueue(startQueue(level, direction, progress.cards, day))}
              >
                Yangi so&apos;zlarni boshlash
              </Button>
            )}
          </div>
        )}
      </div>

      <aside aria-label="Holat" className="space-y-5 lg:pt-1">
        <dl className="grid grid-cols-3 gap-4 lg:grid-cols-1">
          <Stat label="Navbatda" value={dueNow + Math.min(unseen, 8)} />
          <Stat label="O'zlashtirilgan" value={`${done} / ${total}`} />
          <Stat label="Hali ko'rilmagan" value={unseen} />
        </dl>
      </aside>
    </div>
  );
}

function startQueue(level: LevelFilter, direction: Direction, cards: ReturnType<typeof useProgress>["cards"], day: number) {
  const keys = wordsOfLevel(level).map((w) => cardKey(w.id, direction));
  return buildQueue(keys, cards, day);
}

function Outcome({
  word,
  outcome,
  direction,
}: {
  word: VocabWord;
  outcome: { check: CheckResult; typed: string; skipped: boolean };
  direction: Direction;
}) {
  const { check, skipped } = outcome;
  const accepted = direction === "en-uz" ? acceptedUz(word) : acceptedEnglish(word, VOCAB);

  return (
    <div className="mt-5 space-y-4" aria-live="polite">
      {check.verdict === "correct" && <p className="text-lg font-semibold text-samarkand">To&apos;g&apos;ri!</p>}
      {check.verdict === "typo" && (
        <p className="text-lg font-semibold">
          <span className="marker-hl">Deyarli to&apos;g&apos;ri.</span>{" "}
          <span className="font-normal">
            To&apos;g&apos;ri yozilishi: <span className="pen-fix text-xl">{check.matched}</span>
          </span>
        </p>
      )}
      {check.verdict === "wrong" && (
        <p className="text-lg font-semibold text-pen">
          {skipped ? "Javobi:" : "Noto'g'ri."}{" "}
          <span className="pen-fix text-xl">{accepted.join(", ")}</span>
        </p>
      )}

      {check.verdict !== "wrong" && accepted.length > 1 && (
        <p className="text-sm text-muted-foreground">Boshqa to&apos;g&apos;ri javoblar: {accepted.join(", ")}</p>
      )}

      <p className="max-w-[56ch] font-serif text-xl leading-relaxed">
        <Highlighted sentence={word.example} word={word.word} />
      </p>
      {word.meaning && <p className="max-w-[56ch] text-sm text-muted-foreground">{word.meaning}</p>}
      {word.collocations && word.collocations.length > 0 && (
        <ul className="flex flex-wrap gap-2" aria-label="Birga ishlatiladigan iboralar">
          {word.collocations.map((c) => (
            <li key={c}>
              <Badge variant="outline" className="h-6 px-2 font-serif text-sm italic">
                {c}
              </Badge>
            </li>
          ))}
        </ul>
      )}
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

function WordList({ level }: { level: LevelFilter }) {
  const progress = useProgress();
  return (
    <section aria-labelledby="barcha-sozlar" className="mt-16">
      <h2 id="barcha-sozlar" className="text-2xl font-bold tracking-tight">
        {level === "all" ? "Barcha so'zlar" : `${level} darajadagi so'zlar`}
      </h2>
      <ul className="mt-5 grid gap-x-10 sm:grid-cols-2 lg:grid-cols-3">
        {wordsOfLevel(level).map((w) => {
          const box = progress.cards[w.id]?.box ?? 0;
          return (
            <li key={w.id} className="flex items-baseline justify-between gap-3 border-t border-border py-2.5">
              <span className="min-w-0">
                <span className="font-serif text-lg font-medium">{w.word}</span>
                <span className="ml-2 text-sm text-muted-foreground">{w.uz.split(",")[0]}</span>
              </span>
              <span
                role="img"
                aria-label={box === 0 ? "ko'rilmagan" : `${box}-quti, ${box >= MASTERED_BOX ? "o'zlashtirilgan" : "o'rganilmoqda"}`}
                className="flex shrink-0 gap-0.5"
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <span key={n} className={cn("size-1.5 rounded-full", n <= box ? "bg-samarkand" : "bg-border")} />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function Trainer() {
  const progress = useProgress();
  const [recommended] = useState(() => recommendedLevel(progress.cards));
  const [level, setLevel] = useState<LevelFilter>(recommended);
  const [direction, setDirection] = useState<Direction>("en-uz");

  return (
    <>
      <fieldset>
        <legend className="text-sm font-medium text-muted-foreground">Daraja</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(["all", ...LEVELS] as LevelFilter[]).map((l) => {
            const { done, total } = masteryOf(l, progress.cards);
            return (
              <label key={l} className="cursor-pointer">
                <input
                  type="radio"
                  name="daraja"
                  value={l}
                  checked={level === l}
                  onChange={() => setLevel(l)}
                  className="peer sr-only"
                />
                <span className="flex flex-col rounded-md border border-border bg-card px-3 py-2 transition-colors peer-checked:border-foreground peer-checked:bg-marker peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-samarkand">
                  <span className="text-sm font-semibold">
                    {l === "all" ? "Hammasi" : l}
                    {l === recommended && <span className="ml-1.5 text-xs font-normal text-samarkand">tavsiya</span>}
                  </span>
                  <span className="text-xs tabular-nums text-muted-foreground peer-checked:text-ink">
                    {l === "all" ? "" : `${LEVEL_LABEL[l]}, `}
                    {done}/{total}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="mt-6">
        <legend className="text-sm font-medium text-muted-foreground">Yo&apos;nalish</legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {(
            [
              ["en-uz", "Inglizcha → o'zbekcha"],
              ["uz-en", "O'zbekcha → inglizcha"],
            ] as const
          ).map(([value, label]) => (
            <label key={value} className="cursor-pointer">
              <input
                type="radio"
                name="yonalish"
                value={value}
                checked={direction === value}
                onChange={() => setDirection(value)}
                className="peer sr-only"
              />
              <span className="inline-block rounded-md border border-border bg-card px-3 py-2 text-sm font-medium transition-colors peer-checked:border-foreground peer-checked:bg-marker peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-samarkand">
                {label}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="mt-10">
        <Session key={`${level}-${direction}`} level={level} direction={direction} />
      </div>
      <WordList level={level} />
    </>
  );
}

export function Flashcards() {
  const hydrated = useHydrated();
  if (!hydrated) return <div className="min-h-[28rem]" aria-hidden="true" />;
  return <Trainer />;
}
