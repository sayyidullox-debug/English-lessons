import Link from "next/link";
import { Correction } from "@/components/correction";
import { buttonVariants } from "@/components/ui/button";
import { GRAMMAR } from "@/content/grammar";
import { PASSAGES } from "@/content/reading";
import { SPEAKING_PROMPTS } from "@/content/speaking";
import { LEVELS, LEVEL_LABEL, VOCAB, wordsOfLevel, type Level } from "@/content/vocab";
import { WRITING_PROMPTS } from "@/content/writing";
import { cn } from "@/lib/utils";

const SAMPLE_MARKS = 4;

const LEVEL_GOAL: Record<Level, string> = {
  A1: "Salomlashish, o'zingiz va oilangiz haqida oddiy gaplar.",
  A2: "Kundalik mavzular: ovqat, xarid, ob-havo, o'tgan kun haqida gapirish.",
  B1: "Fikringizni bildirish, xat yozish, sayohatda va ishda tushunish.",
  B2: "Murakkab matnlarni tushunish, munozarada ishtirok etish.",
  IELTS: "Akademik so'zlar, Task 2 inshosi va to'liq imtihon formatidagi matnlar.",
};

const SECTIONS = [
  {
    href: "/vocabulary",
    name: "Lug'at",
    text: "Akademik so'zlar takrorlash tizimi bilan: bilgan so'zingiz kech, bilmaganingiz tez qaytadi.",
    stat: `${VOCAB.length} ta so'z`,
  },
  {
    href: "/grammar",
    name: "Grammatika",
    text: "Qisqa savollar. Har javobdan keyin nima uchun shunday ekani o'zbekcha tushuntiriladi.",
    stat: `${GRAMMAR.length} ta savol`,
  },
  {
    href: "/reading",
    name: "O'qish",
    text: "Haqiqiy imtihon formatidagi matn: True, False, Not Given. Natija taxminiy band bilan.",
    stat: `${PASSAGES.length} ta matn`,
  },
  {
    href: "/speaking",
    name: "Gapirish",
    text: "Savolga inglizcha javob bering: brauzer ovozni matnga aylantiradi, tezlik va xatolar bepul tekshiriladi.",
    stat: `${SPEAKING_PROMPTS.length} ta savol`,
  },
  {
    href: "/writing",
    name: "Yozish",
    text: "Inshongizni yozing. Xatolar qizil qalam bilan belgilanadi, har biriga tuzatish va sabab yoziladi.",
    stat: `${WRITING_PROMPTS.length} ta mavzu`,
  },
] as const;

const CRITERIA = [
  {
    name: "Task Response",
    looks: "Savolga to'liq javob berdingizmi, pozitsiyangiz aniqmi, fikrlar dalil bilan quvvatlanganmi.",
    here: "Hajm (250 so'z), abzatslar soni va xulosa borligi.",
  },
  {
    name: "Coherence and Cohesion",
    looks: "Fikrlar mantiqiy ketma-ketlikdami, abzatslar va bog'lovchilar to'g'ri ishlatilganmi.",
    here: "Bog'lovchilar (however, as a result...) va abzats tuzilmasi.",
  },
  {
    name: "Lexical Resource",
    looks: "So'z boyligi qanchalik xilma-xil va aniq, takrorlar kam bo'lishi kerak.",
    here: "Takrorlanmagan so'zlar ulushi, norasmiy so'zlar.",
  },
  {
    name: "Grammatical Range and Accuracy",
    looks: "Gap turlari xilma-xilmi va xatolar kammi.",
    here: "Odatiy xatolar: zamon, artikl, predlog, sanalmaydigan otlar.",
  },
] as const;

