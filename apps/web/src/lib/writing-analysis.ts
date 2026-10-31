import { roundBand } from "./band";
import type { Feedback, FeedbackAnnotation } from "./feedback";

/**
 * Demo rejim: AI kaliti bo'lmaganda ishlaydigan qoidaga asoslangan tahlil.
 * U mazmunni baholay olmaydi, faqat uzunlik, tuzilma, bog'lovchilar va
 * o'zbek o'quvchilari tez-tez qiladigan xatolarni ushlaydi. Ballar taxminiy.
 */

interface Rule {
  pattern: RegExp;
  fix: (match: RegExpMatchArray) => string;
  why: string;
}

const thirdPerson: Record<string, string> = { go: "goes", have: "has", do: "does" };
const uncountable: Record<string, string> = {
  informations: "information",
  advices: "advice",
  researches: "research",
  equipments: "equipment",
  knowledges: "knowledge",
  furnitures: "furniture",
  homeworks: "homework",
};
const informalWords: Record<string, string> = {
  "a lot of": "many / a great deal of",
  "lots of": "many / numerous",
  kids: "children",
  stuff: "items / materials",
  guys: "people",
  gonna: "going to",
  wanna: "want to",
};
const contractionFixes: Record<string, string> = {
  dont: "do not",
  doesnt: "does not",
  didnt: "did not",
  cant: "cannot",
  wont: "will not",
  isnt: "is not",
  arent: "are not",
};

const RULES: Rule[] = [
  {
    pattern: /\bpeoples\b/gi,
    fix: () => "people",
    why: "People o'zi ko'plik ma'nosini beradi, -s qo'shilmaydi.",
  },
  {
    pattern: /\b(informations|advices|researches|equipments|knowledges|furnitures|homeworks)\b/gi,
    fix: (m) => uncountable[m[0].toLowerCase()] ?? m[0],
    why: "Bu ot sanalmaydi, ko'plik shakli bo'lmaydi.",
  },
  {
    pattern: /\bmore (better|easier|harder|faster|bigger|cheaper|safer|healthier)\b/gi,
    fix: (m) => m[1] ?? "",
    why: "Qiyoslash darajasi bitta marta ifodalanadi: 'more' va '-er' birga kelmaydi.",
  },
  {
    pattern: /\bmuch (people|students|cars|children|countries)\b/gi,
    fix: (m) => `many ${m[1]}`,
    why: "Sanaladigan otlar bilan many ishlatiladi.",
  },
  {
    pattern: /\bless (people|students|cars|children|jobs)\b/gi,
    fix: (m) => `fewer ${m[1]}`,
    why: "Sanaladigan otlar bilan fewer ishlatiladi.",
  },
  {
    pattern: /\b(he|she|it) (go|have|do|want|need|think|make)\b/gi,
    fix: (m) => {
      const verb = (m[2] ?? "").toLowerCase();
      return `${m[1]} ${thirdPerson[verb] ?? `${verb}s`}`;
    },
    why: "Uchinchi shaxs birlikda fe'lga -s qo'shiladi (Present Simple).",
  },
  {
    pattern: /\bpeople is\b/gi,
    fix: () => "people are",
    why: "People ko'plik hisoblanadi, shuning uchun are ishlatiladi.",
  },
  {
    pattern: /\bdespite of\b/gi,
    fix: () => "despite",
    why: "'Despite' dan keyin of kelmaydi (yoki 'in spite of' deng).",
  },
  {
    pattern: /\b(discuss|mention|emphasi[sz]e|explain) (about|on)\b/gi,
    fix: (m) => m[1] ?? "",
    why: "Bu fe'l predlogsiz ishlatiladi.",
  },
  {
    pattern: /\bdepend(s|ed)? (of|from)\b/gi,
    fix: (m) => `depend${m[1] ?? ""} on`,
    why: "Depend fe'li on predlogi bilan keladi.",
  },
  {
    pattern: /\b(dont|doesnt|didnt|cant|wont|isnt|arent)\b/gi,
    fix: (m) => contractionFixes[m[0].toLowerCase()] ?? m[0],
    why: "IELTS Writing rasmiy uslubda yoziladi: qisqartmalarsiz.",
  },
  {
    pattern: /\b\w+n't\b|\b(?:i|you|we|they)'(?:re|ve|ll|d|m)\b/gi,
    fix: (m) => {
      const w = m[0].toLowerCase();
      if (w === "can't") return "cannot";
      if (w === "won't") return "will not";
      return w.endsWith("n't") ? `${w.slice(0, -3)} not` : w;
    },
    why: "Qisqartmalar so'zlashuv uslubi. Inshoda to'liq yozing.",
  },
  {
    pattern: /\b(a lot of|lots of|kids|stuff|guys|gonna|wanna)\b/gi,
    fix: (m) => informalWords[m[0].toLowerCase()] ?? m[0],
    why: "Bu so'z norasmiy. Akademik uslub uchun boshqasini tanlang.",
  },
  {
    pattern: /\bin my opinion,? I think\b/gi,
    fix: () => "In my opinion",
    why: "Ikkalasi bir ma'noni beradi, bittasi yetarli.",
  },
  {
    pattern: /\b(?!had\b|that\b)(\w{2,}) \1\b/gi,
    fix: (m) => m[1] ?? "",
    why: "So'z tasodifan ikki marta yozilgan.",
  },
];

