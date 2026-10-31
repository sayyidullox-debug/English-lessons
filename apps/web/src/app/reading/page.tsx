import type { Metadata } from "next";
import { ReadingPractice } from "@/components/reading-practice";
import { PASSAGES } from "@/content/reading";

export const metadata: Metadata = {
  title: "O'qish",
  description: "IELTS Reading formatidagi matn: True / False / Not Given va tanlov savollari.",
};

export default function ReadingPage() {
  const passage = PASSAGES[0];
  if (!passage) return null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">O&apos;qish</h1>
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        Matnni o&apos;qib, savollarga javob bering. Tavsiya etilgan vaqt: {passage.minutes} daqiqa. Natijadan keyin har
        bir javobning matndagi dalili ko&apos;rsatiladi.
      </p>
      <div className="mt-10">
        <ReadingPractice passage={passage} />
      </div>
    </div>
  );
}
