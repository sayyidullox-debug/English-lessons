export type TfngAnswer = "true" | "false" | "not-given";

export type ReadingQuestion =
  | { id: string; kind: "tfng"; statement: string; answer: TfngAnswer; evidence: string }
  | { id: string; kind: "choice"; statement: string; options: string[]; answer: number; evidence: string };

export interface ReadingPassage {
  id: string;
  title: string;
  minutes: number;
  paragraphs: string[];
  questions: ReadingQuestion[];
}

export const PASSAGES: ReadingPassage[] = [
  {
    id: "farming-without-fields",
    title: "Farming Without Fields",
    minutes: 12,
    paragraphs: [
      "Vertical farming, the practice of growing crops in stacked trays inside buildings, was long dismissed as an expensive curiosity. Plants in these farms grow without soil: their roots sit in a thin stream of water enriched with nutrients, while rows of LED lights replace the sun. Because the water is collected and reused, some systems claim to need up to ninety per cent less water than a conventional field.",
      "The early years were difficult. Lights and climate control consumed enormous amounts of electricity, and several well-funded start-ups closed after only a few seasons. The cost of running a single warehouse often exceeded the value of the lettuce it produced, and investors lost patience.",
      "More recently, the economics have begun to change. LED bulbs now convert electricity into usable light far more efficiently than they did a decade ago, and a number of companies have signed contracts to run their farms entirely on wind or solar power. Supermarkets, meanwhile, have discovered that shoppers will pay a premium for herbs and salad leaves that are grown close to the city, picked the same morning, and free of pesticides.",
      "Even so, the technology has clear limits. Wheat, rice and other staple grains need far more light and space than a stacked tray can offer, and researchers agree that vertical farms are unlikely to replace field agriculture for these crops in the foreseeable future. Their strength lies elsewhere: supplying fresh, perishable produce to crowded cities where land is scarce and transport is costly.",
      "Whether vertical farming will grow beyond this niche remains an open question. Supporters point to falling energy costs; sceptics note that every new farm still depends on a stable electricity supply. What is certain is that the idea, once a curiosity, now deserves serious attention.",
    ],
    questions: [
      {
        id: "r1",
        kind: "tfng",
        statement: "Plants in vertical farms are grown in soil.",
        answer: "false",
        evidence: "1-abzats: 'Plants in these farms grow without soil'.",
      },
      {
        id: "r2",
        kind: "tfng",
        statement: "Early vertical farms struggled mainly because of high electricity use.",
        answer: "true",
        evidence: "2-abzats: lampa va iqlim nazorati juda ko'p elektr sarflagan, korxonalar yopilgan.",
      },
      {
        id: "r3",
        kind: "tfng",
        statement: "LED bulbs are less efficient now than they were ten years ago.",
        answer: "false",
        evidence: "3-abzats: LED lampalar 'far more efficiently' ishlaydi.",
      },
      {
        id: "r4",
        kind: "tfng",
        statement: "Some companies now power their vertical farms with renewable energy.",
        answer: "true",
        evidence: "3-abzats: 'a number of companies have signed contracts to run their farms on wind or solar power'.",
      },
      {
        id: "r5",
        kind: "tfng",
        statement: "Researchers expect vertical farms to replace wheat fields soon.",
        answer: "false",
        evidence: "4-abzats: bunday o'rin almashishi 'unlikely ... in the foreseeable future'.",
      },
      {
        id: "r6",
        kind: "tfng",
        statement: "Vertical farms are more common in Asia than in Europe.",
        answer: "not-given",
        evidence: "Matnda joylashuv bo'yicha taqqoslash yo'q: bu ma'lumot berilmagan.",
      },
      {
        id: "r7",
        kind: "choice",
        statement: "According to the fourth paragraph, vertical farms are best suited to growing",
        options: [
          "staple grains for export",
          "fresh produce that spoils quickly",
          "crops that need large areas",
          "plants that grow only in winter",
        ],
        answer: 1,
        evidence: "4-abzats: 'fresh, perishable produce to crowded cities'.",
      },
      {
        id: "r8",
        kind: "choice",
        statement: "The writer's attitude towards vertical farming is best described as",
        options: ["dismissive", "cautiously positive", "strongly opposed", "indifferent"],
        answer: 1,
        evidence: "5-abzats: tomonlarni keltiradi, lekin g'oya 'deserves serious attention' deydi.",
      },
    ],
  },
];