const LOWERCASE_I = /(?<![\w'])i(?![\w'.])/g;

export function findIssues(essay: string): FeedbackAnnotation[] {
  const issues: Array<FeedbackAnnotation & { index: number }> = [];

  for (const rule of RULES) {
    for (const match of essay.matchAll(rule.pattern)) {
      issues.push({
        index: match.index ?? 0,
        quote: match[0],
        fix: rule.fix(match),
        why: rule.why,
      });
    }
  }
  for (const match of essay.matchAll(LOWERCASE_I)) {
    issues.push({
      index: match.index ?? 0,
      quote: match[0],
      fix: "I",
      why: "Ingliz tilida 'I' har doim bosh harf bilan yoziladi.",
    });
  }

  return issues.sort((a, b) => a.index - b.index).map(({ quote, fix, why }) => ({ quote, fix, why }));
}

const LINKERS = [
  "however",
  "moreover",
  "furthermore",
  "in addition",
  "on the other hand",
  "for example",
  "for instance",
  "as a result",
  "therefore",
  "consequently",
  "in contrast",
  "nevertheless",
  "although",
  "whereas",
  "firstly",
  "secondly",
  "finally",
  "overall",
  "despite",
];
const CONCLUSION = /\b(in conclusion|to conclude|to sum up|in summary|overall)\b/i;

export interface EssayStats {
  words: number;
  sentences: number;
  paragraphs: number;
  avgSentenceLength: number;
  lexicalDiversity: number;
  linkers: string[];
  hasConclusion: boolean;
}

