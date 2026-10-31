import { describe, expect, it } from "vitest";
import { GRAMMAR } from "./grammar";
import { PASSAGES } from "./reading";
import { SPEAKING_PROMPTS } from "./speaking";
import { VOCAB } from "./vocab";
import { WRITING_PROMPTS } from "./writing";

const unique = (values: string[]) => new Set(values).size === values.length;

describe("kontent butunligi", () => {
  it("grammatika: id'lar noyob, javob oralig'ida, variantlar takrorlanmaydi", () => {
    expect(unique(GRAMMAR.map((q) => q.id))).toBe(true);
    for (const q of GRAMMAR) {
      expect(q.answer, q.id).toBeGreaterThanOrEqual(0);
      expect(q.answer, q.id).toBeLessThan(q.options.length);
      expect(unique(q.options), `${q.id} variantlari`).toBe(true);
      expect(q.sentence, q.id).toContain("____");
      expect(q.explanation.length, q.id).toBeGreaterThan(10);
    }
  });

  it("grammatika: to'g'ri javob joylari bir xil raqamga to'planmagan", () => {
    const counts = [0, 0, 0, 0];
    for (const q of GRAMMAR) counts[q.answer]!++;
    // Original tartibda ham javoblar hamma joyga tarqalgan bo'lsin
    expect(counts.every((c) => c > 0)).toBe(true);
  });

  it("lug'at: id'lar noyob, har so'zda misol gapda so'zning o'zi (yoki shakli) bor", () => {
    expect(unique(VOCAB.map((w) => w.id))).toBe(true);
    for (const w of VOCAB) {
      const stem = w.word.slice(0, Math.max(4, w.word.length - 2));
      expect(new RegExp(stem, "i").test(w.example), `${w.word} misoli`).toBe(true);
      expect(w.collocations.length, w.word).toBeGreaterThan(0);
    }
  });

  it("o'qish: savol id'lari butun to'plamda noyob, javoblar yaroqli", () => {
    const ids = PASSAGES.flatMap((p) => p.questions.map((q) => q.id));
    expect(unique(ids)).toBe(true);
    for (const passage of PASSAGES) {
      expect(passage.questions.length, passage.id).toBeGreaterThanOrEqual(6);
      for (const q of passage.questions) {
        if (q.kind === "choice") {
          expect(q.answer, q.id).toBeLessThan(q.options.length);
          expect(unique(q.options), q.id).toBe(true);
        }
        expect(q.evidence.length, q.id).toBeGreaterThan(5);
      }
    }
  });

  it("yozish va gapirish: id'lar noyob, savollar bo'sh emas", () => {
    expect(unique(WRITING_PROMPTS.map((p) => p.id))).toBe(true);
    expect(unique(SPEAKING_PROMPTS.map((p) => p.id))).toBe(true);
    for (const p of SPEAKING_PROMPTS) {
      expect(p.words.min, p.id).toBeLessThan(p.words.max);
      expect(p.seconds.min, p.id).toBeLessThan(p.seconds.max);
      if (p.part === 2) expect(p.bullets?.length, p.id).toBeGreaterThan(2);
    }
  });
});
