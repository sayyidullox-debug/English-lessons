import type { Metadata } from "next";
import { WritingLab } from "@/components/writing-lab";

export const metadata: Metadata = {
  title: "Yozish",
  description: "IELTS Writing Task 2: inshoni yozing va qizil qalam bilan tekshirtiring.",
};

export default function WritingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Yozish</h1>
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        Mavzuni tanlang va kamida 250 so&apos;zlik insho yozing. Qoralama brauzeringizda saqlanib turadi. Tekshiruvdan
        keyin ball to&apos;rt mezon bo&apos;yicha chiqadi, xatolar qizil qalam bilan belgilanadi.
      </p>
      <div className="mt-10">
        <WritingLab />
      </div>
    </div>
  );
}