export function measure(essay: string): EssayStats {
  const tokens = essay.toLowerCase().match(/[\p{L}][\p{L}'’-]*/gu) ?? [];
  const sentences = essay.split(/[.!?]+(?:\s|$)/).filter((s) => s.trim().length > 0).length;
  const paragraphs = essay.split(/\n\s*\n/).filter((p) => p.trim().length > 0).length;
  const sample = tokens.slice(0, 250);
  const lower = essay.toLowerCase();
  return {
    words: tokens.length,
    sentences,
    paragraphs,
    avgSentenceLength: sentences === 0 ? 0 : tokens.length / sentences,
    lexicalDiversity: sample.length === 0 ? 0 : new Set(sample).size / sample.length,
    linkers: LINKERS.filter((l) => new RegExp(`\\b${l}\\b`).test(lower)),
    hasConclusion: CONCLUSION.test(essay),
  };
}

const clamp = (value: number) => Math.min(7, Math.max(3.5, roundBand(value)));

export function estimateBands(stats: EssayStats, issueCount: number): Feedback["bands"] {
  let task = stats.words >= 250 ? 6.5 : stats.words >= 200 ? 6 : stats.words >= 150 ? 5 : 4;
  if (stats.hasConclusion) task += 0.5;
  if (stats.paragraphs >= 4) task += 0.5;

  const linkerCount = stats.linkers.length;
  let coherence = linkerCount >= 7 ? 7 : linkerCount >= 5 ? 6.5 : linkerCount >= 3 ? 6 : linkerCount >= 1 ? 5.5 : 4.5;
  if (stats.paragraphs < 3) coherence -= 1;

  const d = stats.lexicalDiversity;
  let lexical = d >= 0.65 ? 7 : d >= 0.55 ? 6.5 : d >= 0.47 ? 6 : d >= 0.4 ? 5.5 : 5;

  // Qisqa inshoda so'z xilma-xilligi va bog'lanish haqida ishonchli xulosa qilib bo'lmaydi
  const lengthCap = stats.words < 150 ? 5.5 : stats.words < 250 ? 6.5 : 7;
  coherence = Math.min(coherence, lengthCap);
  lexical = Math.min(lexical, lengthCap);

  const per100 = stats.words === 0 ? 0 : (issueCount / stats.words) * 100;
  let grammar = per100 === 0 ? 7 : per100 <= 1 ? 6.5 : per100 <= 2 ? 6 : per100 <= 4 ? 5.5 : 5;
  if (stats.avgSentenceLength < 10) grammar -= 0.5;

  return {
    task: clamp(task),
    coherence: clamp(coherence),
    lexical: clamp(lexical),
    grammar: clamp(grammar),
  };
}

export function demoFeedback(essay: string): Feedback {
  const stats = measure(essay);
  const annotations = findIssues(essay).slice(0, 14);
  const bands = estimateBands(stats, annotations.length);

  const strengths: string[] = [];
  const nextSteps: string[] = [];

  if (stats.words >= 250) strengths.push("Hajm talabga mos: 250 so'zdan oshgan.");
  else nextSteps.push(`Hozir ${stats.words} so'z. Task 2 uchun kamida 250 so'z yozing.`);

  if (stats.paragraphs >= 4) strengths.push("Insho abzatslarga bo'lingan: kirish, asosiy qism va xulosa ko'rinadi.");
  else nextSteps.push("Inshoni kamida 4 abzatsga bo'ling: kirish, ikkita asosiy abzats, xulosa.");

  if (stats.linkers.length >= 4) strengths.push(`Bog'lovchilar yaxshi: ${stats.linkers.slice(0, 4).join(", ")}.`);
  else nextSteps.push("Fikrlarni bog'lang: however, moreover, as a result kabi iboralardan foydalaning.");

  if (!stats.hasConclusion) nextSteps.push("Oxirida xulosa abzatsi qo'shing ('In conclusion, ...').");
  if (annotations.length > 0) nextSteps.push("Qizil qalam bilan belgilangan xatolarni tuzatib, inshoni qayta tekshiring.");
  if (stats.lexicalDiversity < 0.5) nextSteps.push("So'zlar takrorlanyapti. Sinonimlardan foydalaning (Lug'at bo'limidagi so'zlar yordam beradi).");

  const summary =
    annotations.length === 0
      ? "Qoidaga asoslangan tekshiruvda belgilangan xato topilmadi. Demo rejim mazmunni baholay olmaydi, shuning uchun to'liq tekshiruv uchun AI kalitini ulang."
      : `Demo tekshiruv ${annotations.length} ta joyni belgiladi. Bu rejim mazmunni baholamaydi: ballar uzunlik, tuzilma va xatolar soniga qarab taxmin qilingan.`;

  return {
    bands,
    summary,
    annotations,
    strengths: strengths.slice(0, 4),
    nextSteps: nextSteps.slice(0, 4),
  };
}
