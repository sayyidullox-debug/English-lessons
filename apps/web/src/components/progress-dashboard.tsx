"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GRAMMAR, TOPIC_LABEL, type GrammarTopic } from "@/content/grammar";
import { PASSAGES } from "@/content/reading";
import { SPEAKING_PROMPTS } from "@/content/speaking";
import { LEVELS, LEVEL_LABEL, VOCAB, wordsOfLevel } from "@/content/vocab";
import { WRITING_PROMPTS } from "@/content/writing";
import { formatBand } from "@/lib/band";
import { accuracy, streak } from "@/lib/progress";
import { dayNumber, isMastered } from "@/lib/srs";
import { resetProgress, useHydrated, useProgress } from "@/lib/store";

const dateFormat = new Intl.DateTimeFormat("uz-UZ", { day: "numeric", month: "long" });

export function ProgressDashboard() {
  const hydrated = useHydrated();
  const data = useProgress();
  const [confirming, setConfirming] = useState(false);

  if (!hydrated) return <div className="min-h-64" aria-hidden="true" />;

  const today = dayNumber();
  const seenWords = VOCAB.filter((w) => data.cards[w.id] ?? data.cards[`r:${w.id}`]).length;
  const masteredWords = VOCAB.filter((w) => isMastered(data.cards[w.id])).length;
  const grammarAcc = accuracy(Object.values(data.grammar));
  const topicRows = (Object.keys(TOPIC_LABEL) as GrammarTopic[]).map((topic) => {
    const ids = GRAMMAR.filter((q) => q.topic === topic).map((q) => q.id);
    const records = ids.flatMap((id) => (data.grammar[id] ? [data.grammar[id]] : []));
    return { topic, acc: accuracy(records) };
  });
  const empty = data.days.length === 0;

  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-3 lg:grid-cols-5">
        <Stat label="Ketma-ket kunlar" value={streak(data.days, today)} />
        <Stat label="O'zlashtirilgan so'zlar" value={`${masteredWords} / ${VOCAB.length}`} hint={`${seenWords} ta ko'rilgan`} />
        <Stat label="Grammatika aniqligi" value={grammarAcc === null ? "-" : `${Math.round(grammarAcc * 100)}%`} />
        <Stat label="Gapirish mashqlari" value={data.speaking.length} />
        <Stat label="Yozilgan insholar" value={data.essays.length} />
      </dl>

      {empty && (
        <p className="mt-10 max-w-[52ch] text-muted-foreground">
          Hozircha natija yo&apos;q. Birorta mashq qiling, shu yerda taraqqiyotingiz paydo bo&apos;ladi.
        </p>
      )}

      <section aria-labelledby="darajalar" className="mt-14">
        <h2 id="darajalar" className="text-2xl font-bold tracking-tight">
          Lug&apos;at darajalari
        </h2>
        <ul className="mt-4 max-w-xl divide-y divide-border border-y border-border">
          {LEVELS.map((level) => {
            const words = wordsOfLevel(level);
            const done = words.filter((w) => isMastered(data.cards[w.id])).length;
            return (
              <li key={level} className="grid grid-cols-[7rem_1fr_4.5rem] items-center gap-4 py-3">
                <span>
                  <span className="font-semibold">{level}</span>
                  <span className="ml-2 text-sm text-muted-foreground">{LEVEL_LABEL[level]}</span>
                </span>
                <span className="h-1.5 rounded-full bg-muted" role="presentation">
                  <span
                    className="block h-full rounded-full bg-samarkand"
                    style={{ width: `${Math.round((done / words.length) * 100)}%` }}
                  />
                </span>
                <span className="text-right text-sm font-semibold tabular-nums">
                  {done} / {words.length}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section aria-labelledby="mavzular" className="mt-14">
        <h2 id="mavzular" className="text-2xl font-bold tracking-tight">
          Grammatika mavzulari
        </h2>
        <ul className="mt-4 max-w-xl divide-y divide-border border-y border-border">
          {topicRows.map(({ topic, acc }) => (
            <li key={topic} className="grid grid-cols-[1fr_6rem_3rem] items-center gap-4 py-3">
              <span>{TOPIC_LABEL[topic]}</span>
              <span className="h-1.5 rounded-full bg-muted" role="presentation">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.round((acc ?? 0) * 100)}%`,
                    background: acc !== null && acc < 0.6 ? "var(--pen)" : "var(--samarkand)",
                  }}
                />
              </span>
              <span className="text-right text-sm font-semibold tabular-nums">
                {acc === null ? "-" : `${Math.round(acc * 100)}%`}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="insholar" className="mt-14">
        <h2 id="insholar" className="text-2xl font-bold tracking-tight">
          Insholar
        </h2>
        {data.essays.length === 0 ? (
          <p className="mt-3 text-muted-foreground">Hali insho tekshirtirilmagan.</p>
        ) : (
          <>
            <Trend values={data.essays.map((e) => e.overall)} />
            <ul className="mt-4 max-w-xl divide-y divide-border border-y border-border">
              {[...data.essays].reverse().slice(0, 8).map((e) => (
                <li key={e.at} className="flex items-baseline justify-between gap-4 py-3">
                  <span>
                    {WRITING_PROMPTS.find((p) => p.id === e.promptId)?.topic ?? "Mavzu"}
                    <span className="ml-2 text-sm text-muted-foreground">
                      {dateFormat.format(e.at)}, {e.words} so&apos;z{e.mode === "demo" ? ", bepul tekshiruv" : ""}
                    </span>
                  </span>
                  <span className="font-serif text-2xl font-semibold italic text-pen">{formatBand(e.overall)}</span>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>

      <section aria-labelledby="gapirish" className="mt-14">
        <h2 id="gapirish" className="text-2xl font-bold tracking-tight">
          Gapirish
        </h2>
        {data.speaking.length === 0 ? (
          <p className="mt-3 text-muted-foreground">Hali gapirish mashqi bajarilmagan.</p>
        ) : (
          <ul className="mt-4 max-w-xl divide-y divide-border border-y border-border">
            {[...data.speaking].reverse().slice(0, 8).map((s) => (
              <li key={s.at} className="flex items-baseline justify-between gap-4 py-3">
                <span className="min-w-0">
                  <span className="block max-w-[34ch] truncate">
                    {SPEAKING_PROMPTS.find((p) => p.id === s.promptId)?.question ?? "Savol"}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dateFormat.format(s.at)}, {s.words} so&apos;z
                  </span>
                </span>
                <span className="font-serif text-2xl font-semibold italic text-pen">{formatBand(s.overall)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="oqish" className="mt-14">
        <h2 id="oqish" className="text-2xl font-bold tracking-tight">
          O&apos;qish
        </h2>
        {data.readings.length === 0 ? (
          <p className="mt-3 text-muted-foreground">Hali o&apos;qish mashqi bajarilmagan.</p>
        ) : (
          <ul className="mt-4 max-w-xl divide-y divide-border border-y border-border">
            {[...data.readings].reverse().slice(0, 8).map((r) => (
              <li key={r.at} className="flex items-baseline justify-between gap-4 py-3">
                <span>
                  {PASSAGES.find((p) => p.id === r.passageId)?.title ?? "Matn"}
                  <span className="ml-2 text-sm text-muted-foreground">
                    {dateFormat.format(r.at)}, {r.correct} / {r.total}
                  </span>
                </span>
                <span className="font-serif text-2xl font-semibold italic text-pen">{formatBand(r.band)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="mt-16 border-t border-border pt-6">
        {confirming ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm">Hamma natija o&apos;chiriladi. Davom etasizmi?</span>
            <Button
              variant="destructive"
              className="h-9 px-3"
              onClick={() => {
                resetProgress();
                setConfirming(false);
              }}
            >
              Ha, o&apos;chirish
            </Button>
            <Button variant="ghost" className="h-9 px-3" onClick={() => setConfirming(false)}>
              Bekor qilish
            </Button>
          </div>
        ) : (
          <Button variant="ghost" className="h-9 px-3 text-muted-foreground" onClick={() => setConfirming(true)}>
            Natijalarni tozalash
          </Button>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string | number; hint?: string }) {
  return (
    <div className="border-t border-border pt-3">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 text-4xl font-bold tabular-nums tracking-tight">{value}</dd>
      {hint && <p className="mt-0.5 text-sm text-muted-foreground">{hint}</p>}
    </div>
  );
}

/** Insho ballari dinamikasi: oddiy chiziqli grafik. */
function Trend({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 320;
  const h = 72;
  const pad = 8;
  const min = Math.min(...values) - 0.5;
  const max = Math.max(...values) + 0.5;
  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (w - pad * 2);
    const y = h - pad - ((v - min) / (max - min)) * (h - pad * 2);
    return [x, y] as const;
  });
  const d = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const last = points[points.length - 1]!;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      role="img"
      aria-label={`Insho ballari: ${values.map(formatBand).join(", ")}`}
      className="mt-4 h-[4.5rem] w-full max-w-xs text-pen"
    >
      <path d={d} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={last[0]} cy={last[1]} r="3.5" fill="currentColor" />
    </svg>
  );
}