export default function HomePage() {
  return (
    <>
      <section className="mx-auto grid max-w-6xl gap-12 px-4 pb-16 pt-12 sm:px-6 sm:pt-16 lg:grid-cols-12 lg:gap-10 lg:pt-20">
        <div className="lg:col-span-6 lg:pt-6">
          <h1 className="text-4xl font-bold leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Inshongizni imtihonchi qalami bilan ko&apos;ring
          </h1>
          <p className="mt-6 max-w-[52ch] text-lg leading-relaxed text-muted-foreground">
            Ingliz tilini noldan boshlab IELTS darajasigacha o&apos;rganing: lug&apos;at, grammatika, o&apos;qish, gapirish va
            yozish mashqlari. Yozgan joyingizdagi har bir xato qizil qalam bilan belgilanadi, yoniga tuzatishi va
            sababi yoziladi. Hammasi bepul, ro&apos;yxatdan o&apos;tish shart emas.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/vocabulary" className={cn(buttonVariants({ size: "lg" }), "h-11 px-5 text-base")}>
              Lug&apos;atdan boshlash
            </Link>
            <Link
              href="/writing"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-11 px-5 text-base")}
            >
              Yozganimni tekshirtirish
            </Link>
          </div>
        </div>

        <div className="lg:col-span-6">
          <div
            className="relative rounded-md border border-border bg-card px-6 pb-6 pt-8 shadow-[0_1px_0_var(--border),0_18px_40px_-28px_rgba(28,33,80,0.45)] sm:px-9"
            style={{
              backgroundImage:
                "repeating-linear-gradient(to bottom, transparent 0, transparent calc(2.25rem - 1px), color-mix(in oklab, var(--border) 70%, transparent) calc(2.25rem - 1px), color-mix(in oklab, var(--border) 70%, transparent) 2.25rem)",
              backgroundPosition: "0 2rem",
            }}
          >
            <div
              aria-label="Taxminiy ball: 6.0"
              className="absolute -top-9 right-4 flex size-[4.5rem] -rotate-6 flex-col items-center justify-center rounded-full border-2 border-pen bg-card text-pen sm:right-8"
            >
              <span className="text-[0.7rem] font-semibold leading-none">Band</span>
              <span className="font-serif text-3xl font-semibold italic leading-none">6.0</span>
            </div>

            <p className="font-serif text-xl leading-9 sm:text-[1.35rem]">
              Nowadays, many{" "}
              <Correction draw delay={0.5} wrong="peoples" fix="people" why="People o'zi ko'plik, -s qo'shilmaydi." />{" "}
              believe that technology{" "}
              <Correction draw delay={1.0} wrong="make" fix="makes" why="Technology birlik: fe'lga -s qo'shiladi." />{" "}
              life easier.{" "}
              <span className="marker-hl">In my opinion, this is true</span>, but it also{" "}
              <Correction draw delay={1.5} wrong="have" fix="has" why="It bilan has ishlatiladi." /> some
              problems. For example, children spend hours online and{" "}
              <Correction draw delay={2.0} wrong="dont" fix="do not" why="Rasmiy inshoda qisqartma ishlatilmaydi." />{" "}
              talk to their parents.
            </p>

            <div className="mt-5 space-y-1 text-sm">
              <p className="text-samarkand">Yaxshi: pozitsiya birinchi abzatsdayoq aytilgan.</p>
              <p className="text-pen">{SAMPLE_MARKS} ta joy belgilandi. Sichqoncha yoki Tab bilan sababini ko&apos;ring.</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="yol" className="border-t border-border/80">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 id="yol" className="max-w-[34ch] text-3xl font-bold tracking-tight text-balance">
            Noldan IELTS gacha besh bosqich
          </h2>
          <p className="mt-3 max-w-[60ch] text-muted-foreground">
            Har bosqichda lug&apos;at, grammatika, o&apos;qish, gapirish va yozish mashqlari bor. Oldingi bosqichning ko&apos;pini
            o&apos;zlashtirgach keyingisiga o&apos;ting, lug&apos;at sahifasi o&apos;zi darajangizni tavsiya qiladi.
          </p>
          <ol className="mt-8 grid gap-y-8 border-t border-foreground sm:grid-cols-2 lg:grid-cols-5">
            {LEVELS.map((level) => (
              <li key={level} className="pt-4 lg:pr-6">
                <p className="font-serif text-4xl font-semibold italic text-pen">{level}</p>
                <p className="mt-1 font-semibold">{LEVEL_LABEL[level]}</p>
                <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-muted-foreground">{LEVEL_GOAL[level]}</p>
                <p className="mt-3 text-sm font-medium tabular-nums text-samarkand">
                  {wordsOfLevel(level).length} so&apos;z, {GRAMMAR.filter((q) => q.level === level).length} savol
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="border-t border-border/80 bg-card/50">
        <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
          <h2 className="max-w-[30ch] text-3xl font-bold tracking-tight text-balance">
            Besh yo&apos;nalishda har kuni o&apos;n besh daqiqa, hammasi bepul
          </h2>
          <ul className="mt-8 divide-y divide-border border-y border-border">
            {SECTIONS.map(({ href, name, text, stat }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="group grid items-baseline gap-x-8 gap-y-1 py-5 transition-colors hover:bg-muted/60 sm:grid-cols-[11rem_1fr_auto] sm:px-3"
                >
                  <span className="text-2xl font-semibold tracking-tight">{name}</span>
                  <span className="max-w-[58ch] text-muted-foreground">{text}</span>
                  <span className="text-sm font-medium text-samarkand sm:text-right">{stat}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <h2 className="max-w-[34ch] text-3xl font-bold tracking-tight text-balance">
          Insho to&apos;rt mezon bo&apos;yicha baholanadi
        </h2>
        <p className="mt-3 max-w-[60ch] text-muted-foreground">
          Imtihonchi har mezonga alohida ball qo&apos;yadi, umumiy band ularning o&apos;rtachasi bo&apos;ladi.
          Mana nimaga qaraladi va Qizil Qalam nimani tekshiradi.
        </p>
        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">IELTS Writing mezonlari</caption>
            <thead>
              <tr className="border-b-2 border-foreground text-sm">
                <th scope="col" className="w-[16rem] py-2 pr-6 font-semibold">Mezon</th>
                <th scope="col" className="py-2 pr-6 font-semibold">Imtihonchi nimaga qaraydi</th>
                <th scope="col" className="py-2 font-semibold">Qizil Qalam nimani tekshiradi</th>
              </tr>
            </thead>
            <tbody>
              {CRITERIA.map(({ name, looks, here }) => (
                <tr key={name} className="border-b border-border align-top">
                  <th scope="row" className="py-4 pr-6 font-serif text-lg font-semibold italic">{name}</th>
                  <td className="max-w-[40ch] py-4 pr-6 text-muted-foreground">{looks}</td>
                  <td className="max-w-[36ch] py-4">{here}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
