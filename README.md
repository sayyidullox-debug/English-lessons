# Qizil Qalam

IELTS inglizcha tayyorgarlik sayti o'zbek o'quvchilari uchun. Interfeys o'zbekcha, mashqlar inglizcha. Insho imtihonchi ko'zi bilan tekshiriladi: xatolar qizil qalam bilan chiziladi, yoniga tuzatish va sababi yoziladi.

## Imkoniyatlar

| Bo'lim | Nima qiladi |
| --- | --- |
| Lug'at | 36 ta akademik so'z. Leitner takrorlash tizimi: bilmagan so'z bugun, bilgani kunlar o'tib qaytadi. Talaffuzni tinglash, klaviatura (1/2/3). |
| Grammatika | 24 savol, 6 mavzu. Har javobdan keyin o'zbekcha tushuntirish. Xato javob chiziladi, to'g'risi qizil qalamda yoziladi. |
| O'qish | IELTS formatidagi matn: True / False / Not Given va tanlov savollari. Taymer, har javobning matndagi dalili, taxminiy band. |
| Yozish | Task 2 mavzulari. To'rt mezon bo'yicha ball, qizil qalamli insho, kuchli tomonlar va keyingi qadamlar. Qoralama avtomatik saqlanadi. |
| Natijalar | Ketma-ket kunlar, o'zlashtirilgan so'zlar, mavzu bo'yicha aniqlik, ball dinamikasi. |

## Ishga tushirish

```bash
npm install
npm run dev:web      # http://localhost:3000
npm test             # birlik testlari
npm run typecheck
```

Node 24 yoki yangiroq kerak (ichki `node:sqlite` ishlatiladi).

### AI tekshiruvi va demo rejim

`.env.example` ni `.env` ga nusxalab, `ANTHROPIC_API_KEY` qo'ying: insho Claude orqali tekshiriladi. Kalit bo'lmasa yoki AI xato qaytarsa, sayt **demo rejim**ga o'tadi: uzunlik, tuzilma, bog'lovchilar va o'zbek o'quvchilari tez-tez qiladigan xatolar bo'yicha qoidaga asoslangan tahlil. Demo rejim mazmunni baholamaydi, shuning uchun u ballarni 7.0 dan oshirmaydi va natijada "Demo rejim" belgisi ko'rinadi.

## Tuzilma

```
apps/web            Next.js (App Router) + Tailwind v4 + shadcn/ui
  src/content       Lug'at, grammatika, matn va mavzular (ma'lumot sifatida)
  src/lib           Sof mantiq: srs, band, writing-analysis, progress (testlangan)
  src/components    Interfeys; "use client" faqat kerak joyda
  src/app/api       POST /api/writing-feedback (AI yoki demo)
packages/core       Umumiy yadro: AI provayder interfeysi (Claude + mock), SQLite, i18n
```

Muhim qarorlar:

- **Mantiq UI dan ajratilgan.** Takrorlash tizimi, band hisoblash va insho tahlili oddiy funksiyalar, vitest bilan tekshirilgan.
- **Bitta javob shakli.** AI ham, demo ham `Feedback` (zod sxemasi) qaytaradi, interfeys ikkalasini bir xil chizadi. AI javobi sxemadan o'tmasa, bir marta qayta so'raladi, keyin demo rejimga tushadi.
- **Belgilar matn ichidan topiladi.** Model qaytargan `quote` inshodan qidirib topiladi, topilmaganlari va ustma-ust tushganlari tashlanadi: model o'rin hisoblashda adashsa ham interfeys buzilmaydi.
- **Foydalanuvchi ma'lumoti brauzerda.** Hisob va server bazasi yo'q, natijalar `localStorage` da. Buzilgan yoki eski ma'lumot xavfsiz tarzda bo'shga qaytadi.
- **AI kaliti himoyalangan.** Faqat serverda ishlatiladi, so'rovlar tezligi cheklangan, inshoning ichidagi buyruqlar "ma'lumot" sifatida qaraladi.

## Cheklovlar

- Ballar taxminiy. Rasmiy IELTS natijasini bildirmaydi.
- Kontent hajmi hozircha kichik (1 ta matn, 6 ta mavzu). Yangisini `src/content` ga qo'shish kifoya.
- Tezlik chegarasi bitta server jarayoni xotirasida. Bir nechta nusxada ishlatilsa, umumiy ombor kerak bo'ladi.
