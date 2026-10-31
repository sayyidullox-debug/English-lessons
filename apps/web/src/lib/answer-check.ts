import type { VocabWord } from "../content/vocab";

/**
 * Yozilgan tarjimani tekshiradi.
 *  correct: to'liq to'g'ri
 *  typo:    deyarli to'g'ri (apostrof tushgan yoki bitta harf xato): qabul qilinadi, lekin to'g'ri imlo ko'rsatiladi
 *  wrong:   noto'g'ri
 */
export type Verdict = "correct" | "typo" | "wrong";

export interface CheckResult {
  verdict: Verdict;
  /** Foydalanuvchi yozganiga eng yaqin to'g'ri variant (typo va correct uchun). */
  matched?: string;
}

const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z", и: "i", й: "y",
  к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f",
  х: "x", ц: "ts", ч: "ch", ш: "sh", ъ: "'", ь: "", э: "e", ю: "yu", я: "ya",
  ў: "o'", қ: "q", ғ: "g'", ҳ: "h",
};

/** Uzbek javobni solishtirish uchun yagona shaklga keltiradi: kichik harf, lotin, bir xil apostrof. */
export function normalizeUz(input: string): string {
  let out = "";
  for (const ch of input.toLowerCase().normalize("NFC")) out += CYRILLIC_TO_LATIN[ch] ?? ch;
  return out
    .replace(/[ʻʼ’‘`´ʹ]/g, "'")
    .replace(/[.!?,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function normalizeEn(input: string): string {
  return input
    .toLowerCase()
    .replace(/[’‘`´]/g, "'")
    .replace(/[.!?,;:]+$/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^(to|a|an|the) /, "");
}

/** Tarjimalar ro'yxati: vergul/nuqtali vergul bilan ajratilgan, qavsdagi izohlar tashlanadi. */
export function acceptedUz(word: Pick<VocabWord, "uz">): string[] {
  return word.uz
    .replace(/\([^)]*\)/g, "")
    .split(/[,;]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function distance(a: string, b: string): number {
  if (a === b) return 0;
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = prev[0]!;
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const above = prev[j]!;
      prev[j] = Math.min(prev[j]! + 1, prev[j - 1]! + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = above;
    }
  }
  return prev[b.length]!;
}

/** Imlo xatosini kechirish: so'z yetarlicha uzun bo'lsa, bitta harf farq qabul qilinadi. */
function isClose(typed: string, expected: string): boolean {
  return expected.length >= 5 && typed.length >= 4 && distance(typed, expected) <= 1;
}

function infinitiveStem(answer: string): string | null {
  const m = /^(.{2,})(moq|mak)$/.exec(answer);
  return m?.[1] ?? null;
}

export function checkUz(input: string, answers: readonly string[]): CheckResult {
  const typed = normalizeUz(input);
  if (typed === "") return { verdict: "wrong" };

  let best: CheckResult = { verdict: "wrong" };
  for (const original of answers) {
    const expected = normalizeUz(original);
    if (typed === expected) return { verdict: "correct", matched: original };

    // Fe'lning o'zagi ham qabul: "yemoq" o'rniga "ye"
    if (typed === infinitiveStem(expected)) return { verdict: "correct", matched: original };

    // Apostrof tushib qolgan: "ozbek", "tog" kabi
    const bare = expected.replace(/'/g, "");
    if (!typed.includes("'") && bare !== expected && typed === bare) best = { verdict: "typo", matched: original };

    if (best.verdict === "wrong" && isClose(typed, expected)) best = { verdict: "typo", matched: original };
  }
  return best;
}

export function checkEn(input: string, answers: readonly string[]): CheckResult {
  const typed = normalizeEn(input);
  if (typed === "") return { verdict: "wrong" };

  let best: CheckResult = { verdict: "wrong" };
  for (const original of answers) {
    const expected = normalizeEn(original);
    if (typed === expected) return { verdict: "correct", matched: original };
    if (best.verdict === "wrong" && isClose(typed, expected)) best = { verdict: "typo", matched: original };
  }
  return best;
}

/**
 * Uzbekcha so'zdan inglizchaga: shu tarjimaga ega barcha inglizcha so'zlar to'g'ri hisoblanadi
 * (masalan, "mashhur" uchun famous ham, popular ham).
 */
export function acceptedEnglish(word: VocabWord, all: readonly VocabWord[]): string[] {
  const index = translationIndex(all);
  const result = new Set<string>([word.word]);
  for (const answer of acceptedUz(word)) {
    for (const english of index.get(normalizeUz(answer)) ?? []) result.add(english);
  }
  return [...result];
}

/** Tarjima -> shu tarjimali inglizcha so'zlar. 3000 ta so'zda ham tez ishlashi uchun bir marta tuziladi. */
const indexCache = new WeakMap<readonly VocabWord[], Map<string, string[]>>();

function translationIndex(all: readonly VocabWord[]): Map<string, string[]> {
  const cached = indexCache.get(all);
  if (cached) return cached;
  const index = new Map<string, string[]>();
  for (const w of all) {
    for (const answer of acceptedUz(w)) {
      const key = normalizeUz(answer);
      const list = index.get(key);
      if (list) list.push(w.word);
      else index.set(key, [w.word]);
    }
  }
  indexCache.set(all, index);
  return index;
}
