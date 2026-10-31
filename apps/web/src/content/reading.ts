import type { Level } from "./vocab";

export type TfngAnswer = "true" | "false" | "not-given";

export type ReadingQuestion =
  | { id: string; kind: "tfng"; statement: string; answer: TfngAnswer; evidence: string }
  | { id: string; kind: "choice"; statement: string; options: string[]; answer: number; evidence: string };

export interface ReadingPassage {
  id: string;
  level: Level;
  title: string;
  minutes: number;
  paragraphs: string[];
  questions: ReadingQuestion[];
}

export const PASSAGES: ReadingPassage[] = [
  {
    id: "day-at-the-market",
    level: "A2",
    title: "A Day at the Market",
    minutes: 6,
    paragraphs: [
      "Every Saturday, Dilnoza goes to the market with her mother. They leave home at eight o'clock because the market is busy after ten.",
      "First, they buy vegetables. Her mother likes tomatoes and carrots, but Dilnoza prefers cucumbers. Then they buy fresh bread from a small shop near the gate.",
      "At lunchtime, they are tired and hungry. They sit in a small cafe and eat plov. Dilnoza drinks green tea, and her mother drinks a cup of coffee.",
      "After lunch, they walk home. Dilnoza carries the bread, and her mother carries the heavy bags. In the afternoon, Dilnoza helps to cook dinner. She loves Saturdays.",
    ],
    questions: [
      {
        id: "m1",
        kind: "tfng",
        statement: "Dilnoza goes to the market every Sunday.",
        answer: "false",
        evidence: "1-abzats: 'Every Saturday', ya'ni shanba kuni.",
      },
      {
        id: "m2",
        kind: "tfng",
        statement: "They leave home early because the market is busy after ten o'clock.",
        answer: "true",
        evidence: "1-abzats: 'They leave home at eight o'clock because the market is busy after ten'.",
      },
      {
        id: "m3",
        kind: "tfng",
        statement: "Dilnoza's mother likes cucumbers best.",
        answer: "false",
        evidence: "2-abzats: onasi pomidor va sabzini yaxshi ko'radi, bodringni Dilnoza afzal ko'radi.",
      },
      {
        id: "m4",
        kind: "tfng",
        statement: "They eat lunch in a cafe.",
        answer: "true",
        evidence: "3-abzats: 'They sit in a small cafe and eat plov'.",
      },
      {
        id: "m5",
        kind: "tfng",
        statement: "Dilnoza's father stays at home on Saturdays.",
        answer: "not-given",
        evidence: "Matnda otasi haqida gap yo'q: ma'lumot berilmagan.",
      },
      {
        id: "m6",
        kind: "choice",
        statement: "Who carries the heavy bags?",
        options: ["Dilnoza", "Her mother", "Her father", "The shopkeeper"],
        answer: 1,
        evidence: "4-abzats: 'her mother carries the heavy bags'.",
      },
      {
        id: "m7",
        kind: "choice",
        statement: "What does Dilnoza drink at lunch?",
        options: ["Coffee", "Green tea", "Milk", "Water"],
        answer: 1,
        evidence: "3-abzats: 'Dilnoza drinks green tea'.",
      },
    ],
  },
  {
    id: "why-we-need-sleep",
    level: "B1",
    title: "Why We Need Sleep",
    minutes: 9,
    paragraphs: [
      "Many people think that sleep is simply a time when the body rests. Scientists now know that this is not true. While we sleep, the brain is busy sorting the information it received during the day.",
      "In one experiment, students learned a list of words in the evening. Half of them slept for eight hours, and the others stayed awake all night. The next day, the students who had slept remembered far more words than those who had not.",
      "Lack of sleep also affects our mood and health. People who sleep less than six hours a night are more likely to feel anxious, and they catch colds more often. Some studies suggest that they may also gain weight more easily, although researchers are still investigating the reasons.",
      "Experts give simple advice to help people sleep well. They recommend going to bed at the same time every night, avoiding coffee in the afternoon, and turning off phones an hour before sleep. The light from screens, they explain, tells the brain that it is still daytime.",
    ],
    questions: [
      {
        id: "s1",
        kind: "tfng",
        statement: "Scientists believe the brain is inactive during sleep.",
        answer: "false",
        evidence: "1-abzats: miya uyqu paytida 'busy sorting the information'.",
      },
      {
        id: "s2",
        kind: "tfng",
        statement: "In the experiment, all the students stayed awake all night.",
        answer: "false",
        evidence: "2-abzats: talabalarning yarmi sakkiz soat uxlagan.",
      },
      {
        id: "s3",
        kind: "tfng",
        statement: "The students who slept remembered more words the next day.",
        answer: "true",
        evidence: "2-abzats: uxlaganlar 'far more words' eslab qolgan.",
      },
      {
        id: "s4",
        kind: "tfng",
        statement: "People who sleep less than six hours catch colds more often.",
        answer: "true",
        evidence: "3-abzats: 'they catch colds more often'.",
      },
      {
        id: "s5",
        kind: "tfng",
        statement: "Researchers have proved that lack of sleep causes weight gain.",
        answer: "false",
        evidence: "3-abzats: faqat 'suggest ... may', sabablar hali o'rganilmoqda.",
      },
      {
        id: "s6",
        kind: "tfng",
        statement: "Drinking coffee in the morning is bad for sleep.",
        answer: "not-given",
        evidence: "Matnda faqat tushdan keyingi qahva eslatilgan, ertalabki haqida gap yo'q.",
      },
      {
        id: "s7",
        kind: "choice",
        statement: "Why should people turn off their phones before sleep?",
        options: [
          "The light tells the brain that it is still daytime",
          "Phones are very expensive",
          "Phones make too much noise at night",
          "The battery may explode",
        ],
        answer: 0,
        evidence: "4-abzats: ekran nuri miyaga hali kunduz deb xabar beradi.",
      },
    ],
  },
  {
    id: "farming-without-fields",
    level: "IELTS",
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
  {
    id: "four-day-week",
    level: "IELTS",
    title: "The Four-Day Week",
    minutes: 12,
    paragraphs: [
      "For more than a century, the five-day working week has been treated as a natural law. Yet in recent years a growing number of companies have tested a simple alternative: the same pay for four days of work, with the fifth day free.",
      "The results of the largest trials have surprised many sceptics. In one study involving over sixty firms, most managers reported that productivity stayed the same or improved. Employees took fewer sick days, and a significant proportion said they felt less stressed. Few of the companies chose to return to five days once the trial ended.",
      "Critics, however, point out that the experiments attracted firms that were already enthusiastic about the idea. Offices, where much of the work involves meetings and screens, adapted easily. Hospitals, restaurants and factories, which must be staffed every day, found the change far harder, and some had to hire extra workers to cover the missing hours.",
      "Supporters argue that the benefits go beyond the workplace. With an extra free day, parents spend more time with their children, and workers have more time for exercise and volunteering. Some economists add that shorter weeks may reduce commuting and so lower carbon emissions, although the evidence for this is still limited.",
      "Whether governments should encourage the change remains disputed. What the trials do suggest is that long hours are not always the same as productive hours, and that the five-day week may owe more to habit than to necessity.",
    ],
    questions: [
      {
        id: "w1",
        kind: "tfng",
        statement: "Employees in the trials received lower pay for working four days.",
        answer: "false",
        evidence: "1-abzats: 'the same pay for four days of work'.",
      },
      {
        id: "w2",
        kind: "tfng",
        statement: "In one large study, most managers said productivity fell.",
        answer: "false",
        evidence: "2-abzats: ko'pchilik rahbarlar unumdorlik o'zgarmagan yoki oshgan deb aytgan.",
      },
      {
        id: "w3",
        kind: "tfng",
        statement: "More than sixty companies took part in one of the studies.",
        answer: "true",
        evidence: "2-abzats: 'a study involving over sixty firms'.",
      },
      {
        id: "w4",
        kind: "tfng",
        statement: "Hospitals found it easy to switch to a four-day week.",
        answer: "false",
        evidence: "3-abzats: kasalxonalar uchun o'zgarish 'far harder' bo'lgan.",
      },
      {
        id: "w5",
        kind: "tfng",
        statement: "It has been proved that shorter working weeks lower carbon emissions.",
        answer: "false",
        evidence: "4-abzats: bu haqdagi dalil 'still limited', ya'ni isbotlanmagan.",
      },
      {
        id: "w6",
        kind: "tfng",
        statement: "Most of the companies in the trials were based in Europe.",
        answer: "not-given",
        evidence: "Matnda kompaniyalar joylashuvi haqida gap yo'q: ma'lumot berilmagan.",
      },
      {
        id: "w7",
        kind: "choice",
        statement: "Critics say the trial results may be unrepresentative because",
        options: [
          "the firms involved were already keen on the idea",
          "all the firms were very small",
          "the workers received no extra pay",
          "the trials lasted only a few days",
        ],
        answer: 0,
        evidence: "3-abzats: tajribalar 'already enthusiastic' kompaniyalarni jalb qilgan.",
      },
      {
        id: "w8",
        kind: "choice",
        statement: "The writer concludes that",
        options: [
          "a four-day week is suitable for every workplace",
          "the five-day week may be more a habit than a necessity",
          "governments must introduce a shorter week immediately",
          "productivity always rises when hours are reduced",
        ],
        answer: 1,
        evidence: "5-abzats: 'the five-day week may owe more to habit than to necessity'.",
      },
    ],
  },
];
