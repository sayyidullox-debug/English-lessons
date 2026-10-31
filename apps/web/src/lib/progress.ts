import { MASTERED_BOX, type CardState } from "./srs";

export interface GrammarRecord {
  right: number;
  wrong: number;
}

export interface ReadingResult {
  passageId: string;
  at: number;
  correct: number;
  total: number;
  band: number;
}

export interface EssayResult {
  at: number;
  promptId: string;
  words: number;
  overall: number;
  mode: "ai" | "demo";
}

export interface ProgressData {
  version: 1;
  cards: Record<string, CardState>;
  grammar: Record<string, GrammarRecord>;
  readings: ReadingResult[];
  essays: EssayResult[];
  /** Mashq qilingan kunlar (dayNumber). */
  days: number[];
}

export const EMPTY_PROGRESS: ProgressData = {
  version: 1,
  cards: {},
  grammar: {},
  readings: [],
  essays: [],
  days: [],
};

const HISTORY_LIMIT = 50;

export function touchDay(data: ProgressData, day: number): ProgressData {
  if (data.days.includes(day)) return data;
  return { ...data, days: [...data.days, day].sort((a, b) => a - b).slice(-400) };
}

export function recordCard(data: ProgressData, id: string, state: CardState, day: number): ProgressData {
  return touchDay({ ...data, cards: { ...data.cards, [id]: state } }, day);
}

export function recordGrammar(data: ProgressData, questionId: string, correct: boolean, day: number): ProgressData {
  const prev = data.grammar[questionId] ?? { right: 0, wrong: 0 };
  const next: GrammarRecord = {
    right: prev.right + (correct ? 1 : 0),
    wrong: prev.wrong + (correct ? 0 : 1),
  };
  return touchDay({ ...data, grammar: { ...data.grammar, [questionId]: next } }, day);
}

export function recordReading(data: ProgressData, result: ReadingResult, day: number): ProgressData {
  return touchDay({ ...data, readings: [...data.readings, result].slice(-HISTORY_LIMIT) }, day);
}

export function recordEssay(data: ProgressData, result: EssayResult, day: number): ProgressData {
  return touchDay({ ...data, essays: [...data.essays, result].slice(-HISTORY_LIMIT) }, day);
}

/** Ketma-ket mashq kunlari. Bugun hali mashq qilmagan bo'lsangiz, kechagi seriya saqlanadi. */
export function streak(days: readonly number[], today: number): number {
  const set = new Set(days);
  let cursor = set.has(today) ? today : today - 1;
  let count = 0;
  while (set.has(cursor)) {
    count++;
    cursor--;
  }
  return count;
}

export function masteredCount(cards: ProgressData["cards"]): number {
  return Object.values(cards).filter((c) => c.box >= MASTERED_BOX).length;
}

export function accuracy(records: Iterable<GrammarRecord>): number | null {
  let right = 0;
  let total = 0;
  for (const r of records) {
    right += r.right;
    total += r.right + r.wrong;
  }
  return total === 0 ? null : right / total;
}

/** Eski yoki buzilgan saqlangan ma'lumotni xavfsiz qabul qiladi. */
export function parseProgress(raw: string | null): ProgressData {
  if (!raw) return EMPTY_PROGRESS;
  try {
    const value = JSON.parse(raw) as Partial<ProgressData> | null;
    if (!value || value.version !== 1) return EMPTY_PROGRESS;
    return {
      version: 1,
      cards: value.cards ?? {},
      grammar: value.grammar ?? {},
      readings: Array.isArray(value.readings) ? value.readings : [],
      essays: Array.isArray(value.essays) ? value.essays : [],
      days: Array.isArray(value.days) ? value.days : [],
    };
  } catch {
    return EMPTY_PROGRESS;
  }
}
