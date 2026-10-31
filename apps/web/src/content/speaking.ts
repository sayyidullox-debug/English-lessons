export type SpeakingPart = 1 | 2 | 3;

export interface SpeakingPrompt {
  id: string;
  part: SpeakingPart;
  question: string;
  /** Part 2 kartochkasidagi "You should say" bandlari. */
  bullets?: string[];
  /** Tavsiya etilgan javob uzunligi. */
  words: { min: number; max: number };
  seconds: { min: number; max: number };
}

export const PART_LABEL: Record<SpeakingPart, string> = {
  1: "Part 1: tanishuv savollari",
  2: "Part 2: kartochka",
  3: "Part 3: muhokama",
};

const PART1 = { words: { min: 40, max: 100 }, seconds: { min: 20, max: 45 } } as const;
const PART2 = { words: { min: 140, max: 300 }, seconds: { min: 60, max: 120 } } as const;
const PART3 = { words: { min: 70, max: 150 }, seconds: { min: 30, max: 60 } } as const;

export const SPEAKING_PROMPTS: SpeakingPrompt[] = [
  { id: "p1-study-time", part: 1, question: "Do you prefer studying in the morning or in the evening? Why?", ...PART1 },
  { id: "p1-weekends", part: 1, question: "What do you usually do at weekends?", ...PART1 },
  { id: "p1-hometown", part: 1, question: "Can you tell me about the town or city where you grew up?", ...PART1 },
  { id: "p1-transport", part: 1, question: "How do you usually travel to school, university or work?", ...PART1 },
  {
    id: "p2-helpful-person",
    part: 2,
    question: "Describe a person who has helped you in your life.",
    bullets: [
      "who the person is",
      "how you know them",
      "how they helped you",
      "and explain why this help was important to you",
    ],
    ...PART2,
  },
  {
    id: "p2-place-to-visit",
    part: 2,
    question: "Describe a place you would like to visit in the future.",
    bullets: [
      "where the place is",
      "how you would travel there",
      "what you would do there",
      "and explain why you want to go",
    ],
    ...PART2,
  },
  {
    id: "p3-communication",
    part: 3,
    question: "How has technology changed the way people communicate with each other?",
    ...PART3,
  },
  {
    id: "p3-cooking",
    part: 3,
    question: "Do you think children should learn to cook at school? Why or why not?",
    ...PART3,
  },
];

/** Part 2 da tayyorlanish vaqti (soniya). */
export const PREP_SECONDS = 60;
