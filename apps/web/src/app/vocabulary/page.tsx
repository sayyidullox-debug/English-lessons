import type { Metadata } from "next";
import { Flashcards } from "@/components/flashcards";

export const metadata: Metadata = {
  title: "Lug'at",
  description: "IELTS uchun akademik so'zlar: takrorlash tizimi va talaffuzni tinglash.",
};

export default function VocabularyPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <h1 className="text-4xl font-bold tracking-tight">Lug&apos;at</h1>
      <p className="mt-3 max-w-[58ch] text-muted-foreground">
        Boshlang&apos;ich (A1) dan IELTS gacha. Tarjimani o&apos;zingiz yozasiz, sayt tekshiradi: lotin yoki kirill,
        bir nechta to&apos;g&apos;ri tarjimadan istalgani qabul. Bilmagan so&apos;zlaringiz bugunoq qaytadi, bilganlaringiz esa
        kunlar o&apos;tib.
      </p>
      <div className="mt-10">
        <Flashcards />
      </div>
    </div>
  );
}
