export type EssayType = "Opinion" | "Discussion" | "Problem and solution" | "Advantages and disadvantages";

export interface WritingPrompt {
  id: string;
  type: EssayType;
  topic: string;
  question: string;
  /** Qisqa strategiya: qanday tuzilma kerak. */
  plan: string;
}

export const WRITING_PROMPTS: WritingPrompt[] = [
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

export const MIN_WORDS = 250;
