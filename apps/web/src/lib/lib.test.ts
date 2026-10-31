import { describe, expect, it } from "vitest";
import { SPEAKING_PROMPTS } from "../content/speaking";
import { VOCAB } from "../content/vocab";
import { acceptedEnglish, acceptedUz, checkEn, checkUz } from "./answer-check";
import { overallBand, readingBand, roundBand } from "./band";
import { analyseSpeech } from "./speaking-analysis";
import { buildSegments } from "./feedback";
import { shuffle, shuffleChoices } from "./shuffle";
import { MASTERED_BOX, buildQueue, dayNumber, isMastered, review } from "./srs";
import { demoFeedback, estimateBands, findIssues, measure } from "./writing-analysis";

describe("band", () => {
  it("IELTS qoidasi bo'yicha yaxlitlaydi", () => {
    expect(roundBand(6.25)).toBe(6.5);
    expect(roundBand(6.75)).toBe(7);
    expect(roundBand(6.125)).toBe(6);
    expect(roundBand(6.375)).toBe(6.5);
  });
  it("umumiy ballni to'rt mezondan hisoblaydi", () => {
    expect(overallBand([6, 6, 6, 7])).toBe(6.5);
    expect(overallBand([5.5, 6, 6, 6])).toBe(6);
    expect(overallBand([])).toBe(0);
  });
  it("Reading ballini 40 savolga proporsional o'lchaydi", () => {
    expect(readingBand(40, 40)).toBe(9);
    expect(readingBand(30, 40)).toBe(7);
    expect(readingBand(15, 20)).toBe(7);
    expect(readingBand(0, 10)).toBe(2.5);
    expect(readingBand(1, 0)).toBe(0);
  });
});

describe("srs", () => {
  const day = 20_000;

  it("yangi so'z yaxshi eslansa 2-qutiga o'tadi va ertaga qaytadi", () => {
    const s = review(undefined, "good", day);
    expect(s).toMatchObject({ box: 2, due: day + 1, seen: 1, lapses: 0 });
  });
  it("'easy' ikki quti sakraydi", () => {
    expect(review(undefined, "easy", day).box).toBe(3);
  });
  it("'again' 1-qutiga qaytaradi va xato sonini oshiradi", () => {
    const advanced = review(review(undefined, "easy", day), "good", day);
    const failed = review(advanced, "again", day + 3);
    expect(failed).toMatchObject({ box: 1, due: day + 3, lapses: 1 });
  });
  it("quti 5 dan oshmaydi va o'zlashtirilgan hisoblanadi", () => {
    let s = review(undefined, "easy", day);
    for (let i = 0; i < 5; i++) s = review(s, "easy", day);
    expect(s.box).toBe(5);
    expect(isMastered(s)).toBe(true);
    expect(isMastered(review(undefined, "good", day))).toBe(false);
    expect(MASTERED_BOX).toBe(4);
  });
  it("navbat: avval muddati o'tganlar, keyin cheklangan yangi so'zlar", () => {
    const states = {
      a: { box: 2, due: day - 5, seen: 1, lapses: 0 },
      b: { box: 3, due: day + 2, seen: 2, lapses: 0 },
      c: { box: 2, due: day - 1, seen: 1, lapses: 0 },
    };
    expect(buildQueue(["a", "b", "c", "d", "e", "f"], states, day, 2)).toEqual(["a", "c", "d", "e"]);
  });
  it("dayNumber mahalliy yarim tunda almashadi", () => {
    const a = dayNumber(new Date(2026, 0, 1, 0, 1));
    const b = dayNumber(new Date(2026, 0, 1, 23, 59));
    const c = dayNumber(new Date(2026, 0, 2, 0, 1));
    expect(b).toBe(a);
    expect(c).toBe(a + 1);
  });
});

