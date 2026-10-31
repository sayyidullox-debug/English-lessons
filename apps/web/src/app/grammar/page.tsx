import type { Metadata } from "next";
import { GrammarQuiz } from "@/components/grammar-quiz";

export const metadata: Metadata = {
  title: "Grammatika",
  description: "IELTS uchun grammatika savollari, har javobga o'zbekcha tushuntirish bilan.",
};

export default function GrammarPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Grammatika</h1>
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        Gapdagi bo&apos;sh joyga to&apos;g&apos;ri variantni tanlang. Javobdan keyin qoidaning o&apos;zbekcha tushuntirishi chiqadi.
        Xato qilsangiz, to&apos;g&apos;ri variant qizil qalamda yoziladi.
      </p>
      <div className="mt-10">
        <GrammarQuiz />
      </div>
    </div>
  );
}
