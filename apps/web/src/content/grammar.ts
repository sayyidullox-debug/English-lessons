export type GrammarTopic = "tenses" | "articles" | "conditionals" | "prepositions" | "comparison" | "forms";

export const TOPIC_LABEL: Record<GrammarTopic, string> = {
  tenses: "Zamonlar",
  articles: "Artikllar",
  conditionals: "Shart gaplar",
  prepositions: "Predloglar",
  comparison: "Qiyoslash",
  forms: "Aniq daraja va so'z shakli",
};

export interface GrammarQuestion {
  id: string;
  topic: GrammarTopic;
  /** Bo'sh joy `____` bilan belgilanadi. */
  sentence: string;
  options: [string, string, string, string];
  answer: number;
  /** Nima uchun shunday: o'zbekcha tushuntirish. */
  explanation: string;
}

export const GRAMMAR: GrammarQuestion[] = [
  {
    id: "t1",
    topic: "tenses",
    sentence: "By the time the manager arrived, the meeting ____.",
    options: ["had already finished", "has already finished", "already finishes", "was already finish"],
    answer: 0,
    explanation:
      "Ikki o'tgan voqeadan oldin bo'lgani Past Perfect (had + V3) bilan ifodalanadi: yig'ilish menejer kelishidan oldin tugagan.",
  },
  {
    id: "t2",
    topic: "tenses",
    sentence: "I ____ in this city since 2019.",
    options: ["live", "have lived", "am living", "lived"],
    answer: 1,
    explanation:
      "'Since 2019' o'tmishdan hozirgacha davom etayotgan holatni bildiradi, shuning uchun Present Perfect (have lived) ishlatiladi.",
  },
  {
    id: "t3",
    topic: "tenses",
    sentence: "Scientists ____ a new vaccine at the moment.",
    options: ["develop", "have developed", "are developing", "developed"],
    answer: 2,
    explanation: "'At the moment' hozir davom etayotgan ish: Present Continuous (are + V-ing).",
  },
  {
    id: "t4",
    topic: "tenses",
    sentence: "She ____ for the exam when the power went out.",
    options: ["studied", "was studying", "has studied", "studies"],
    answer: 1,
    explanation:
      "Boshqa voqea (elektr o'chdi) sodir bo'lgan paytda davom etayotgan ish uchun Past Continuous ishlatiladi.",
  },
  {
    id: "a1",
    topic: "articles",
    sentence: "She is ____ honest person.",
    options: ["a", "an", "the", "-"],
    answer: 1,
    explanation:
      "Artikl yozuvga emas, ovozga qarab tanlanadi. 'Honest' so'zida h aytilmaydi, unli ovoz bilan boshlanadi: an.",
  },
  {
    id: "a2",
    topic: "articles",
    sentence: "____ Sun rises in the east.",
    options: ["A", "An", "The", "-"],
    answer: 2,
    explanation: "Yagona noyob narsalar (the Sun, the Moon, the sky) oldida the ishlatiladi.",
  },
  {
    id: "a3",
    topic: "articles",
    sentence: "He plays ____ guitar very well.",
    options: ["a", "an", "-", "the"],
    answer: 3,
    explanation: "Musiqa asboblari bilan 'play' dan keyin the qo'yiladi: play the guitar.",
  },
  {
    id: "a4",
    topic: "articles",
    sentence: "I need ____ advice about my studies.",
    options: ["an", "some", "a", "many"],
    answer: 1,
    explanation:
      "Advice sanalmaydigan ot, uning oldiga a/an qo'yilmaydi. Ko'plik shakli ham yo'q. Some yoki a piece of advice deyiladi.",
  },
  {
    id: "c1",
    topic: "conditionals",
    sentence: "If I ____ more time, I would learn French.",
    options: ["have", "had", "will have", "would have"],
    answer: 1,
    explanation:
      "Second Conditional (hozirgi xayoliy holat): if + Past Simple, would + fe'l. If dan keyin would ishlatilmaydi.",
  },
  {
    id: "c2",
    topic: "conditionals",
    sentence: "If she had studied harder, she ____ the exam.",
    options: ["would pass", "will pass", "would have passed", "had passed"],
    answer: 2,
    explanation:
      "Third Conditional (o'tmishdagi o'zgarmas holat): if + Past Perfect, would have + V3.",
  },
  {
    id: "c3",
    topic: "conditionals",
    sentence: "Unless you ____ now, you will miss the train.",
    options: ["leave", "will leave", "left", "would leave"],
    answer: 0,
    explanation:
      "'Unless' = 'if ... not'. Shart qismida kelasi zamon o'rniga Present Simple ishlatiladi: unless you leave.",
  },
  {
    id: "c4",
    topic: "conditionals",
    sentence: "I wish I ____ taller.",
    options: ["am", "was being", "were", "would be"],
    answer: 2,
    explanation:
      "'Wish' dan keyin hozirgi afsus uchun Past Simple ishlatiladi. Rasmiy ingliz tilida barcha shaxslar bilan were keladi.",
  },
  {
    id: "p1",
    topic: "prepositions",
    sentence: "She is very interested ____ environmental issues.",
    options: ["on", "in", "at", "for"],
    answer: 1,
    explanation: "Interested fe'l-sifatidan keyin in predlogi keladi: interested in.",
  },
  {
    id: "p2",
    topic: "prepositions",
    sentence: "The success of the project depends ____ teamwork.",
    options: ["of", "from", "on", "to"],
    answer: 2,
    explanation: "Depend fe'li doim on bilan ishlatiladi: depend on. 'Depend of/from' xato.",
  },
  {
    id: "p3",
    topic: "prepositions",
    sentence: "He apologised ____ being late.",
    options: ["for", "of", "about", "at"],
    answer: 0,
    explanation: "Apologise for something: biror narsa uchun uzr so'ramoq.",
  },
  {
    id: "p4",
    topic: "prepositions",
    sentence: "They have lived here ____ ten years.",
    options: ["since", "from", "for", "during"],
    answer: 2,
    explanation:
      "For davomiylikni bildiradi (ten years), since esa boshlanish nuqtasini (since 2015).",
  },
  {
    id: "m1",
    topic: "comparison",
    sentence: "This exam was ____ than I expected.",
    options: ["more hard", "harder", "hardest", "the harder"],
    answer: 1,
    explanation:
      "Bir bo'g'inli sifatlarga -er qo'shiladi: harder than. 'More hard' xato.",
  },
  {
    id: "m2",
    topic: "comparison",
    sentence: "She is the ____ student in the class.",
    options: ["more intelligent", "most intelligent", "intelligenter", "intelligentest"],
    answer: 1,
    explanation:
      "Uch bo'g'inli sifatlarda eng yuqori daraja most bilan yasaladi: the most intelligent.",
  },
  {
    id: "m3",
    topic: "comparison",
    sentence: "The more you practise, ____ you become.",
    options: ["the better", "better", "the best", "more better"],
    answer: 0,
    explanation: "'The more..., the better...' qolipi: ikkala qismda ham the + qiyoslash darajasi.",
  },
  {
    id: "m4",
    topic: "comparison",
    sentence: "Cars are not ____ expensive as houses.",
    options: ["so much", "as", "than", "more"],
    answer: 1,
    explanation: "Tenglik 'as ... as' bilan bildiriladi, inkorda 'not as ... as'.",
  },
  {
    id: "f1",
    topic: "forms",
    sentence: "The report ____ by the committee yesterday.",
    options: ["approved", "was approved", "is approved", "has approving"],
    answer: 1,
    explanation: "'Yesterday' o'tgan zamon, hisobotni kimdir tasdiqlagan: Passive Past Simple (was + V3).",
  },
  {
    id: "f2",
    topic: "forms",
    sentence: "English ____ in many countries around the world.",
    options: ["speaks", "is spoken", "is speaking", "spoken"],
    answer: 1,
    explanation: "Til o'zi gapirmaydi, unda gapiriladi: Passive Present Simple (is/are + V3).",
  },
  {
    id: "f3",
    topic: "forms",
    sentence: "Her ____ to the project was invaluable.",
    options: ["contribute", "contributes", "contribution", "contributing"],
    answer: 2,
    explanation:
      "Egalik olmoshi (her) dan keyin ot keladi. Contribute fe'l, contribution esa uning oti.",
  },
  {
    id: "f4",
    topic: "forms",
    sentence: "He spoke ____ about the problem.",
    options: ["confident", "confidence", "confidently", "confidential"],
    answer: 2,
    explanation: "Fe'lni (spoke) ravish aniqlaydi: confidently. Sifat faqat otni aniqlaydi.",
  },
  {
    id: "t5",
    topic: "tenses",
    sentence: "I ____ my keys. Can you help me look for them?",
    options: ["lost", "have lost", "was losing", "lose"],
    answer: 1,
    explanation: "Natija hozir ham muhim (kalitlar yo'q): Present Perfect (have lost). O'tgan vaqt aytilmagan.",
  },
  {
    id: "t6",
    topic: "tenses",
    sentence: "By next June, they ____ the bridge.",
    options: ["will complete", "will have completed", "are completing", "completed"],
    answer: 1,
    explanation: "'By next June' kelajakdagi muddatgacha tugallangan ish: Future Perfect (will have + V3).",
  },
  {
    id: "t7",
    topic: "tenses",
    sentence: "When I was a child, we ____ to the sea every summer.",
    options: ["are used to go", "use to going", "used to go", "were used to go"],
    answer: 2,
    explanation: "O'tmishdagi odat uchun 'used to + fe'l' ishlatiladi. 'Be used to' esa 'ko'nikkan' degani va -ing bilan keladi.",
  },
  {
    id: "a5",
    topic: "articles",
    sentence: "He wants to become ____ engineer.",
    options: ["a", "an", "the", "-"],
    answer: 1,
    explanation: "Engineer unli ovoz bilan boshlanadi, shuning uchun an.",
  },
  {
    id: "a6",
    topic: "articles",
    sentence: "What ____ beautiful day!",
    options: ["a", "an", "the", "-"],
    answer: 0,
    explanation: "'What a/an + sifat + ot' qolipi: what a beautiful day. Beautiful undosh ovozi bilan boshlanadi.",
  },
  {
    id: "c5",
    topic: "conditionals",
    sentence: "If you heat ice, it ____.",
    options: ["will melt", "melts", "would melt", "melted"],
    answer: 1,
    explanation: "Umumiy haqiqat uchun Zero Conditional: if + Present Simple, Present Simple.",
  },
  {
    id: "c6",
    topic: "conditionals",
    sentence: "I would have called you if I ____ your number.",
    options: ["have", "had", "had had", "would have"],
    answer: 2,
    explanation: "Third Conditional: if + Past Perfect. 'Have' fe'lining Past Perfect shakli 'had had'.",
  },
  {
    id: "p5",
    topic: "prepositions",
    sentence: "She is very good ____ solving problems.",
    options: ["in", "at", "on", "for"],
    answer: 1,
    explanation: "Good, bad, excellent kabi sifatlardan keyin qobiliyat uchun at ishlatiladi: good at.",
  },
  {
    id: "p6",
    topic: "prepositions",
    sentence: "The government is responsible ____ public safety.",
    options: ["of", "to", "for", "about"],
    answer: 2,
    explanation: "'Responsible for' biror narsaga mas'ul, 'responsible to' esa kimdir oldida javobgar.",
  },
  {
    id: "m5",
    topic: "comparison",
    sentence: "The weather is getting ____ every day.",
    options: ["more bad", "worse", "worst", "badder"],
    answer: 1,
    explanation: "Bad sifatining qiyoslash darajasi tartibsiz: bad, worse, worst.",
  },
  {
    id: "m6",
    topic: "comparison",
    sentence: "Of the two options, this one is ____.",
    options: ["the best", "better", "the better", "more good"],
    answer: 2,
    explanation: "Faqat ikki narsa orasida tanlanganda 'the + qiyoslash darajasi' ishlatiladi: the better.",
  },
  {
    id: "f5",
    topic: "forms",
    sentence: "The ____ of the new law surprised everyone.",
    options: ["announce", "announcing", "announcement", "announcer"],
    answer: 2,
    explanation: "The dan keyin ot kerak. Announce fe'l, announcement esa e'lon (ot). Announcer esa e'lon qiluvchi shaxs.",
  },
  {
    id: "f6",
    topic: "forms",
    sentence: "Smoking is ____ to your health.",
    options: ["harm", "harmful", "harmfully", "harmless"],
    answer: 1,
    explanation: "Is dan keyin sifat keladi. Harmful zararli, harmless esa zararsiz (ma'nosi teskari).",
  },
  {
    id: "f7",
    topic: "forms",
    sentence: "The film was so ____ that I fell asleep.",
    options: ["bored", "bore", "boredom", "boring"],
    answer: 3,
    explanation: "Narsaning o'zi haqida gapirsak -ing (boring film), odamning hissi haqida -ed (I was bored).",
  },
];