describe("javobni tekshirish (lug'at)", () => {
  it("o'zbekcha: kichik/katta harf, apostrof turlari va kirill bir xil hisoblanadi", () => {
    expect(checkUz("O'ZBEK", ["o'zbek"]).verdict).toBe("correct");
    expect(checkUz("oʻzbek", ["o'zbek"]).verdict).toBe("correct");
    expect(checkUz("o’zbek", ["o'zbek"]).verdict).toBe("correct");
    expect(checkUz("ўзбек", ["o'zbek"]).verdict).toBe("correct");
    expect(checkUz("олма", ["olma"]).verdict).toBe("correct");
    expect(checkUz("мактаб.", ["maktab"]).verdict).toBe("correct");
  });

  it("bir nechta tarjimadan istalgani to'g'ri", () => {
    const answers = acceptedUz({ uz: "aka, uka" });
    expect(answers).toEqual(["aka", "uka"]);
    expect(checkUz("uka", answers).verdict).toBe("correct");
    expect(checkUz("opa", answers).verdict).toBe("wrong");
  });

  it("qavs ichidagi izoh tarjima hisoblanmaydi", () => {
    expect(acceptedUz({ uz: "majburiy (qonun bo'yicha)" })).toEqual(["majburiy"]);
  });

  it("apostrof tushib qolsa 'typo' (qabul, lekin imlo ko'rsatiladi)", () => {
    expect(checkUz("tog", ["tog'"])).toEqual({ verdict: "typo", matched: "tog'" });
    expect(checkUz("yoq", ["yo'q"]).verdict).toBe("typo");
  });

  it("bitta harf xato uzun so'zda qabul, qisqa so'zda yo'q", () => {
    expect(checkUz("maktap", ["maktab"]).verdict).toBe("typo");
    expect(checkUz("it", ["ot"]).verdict).toBe("wrong");
    expect(checkUz("uy", ["oy"]).verdict).toBe("wrong");
  });

  it("fe'lning -moq qismisiz ham qabul", () => {
    expect(checkUz("ye", ["yemoq"]).verdict).toBe("correct");
    expect(checkUz("yemoq", ["yemoq"]).verdict).toBe("correct");
  });

  it("bo'sh yoki noto'g'ri javob 'wrong'", () => {
    expect(checkUz("   ", ["olma"]).verdict).toBe("wrong");
    expect(checkUz("nok", ["olma"]).verdict).toBe("wrong");
  });

  it("inglizcha: 'to', 'a', 'the' va katta harf hisobga olinmaydi", () => {
    expect(checkEn("To Eat", ["eat"]).verdict).toBe("correct");
    expect(checkEn("the Book", ["book"]).verdict).toBe("correct");
    expect(checkEn("Thank  You", ["thank you"]).verdict).toBe("correct");
  });

  it("inglizcha: bitta harf xato 'typo', boshqa so'z 'wrong'", () => {
    expect(checkEn("enviroment", ["environment"]).verdict).toBe("typo");
    expect(checkEn("cat", ["car"]).verdict).toBe("wrong");
    expect(checkEn("beutiful", ["beautiful"])).toEqual({ verdict: "typo", matched: "beautiful" });
  });

  it("o'zbekchadan inglizchaga: bir xil tarjimali sinonimlar ham to'g'ri", () => {
    const famous = VOCAB.find((w) => w.id === "famous")!;
    const accepted = acceptedEnglish(famous, VOCAB);
    expect(accepted).toContain("famous");
    expect(accepted).toContain("popular");
  });

  it("lug'atdagi har bir so'zning o'z tarjimasi to'g'ri qabul qilinadi", () => {
    for (const w of VOCAB) {
      for (const answer of acceptedUz(w)) {
        expect(checkUz(answer, acceptedUz(w)).verdict, `${w.word}: ${answer}`).toBe("correct");
      }
      expect(checkEn(w.word, acceptedEnglish(w, VOCAB)).verdict, w.word).toBe("correct");
    }
  });
});

