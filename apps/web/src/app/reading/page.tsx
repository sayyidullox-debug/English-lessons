import type { Metadata } from "next";
import { ReadingPractice } from "@/components/reading-practice";
import { PASSAGES } from "@/content/reading";

export const metadata: Metadata = {
  title: "O'qish",
  description: "IELTS Reading formatidagi matnlar: True / False / Not Given va tanlov savollari.",
};

export default function ReadingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">O&apos;qish</h1>
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        Oson matndan (A2) boshlab IELTS darajasigacha. Matnni o&apos;qib, savollarga javob bering. Natijadan keyin har
        bir javobning matndagi dalili ko&apos;rsatiladi. Savollar har safar boshqa tartibda chiqadi.
      </p>
      <div className="mt-10">
        <ReadingPractice passages={PASSAGES} />
      </div>
    </div>
  );
}
