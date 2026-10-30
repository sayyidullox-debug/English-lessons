/**
 * O'zbekcha va ruscha yozilgan narxni so'mga aylantiradi.
 *   "150 ming" -> 150000      "1,5 mln" -> 1500000
 *   "2 mln 300 ming" -> 2300000   "150 000 so'm" -> 150000
 *   "150 тыс" -> 150000       "150k" -> 150000
 */
const UNITS: Array<[prefixes: string[], multiplier: number]> = [
  [["mlrd", "milliard", "млрд", "миллиард"], 1_000_000_000],
  [["mln", "million", "млн", "миллион"], 1_000_000],
  [["ming", "минг", "тыс", "k"], 1_000],
];

const CURRENCY = /(?<![\p{L}])(som|сум|сумов|uzs)(?![\p{L}])/gu;
const TOKEN = /(\d{1,3}(?:[  ]\d{3})+(?:[.,]\d+)?|\d+(?:[.,]\d+)?)\s*(\p{L}*)/gu;

function unitMultiplier(unit: string): number {
  if (!unit) return 1;
  for (const [prefixes, multiplier] of UNITS) {
    if (prefixes.some((p) => unit.startsWith(p))) return multiplier;
  }
  return 1;
}

function parseNumber(raw: string, hasUnit: boolean): number {
  const compact = raw.replace(/[  ]/g, "");
  // "150,000" yoki "1.500" birlik yo'q bo'lsa minglik ajratgich
  if (!hasUnit && /^\d{1,3}([.,]\d{3})+$/.test(compact)) {
    return Number(compact.replace(/[.,]/g, ""));
  }
  return Number(compact.replace(",", "."));
}

export function parseUzs(input: string): number | null {
  const text = input.toLowerCase().replace(/[ʻʼ’‘`']/g, "").replace(CURRENCY, " ");
  let total = 0;
  let matched = false;
  for (const match of text.matchAll(TOKEN)) {
    const [, rawNumber = "", unit = ""] = match;
    const multiplier = unitMultiplier(unit);
    const value = parseNumber(rawNumber, multiplier > 1) * multiplier;
    if (Number.isFinite(value)) {
      total += value;
      matched = true;
    }
  }
  const rounded = Math.round(total);
  return matched && rounded > 0 ? rounded : null;
}

/** 1500000 -> "1 500 000 so'm" */
export function formatUzs(amount: number): string {
  const grouped = String(Math.round(amount)).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  return `${grouped} so'm`;
}