describe("speaking analysis", () => {
  const prompt = SPEAKING_PROMPTS[0]!;
  const good =
    "I prefer studying in the evening because it is quiet and I can concentrate better. For example my family is busy during the day, however after dinner the house becomes calm. As a result I finish more work in two hours than in the whole afternoon.";

  it("tezlikni hisoblaydi va vaqt noma'lum bo'lsa ravonlikni baholamaydi", () => {
    const withTime = analyseSpeech(good, 24, prompt);
    expect(withTime.wpm).toBe(Math.round(withTime.words / (24 / 60)));
    expect(withTime.bands.fluency).not.toBeNull();

    const noTime = analyseSpeech(good, null, prompt);
    expect(noTime.wpm).toBeNull();
    expect(noTime.bands.fluency).toBeNull();
    expect(noTime.overall).toBeGreaterThan(0);
  });

  it("to'ldiruvchi so'zlarni sanaydi va belgilaydi", () => {
    const r = analyseSpeech("um I think uh it is you know good um for students", 10, prompt);
    expect(r.fillers.find((f) => f.word === "um")?.count).toBe(2);
    expect(r.fillers.find((f) => f.word === "you know")?.count).toBe(1);
    expect(r.annotations.some((a) => a.quote === "uh")).toBe(true);
  });

  it("og'zaki nutqda qisqartma va kichik 'i' xato emas", () => {
    expect(findIssues("i don't know, it's fine", { spoken: true })).toEqual([]);
    expect(findIssues("i don't know", { spoken: false }).length).toBeGreaterThan(0);
  });

  it("juda sekin va qisqa javob ravonlikda past ball oladi", () => {
    const slow = analyseSpeech("I like mornings because quiet", 30, prompt);
    const fine = analyseSpeech(good, 24, prompt);
    expect(slow.bands.fluency!).toBeLessThan(fine.bands.fluency!);
    expect(slow.nextSteps.length).toBeGreaterThan(0);
  });
});

describe("imlo qoidalari", () => {
  it("ko'p uchraydigan imlo xatolarini topadi", () => {
    const fixes = Object.fromEntries(findIssues("I recieve it. The goverment and the enviroment.").map((i) => [i.quote, i.fix]));
    expect(fixes).toMatchObject({ recieve: "receive", goverment: "government", enviroment: "environment" });
  });
  it("yangi grammatika qoidalari ishlaydi", () => {
    const fixOf = (t: string) => findIssues(t).map((i) => [i.quote, i.fix]);
    expect(fixOf("I am agree with it.")).toContainEqual(["I am agree", "I agree"]);
    expect(fixOf("In the other hand, it is true.")).toContainEqual(["In the other hand", "on the other hand"]);
    expect(fixOf("He lives here since 5 years.")).toContainEqual(["since 5 years", "for 5 years"]);
  });
});

