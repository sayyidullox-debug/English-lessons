import type { Level, VocabWord } from "./vocab";
import { NGSL_A1 } from "./ngsl/a1";
import { NGSL_A2 } from "./ngsl/a2";
import { NGSL_B1 } from "./ngsl/b1";
import { NGSL_B2 } from "./ngsl/b2";

/**
 * Chastotali so'zlar: The New General Service List 1.2 (Browne, Culligan, Phillips), CC BY-SA 4.0.
 * Ro'yxat chastota o'rni bo'yicha taxminiy darajalarga bo'lingan (aniq CEFR emas):
 *   1-500: A1, 501-1100: A2, 1101-1900: B1, 1901-2809: B2.
 * Har satr: so'z|turkum|o'zbekcha tarjimalar (vergul bilan)|misol gap
 */
const POS = new Set<VocabWord["pos"]>(["noun", "verb", "adjective", "adverb", "phrase", "preposition", "conjunction", "pronoun"]);

export interface ParseResult {
  words: VocabWord[];
  errors: string[];
}

export function parseNgsl(text: string, level: Level): ParseResult {
  const words: VocabWord[] = [];
  const errors: string[] = [];
  for (const raw of text.split("\n")) {
    const line = raw.trim();
    if (line === "" || line.startsWith("#")) continue;
    const [word, pos, uz, example, ...rest] = line.split("|").map((p) => p.trim());
    if (!word || !pos || !uz || !example || rest.length > 0 || !POS.has(pos as VocabWord["pos"])) {
      errors.push(`${level}: noto'g'ri satr: ${line.slice(0, 60)}`);
      continue;
    }
    words.push({
      id: word.toLowerCase().replace(/\s+/g, "-"),
      word,
      pos: pos as VocabWord["pos"],
      level,
      uz,
      example,
    });
  }
  return { words, errors };
}

const parsed = [
  parseNgsl(NGSL_A1, "A1"),
  parseNgsl(NGSL_A2, "A2"),
  parseNgsl(NGSL_B1, "B1"),
  parseNgsl(NGSL_B2, "B2"),
];

export const NGSL_WORDS: VocabWord[] = parsed.flatMap((p) => p.words);
export const NGSL_ERRORS: string[] = parsed.flatMap((p) => p.errors);
