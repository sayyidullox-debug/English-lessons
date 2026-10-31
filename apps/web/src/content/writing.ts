import type { Level } from "./vocab";

export type EssayType =
  | "Opinion"
  | "Discussion"
  | "Problem and solution"
  | "Advantages and disadvantages"
  | "Short text"
  | "Email";

export interface WritingPrompt {
  id: string;
  level: Level;
  type: EssayType;
  topic: string;
  question: string;
  /** Qisqa strategiya: qanday tuzilma kerak. */
  plan: string;
  /** Tavsiya etilgan eng kam so'z soni. */
  minWords: number;
}

type RawPrompt = Omit<WritingPrompt, "level" | "minWords"> & { level?: Level; minWords?: number };

const RAW_PROMPTS: RawPrompt[] = [
  {
    id: "about-me",
    level: "A1",
    minWords: 30,
    type: "Short text",
    topic: "O'zingiz haqingizda",
    question: "Write 5 or 6 sentences about yourself. Say your name, your age, where you live and what you like.",
    plan: "Har gap bitta fikr: My name is... I am... I live in... I like...",
  },
  {
    id: "my-family",
    level: "A1",
    minWords: 40,
    type: "Short text",
    topic: "Oilam",
    question: "Write about your family. Who is in your family? What do they do?",
    plan: "Oila a'zolarini sanang va har biri haqida bitta gap yozing (kasbi, yoshi).",
  },
  {
    id: "last-holiday",
    level: "A2",
    minWords: 60,
    type: "Short text",
    topic: "Oxirgi ta'til",
    question: "Write about your last holiday. Where did you go? What did you do? Did you like it?",
    plan: "O'tgan zamon (went, visited, ate) bilan yozing: qayerga, kim bilan, nima qildingiz.",
  },
  {
    id: "birthday-email",
    level: "B1",
    minWords: 100,
    type: "Email",
    topic: "Taklifnoma",
    question:
      "Write an email to a friend. Invite your friend to your birthday party. Tell them where and when it will be, and what you will do.",
    plan: "Salomlashuv, taklif sababi, joy va vaqt, dastur, xayrlashuv (Best wishes).",
  },
  {
    id: "city-or-village",
    level: "B1",
    minWords: 150,
    type: "Opinion",
    topic: "Shahar yoki qishloq",
    question: "Do you prefer living in a city or in a village? Give reasons for your answer.",
    plan: "Pozitsiya, ikkita sabab, qisqa xulosa. Because, for example, however dan foydalaning.",
  },
  {
    id: "remote-work",
    type: "Advantages and disadvantages",
    topic: "Ish",
    question:
      "More and more people now work from home instead of in an office. Do the advantages of this trend outweigh the disadvantages?",
    plan: "Kirish, ustunliklar abzatsi, kamchiliklar abzatsi, o'z fikringiz bilan xulosa.",
  },
  {
    id: "uniform",
    type: "Opinion",
    topic: "Ta'lim",
    question:
      "Some people believe that school students should wear a uniform, while others think they should choose their own clothes. To what extent do you agree or disagree that uniforms should be compulsory?",
    plan: "Kirishda pozitsiyangizni ayting, ikki dalil keltiring, xulosada takrorlang.",
  },
  {
    id: "public-transport",
    type: "Problem and solution",
    topic: "Shahar",
    question:
      "Traffic congestion is a growing problem in large cities. What are the main causes, and what measures could governments take to reduce it?",
    plan: "Sabablar abzatsi, yechimlar abzatsi, har yechim uchun misol.",
  },
  {
    id: "technology-children",
    type: "Discussion",
    topic: "Texnologiya",
    question:
      "Some people think children should be given tablets and computers from an early age. Others believe it is harmful. Discuss both views and give your own opinion.",
    plan: "Birinchi qarash, ikkinchi qarash, o'z fikringiz (aniq pozitsiya bilan).",
  },
  {
    id: "environment-individual",
    type: "Opinion",
    topic: "Ekologiya",
    question:
      "Some people say that protecting the environment is the responsibility of governments, not individuals. To what extent do you agree or disagree?",
    plan: "Hukumat roli, shaxsiy mas'uliyat, xulosada muvozanatli pozitsiya.",
  },
  {
    id: "foreign-languages",
    type: "Discussion",
    topic: "Til",
    question:
      "Some believe that learning a foreign language should start in primary school, while others think it is better to begin in secondary school. Discuss both views and give your opinion.",
    plan: "Ertaroq boshlash dalillari, keyinroq boshlash dalillari, o'z fikringiz.",
  },
];

/** Boshqa darajasi ko'rsatilmagan mavzular IELTS Task 2: kamida 250 so'z. */
export const WRITING_PROMPTS: WritingPrompt[] = RAW_PROMPTS.map((p) => ({
  ...p,
  level: p.level ?? "IELTS",
  minWords: p.minWords ?? 250,
}));