describe("shuffle", () => {
  const sequence = (values: number[]) => {
    let i = 0;
    return () => values[i++ % values.length]!;
  };

  it("elementlarni yo'qotmaydi va asl massivni o'zgartirmaydi", () => {
    const input = [1, 2, 3, 4, 5, 6];
    const out = shuffle(input);
    expect([...out].sort()).toEqual(input);
    expect(input).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it("bir xil rng bir xil natija beradi", () => {
    const a = shuffle(["a", "b", "c", "d"], sequence([0.1, 0.9, 0.5]));
    const b = shuffle(["a", "b", "c", "d"], sequence([0.1, 0.9, 0.5]));
    expect(a).toEqual(b);
  });

  it("to'g'ri javob matni aralashtirishdan keyin ham o'zgarmaydi", () => {
    const options = ["live", "have lived", "am living", "lived"];
    for (let trial = 0; trial < 200; trial++) {
      const s = shuffleChoices(options, 1);
      expect(s.options[s.answer]).toBe("have lived");
      expect([...s.options].sort()).toEqual([...options].sort());
    }
  });

  it("javob joyi har doim bir xil emas", () => {
    const positions = new Set<number>();
    for (let trial = 0; trial < 200; trial++) positions.add(shuffleChoices(["a", "b", "c", "d"], 0).answer);
    expect(positions.size).toBeGreaterThan(1);
  });
});

describe("buildSegments", () => {
  it("quote'larni matndan topib, ketma-ket bog'laydi", () => {
    const text = "People is happy. People is sad.";
    const ann = { quote: "People is", fix: "People are", why: "x" };
    const segs = buildSegments(text, [ann, ann]);
    expect(segs.filter((s) => s.annotation)).toHaveLength(2);
    expect(segs.map((s) => s.text).join("")).toBe(text);
  });
  it("topilmagan va ustma-ust tushgan belgilarni tashlaydi", () => {
    const text = "He dont know.";
    const segs = buildSegments(text, [
      { quote: "He dont", fix: "", why: "" },
      { quote: "dont know", fix: "", why: "" },
      { quote: "mavjud emas", fix: "", why: "" },
    ]);
    expect(segs.filter((s) => s.annotation)).toHaveLength(1);
    expect(segs.map((s) => s.text).join("")).toBe(text);
  });
});

describe("writing analysis", () => {
  const fixOf = (text: string) => findIssues(text).map((i) => [i.quote, i.fix]);

  it("odatiy xatolarni topadi", () => {
    expect(fixOf("Many peoples agree.")).toContainEqual(["peoples", "people"]);
    expect(fixOf("They need more informations.")).toContainEqual(["informations", "information"]);
    expect(fixOf("This is more better.")).toContainEqual(["more better", "better"]);
    expect(fixOf("Much people work.")).toContainEqual(["Much people", "many people"]);
    expect(fixOf("She go home.")).toContainEqual(["She go", "She goes"]);
    expect(fixOf("People is happy.")).toContainEqual(["People is", "people are"]);
    expect(fixOf("It depends of money.")).toContainEqual(["depends of", "depends on"]);
    expect(fixOf("We discuss about it.")).toContainEqual(["discuss about", "discuss"]);
    expect(fixOf("i think so.")).toContainEqual(["i", "I"]);
    expect(fixOf("It is the the best.")).toContainEqual(["the the", "the"]);
  });

  it("qisqartma va norasmiy so'zlarni belgilaydi", () => {
    expect(fixOf("They dont care.")).toContainEqual(["dont", "do not"]);
    expect(fixOf("It can't work.")).toContainEqual(["can't", "cannot"]);
    expect(fixOf("A lot of kids play.")).toContainEqual(["A lot of", "many / a great deal of"]);
  });

  it("to'g'ri matnda xato topmaydi", () => {
    expect(findIssues("However, many people believe that education matters.")).toEqual([]);
  });

  it("'I' yoki 'i.e.' ni xato deb hisoblamaydi", () => {
    expect(findIssues("I agree, i.e. the idea works.")).toEqual([]);
  });

  it("statistikani hisoblaydi", () => {
    const stats = measure("First point. However, second point!\n\nIn conclusion, done.");
    expect(stats.paragraphs).toBe(2);
    expect(stats.sentences).toBe(3);
    expect(stats.hasConclusion).toBe(true);
    expect(stats.linkers).toContain("however");
  });

  it("ballar 3.5 dan 7 gacha cheklangan", () => {
    const empty = estimateBands(measure(""), 0);
    expect(Object.values(empty).every((b) => b >= 3.5 && b <= 7)).toBe(true);
  });

  it("uzun va tartibli inshoga qisqa va xatoli insholardan yuqori ball beradi", () => {
    const good = Array.from({ length: 4 }, (_, i) =>
      `Paragraph ${i} explains an important idea. However, many people disagree. For example, cities grow quickly, therefore services improve. ${"Education creates opportunity and changes communities for the better over time. ".repeat(5)}`,
    ).join("\n\n") + "\n\nIn conclusion, the argument holds.";
    const weak = "i think peoples dont like it. it is good.";
    const hi = demoFeedback(good).bands;
    const lo = demoFeedback(weak).bands;
    expect(hi.task).toBeGreaterThan(lo.task);
    expect(hi.grammar).toBeGreaterThanOrEqual(lo.grammar);
    expect(demoFeedback(weak).annotations.length).toBeGreaterThan(0);
  });

  it("so'z talabi darajaga qarab o'zgaradi: 40 so'zli matn A1 uchun yetarli, IELTS uchun emas", () => {
    const text = "My name is Ali. I am twelve years old. I live in Tashkent with my family. I have a brother and a sister. I like football and I play it every day with my friends after school.";
    const beginner = demoFeedback(text, 30);
    const ielts = demoFeedback(text, 250);
    expect(beginner.bands.task).toBeGreaterThan(ielts.bands.task);
    expect(beginner.strengths.some((s) => s.includes("30"))).toBe(true);
    expect(ielts.nextSteps.some((s) => s.includes("250"))).toBe(true);
    // Qisqa matnda abzats va xulosa talab qilinmaydi
    expect(beginner.nextSteps.some((s) => s.includes("abzats"))).toBe(false);
  });

  it("qisqa inshoga leksika va bog'lanish uchun yuqori ball bermaydi", () => {
    const short = "However, many people work from home. Moreover, firms save money. Therefore, it is useful. For example, rent is lower.";
    const bands = demoFeedback(short).bands;
    expect(bands.lexical).toBeLessThanOrEqual(5.5);
    expect(bands.coherence).toBeLessThanOrEqual(5.5);
  });
});
