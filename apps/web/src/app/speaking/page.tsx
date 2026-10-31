import type { Metadata } from "next";
import { SpeakingLab } from "@/components/speaking-lab";

export const metadata: Metadata = {
  title: "Gapirish",
  description: "IELTS Speaking mashqi: brauzer ovozingizni matnga aylantiradi, javob bepul tekshiriladi.",
};

export default function SpeakingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Gapirish</h1>
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        Savolni tanlang, tugmani bosib inglizcha javob bering. Brauzer ovozingizni matnga aylantiradi, keyin tezlik,
        so&apos;z boyligi va xatolar qizil qalam bilan ko&apos;rsatiladi. Hammasi bepul, hisob yoki kalit kerak emas.
      </p>
      <p className="mt-3 max-w-[58ch] text-sm text-muted-foreground">
        Ovozni matnga aylantirishni brauzeringizning o&apos;zi bajaradi (Chrome yoki Edge, internet kerak). Sayt ovozingizni
        yozib olmaydi va saqlamaydi.
      </p>
      <div className="mt-10">
        <SpeakingLab />
      </div>
    </div>
  );
}
