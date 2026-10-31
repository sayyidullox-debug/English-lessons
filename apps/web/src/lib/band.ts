/** IELTS qoidasi: o'rtacha eng yaqin 0.5 ga yaxlitlanadi (.25 -> .5, .75 -> keyingi butun). */
export function roundBand(average: number): number {
  return Math.round(average * 2) / 2;
}

export function overallBand(criteria: readonly number[]): number {
  if (criteria.length === 0) return 0;
  return roundBand(criteria.reduce((sum, v) => sum + v, 0) / criteria.length);
}

/** Academic Reading uchun taxminiy jadval (40 savol). */
const READING_TABLE: Array<[minRaw: number, band: number]> = [
  [39, 9],
  [37, 8.5],
  [35, 8],
  [33, 7.5],
  [30, 7],
  [27, 6.5],
  [23, 6],
  [19, 5.5],
  [15, 5],
  [13, 4.5],
  [10, 4],
  [8, 3.5],
  [6, 3],
];

/** Savollar soni 40 dan kam bo'lsa, natija 40 ga proporsional o'lchanadi. */
export function readingBand(correct: number, total: number): number {
  if (total <= 0) return 0;
  const raw = Math.round((correct / total) * 40);
  for (const [min, band] of READING_TABLE) {
    if (raw >= min) return band;
  }
  return 2.5;
}

export function formatBand(band: number): string {
  return Number.isInteger(band) ? `${band}.0` : String(band);
}
