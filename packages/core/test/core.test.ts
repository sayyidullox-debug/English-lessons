import { describe, expect, it } from "vitest";
import { z } from "zod";
import {
  MockProvider,
  createTranslator,
  detectLang,
  extractJson,
  formatUzs,
  openDb,
  parseUzs,
  slugify,
  transaction,
  uniqueSlug,
} from "../src/index.ts";

describe("slugify", () => {
  it("o'zbek lotin va apostroflarni tozalaydi", () => {
    expect(slugify("O'zbek Go'zallik Saloni")).toBe("ozbek-gozallik-saloni");
  });
  it("kirill va rus harflarini transliteratsiya qiladi", () => {
    expect(slugify("Қўшни Магазин №5")).toBe("qoshni-magazin-5");
    expect(slugify("Йогурт")).toBe("yogurt");
  });
  it("uzunlikni cheklaydi va oxirida chiziq qoldirmaydi", () => {
    const slug = slugify("a".repeat(10) + " " + "b".repeat(10), 11);
    expect(slug).toBe("aaaaaaaaaa");
  });
  it("uniqueSlug to'qnashuvda raqam qo'shadi", () => {
    const taken = new Set(["kafe", "kafe-2"]);
    expect(uniqueSlug("Kafe", (s) => taken.has(s))).toBe("kafe-3");
  });
});

describe("parseUzs", () => {
  it.each([
    ["150 ming", 150_000],
    ["150ming", 150_000],
    ["150k", 150_000],
    ["150 000 so'm", 150_000],
    ["150,000", 150_000],
    ["1.500", 1_500],
    ["1,5 mln", 1_500_000],
    ["2 mln 300 ming", 2_300_000],
    ["150 тыс", 150_000],
    ["1,2 млн сум", 1_200_000],
    ["45000", 45_000],
  ])("%s -> %i", (input, expected) => {
    expect(parseUzs(input)).toBe(expected);
  });

  it("raqam bo'lmasa null qaytaradi", () => {
    expect(parseUzs("kelishamiz")).toBeNull();
    expect(parseUzs("0")).toBeNull();
  });

  it("formatUzs minglarni ajratadi", () => {
    expect(formatUzs(1_500_000)).toBe("1 500 000 so'm");
    expect(formatUzs(999)).toBe("999 so'm");
  });
});

describe("i18n", () => {
  const t = createTranslator({
    uz: { hi: "Salom, {name}!", only_uz: "Faqat uz" },
    ru: { hi: "Привет, {name}!" },
  });
  it("parametrlarni qo'yadi", () => {
    expect(t("ru", "hi", { name: "Ali" })).toBe("Привет, Ali!");
  });
  it("tarjima yo'q bo'lsa o'zbekchaga, keyin kalitga qaytadi", () => {
    expect(t("ru", "only_uz")).toBe("Faqat uz");
    expect(t("uz", "missing")).toBe("missing");
  });
  it("tilni aniqlaydi", () => {
    expect(detectLang("ru-RU")).toBe("ru");
    expect(detectLang("uz")).toBe("uz");
    expect(detectLang(undefined)).toBe("uz");
  });
});

describe("extractJson", () => {
  it("```json``` to'siqi va izohlarni olib tashlaydi", () => {
    const text = 'Mana natija:\n```json\n{"a": [1, 2]}\n```\nTayyor.';
    expect(extractJson(text)).toEqual({ a: [1, 2] });
  });
  it("massivni ham taniydi", () => {
    expect(extractJson("[1,2,3]")).toEqual([1, 2, 3]);
  });
  it("JSON bo'lmasa xato beradi", () => {
    expect(() => extractJson("hech narsa")).toThrow(SyntaxError);
  });
});

describe("MockProvider", () => {
  it("javobni sxema bilan tekshiradi va chaqiruvlarni yozadi", async () => {
    const ai = new MockProvider({ json: () => ({ name: "Choy" }) });
    const result = await ai.completeJson({
      system: "s",
      prompt: "p",
      schema: z.object({ name: z.string() }),
    });
    expect(result.name).toBe("Choy");
    expect(ai.calls).toEqual([{ kind: "json", prompt: "p" }]);
  });
  it("sxemaga mos kelmasa xato beradi", async () => {
    const ai = new MockProvider({ json: () => ({ name: 5 }) });
    await expect(
      ai.completeJson({ system: "s", prompt: "p", schema: z.object({ name: z.string() }) }),
    ).rejects.toThrow();
  });
});

describe("db", () => {
  const migrations = [
    { id: 1, sql: "CREATE TABLE t (id INTEGER PRIMARY KEY, v TEXT NOT NULL);" },
    { id: 2, sql: "ALTER TABLE t ADD COLUMN extra TEXT;" },
  ];

  it("migratsiyalarni bir marta ishlatadi", () => {
    const db = openDb(":memory:", migrations);
    const row = db.prepare("PRAGMA user_version").get() as { user_version: number };
    expect(row.user_version).toBe(2);
    db.exec("INSERT INTO t (v, extra) VALUES ('a', 'b')");
  });

  it("transaction xatoda orqaga qaytaradi", () => {
    const db = openDb(":memory:", migrations);
    expect(() =>
      transaction(db, () => {
        db.exec("INSERT INTO t (v) VALUES ('x')");
        throw new Error("boom");
      }),
    ).toThrow("boom");
    const count = db.prepare("SELECT COUNT(*) AS c FROM t").get() as { c: number };
    expect(count.c).toBe(0);
  });
});
