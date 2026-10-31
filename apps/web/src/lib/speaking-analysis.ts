import type { SpeakingPrompt } from "../content/speaking";
import { overallBand, roundBand } from "./band";
import type { FeedbackAnnotation } from "./feedback";
import { findIssues, measure } from "./writing-analysis";

/**
 * Og'zaki javobning bepul tahlili. Ovoz tanish matni asosida ishlaydi, shuning uchun
 * talaffuzni baholamaydi va brauzer tashlab ketgan to'ldiruvchi so'zlarni (um, uh) ko'rmasligi mumkin.
 */

export interface SpeechResult {
  bands: { fluency: number | null; lexical: number; grammar: number };
  overall: number;
  words: number;
  /** Daqiqadagi so'z soni; vaqt noma'lum bo'lsa null. */
  wpm: number | null;
  fillers: Array<{ word: string; count: number }>;
  annotations: FeedbackAnnotation[];
  strengths: string[];
  nextSteps: string[];
}

const FILLER_WORDS = ["um", "uh", "erm", "er", "hmm", "you know", "i mean", "kind of", "sort of", "basically"] as const;
const MIN_SECONDS_FOR_PACE = 8;

const clamp = (value: number) => Math.min(7, Math.max(3.5, roundBand(value)));

function countFillers(transcript: string): { fillers: SpeechResult["fillers"]; total: number; marks: FeedbackAnnotation[] } {
  const fillers: SpeechResult["fillers"] = [];
  const marks: FeedbackAnnotation[] = [];
  let total = 0;
  for (const word of FILLER_WORDS) {
    const matches = [...transcript.matchAll(new RegExp(`(?<![\\p{L}'])${word}(?![\\p{L}'])`, "giu"))];
    if (matches.length === 0) continue;
    fillers.push({ word, count: matches.length });
    total += matches.length;
    for (const m of matches) {
      marks.push({ quote: m[0], fix: "", why: "To'ldiruvchi so'z. Pauza qilib o'ylash bu so'zdan yaxshiroq." });
    }
  }
  return { fillers, total, marks };
}

export function analyseSpeech(transcript: string, seconds: number | null, prompt: SpeakingPrompt): SpeechResult {
  const stats = measure(transcript);
  const { fillers, total: fillerCount, marks } = countFillers(transcript);
  const issues = findIssues(transcript, { spoken: true });

  const wpm =
    seconds !== null && seconds >= MIN_SECONDS_FOR_PACE && stats.words > 0
      ? Math.round(stats.words / (seconds / 60))
      : null;
  const fillersPer100 = stats.words === 0 ? 0 : (fillerCount / stats.words) * 100;

  let fluency: number | null = null;
  if (wpm !== null) {
    fluency = wpm < 60 ? 4.5 : wpm < 80 ? 5.5 : wpm < 100 ? 6 : wpm <= 170 ? 6.5 : 6;
    if (stats.linkers.length >= 2 && stats.words >= prompt.words.min) fluency += 0.5;
    if (fillersPer100 > 8) fluency -= 1;
    else if (fillersPer100 > 4) fluency -= 0.5;
    if (stats.words < prompt.words.min * 0.6) fluency -= 1;
    fluency = clamp(fluency);
  }

  const d = stats.lexicalDiversity;
  const lengthCap = stats.words < 40 ? 5 : stats.words < 80 ? 5.5 : stats.words < 130 ? 6.5 : 7;
  const lexical = clamp(Math.min(lengthCap, d >= 0.7 ? 7 : d >= 0.6 ? 6.5 : d >= 0.5 ? 6 : d >= 0.42 ? 5.5 : 5));

  const per100 = stats.words === 0 ? 0 : (issues.length / stats.words) * 100;
  let grammar = per100 === 0 ? 7 : per100 <= 1 ? 6.5 : per100 <= 2.5 ? 6 : per100 <= 5 ? 5.5 : 5;
  if (stats.words < 30) grammar = Math.min(grammar, 5.5);
  grammar = clamp(grammar);

  const bands = { fluency, lexical, grammar };
  const scored = [fluency, lexical, grammar].filter((b): b is number => b !== null);

  const strengths: string[] = [];
  const nextSteps: string[] = [];

  if (wpm !== null) {
    if (wpm >= 100 && wpm <= 170) strengths.push(`Gapirish tezligi yaxshi: daqiqasiga ${wpm} so'z.`);
    else if (wpm < 100) nextSteps.push(`Sekin gapiryapsiz (daqiqasiga ${wpm} so'z). 110 dan 150 gacha bo'lsa tabiiy eshitiladi.`);
    else nextSteps.push(`Juda tez gapiryapsiz (daqiqasiga ${wpm} so'z). Tezlikni biroz pasaytiring.`);
  }

  if (stats.words >= prompt.words.min) strengths.push(`Javob uzunligi yetarli: ${stats.words} so'z.`);
  else nextSteps.push(`Javob qisqa (${stats.words} so'z). Kamida ${prompt.words.min} so'z gapirishga harakat qiling: sabab va misol qo'shing.`);

  if (fillerCount > 0 && fillersPer100 > 4) nextSteps.push("To'ldiruvchi so'zlar ko'p. O'ylash kerak bo'lsa jim turing, bu normal.");
  if (stats.linkers.length >= 2) strengths.push(`Bog'lovchilar ishlatilgan: ${stats.linkers.slice(0, 3).join(", ")}.`);
  else nextSteps.push("Fikrlarni bog'lang: because, however, for example, as a result.");
  if (issues.length > 0) nextSteps.push("Qizil bilan belgilangan xatolarni qayta gapirib ko'ring.");
  if (d < 0.5 && stats.words >= 40) nextSteps.push("So'zlar takrorlanyapti. Lug'at bo'limidagi yangi so'zlardan ishlating.");

  return {
    bands,
    overall: overallBand(scored),
    words: stats.words,
    wpm,
    fillers,
    annotations: [...issues, ...marks].slice(0, 16),
    strengths: strengths.slice(0, 4),
    nextSteps: nextSteps.slice(0, 4),
  };
}
