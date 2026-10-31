# Qizil Qalam

IELTS inglizcha tayyorgarlik sayti o'zbek o'quvchilari uchun. Interfeys o'zbekcha, mashqlar inglizcha. Insho va gapirgan javob imtihonchi ko'zi bilan tekshiriladi: xatolar qizil qalam bilan chiziladi, yoniga tuzatish va sababi yoziladi.

**Hammasi bepul.** Hisob, to'lov va API kaliti kerak emas. AI tekshiruvi faqat ixtiyoriy qo'shimcha.

## Imkoniyatlar

| Bo'lim | Nima qiladi |
| --- | --- |
| Lug'at | 36 ta akademik so'z. Leitner takrorlash tizimi: bilmagan so'z bugun, bilgani kunlar o'tib qaytadi. Talaffuzni tinglash, klaviatura (1/2/3). |
| Grammatika | 38 savollik bankadan har urinishda 12 tasi tasodifiy tanlanadi, variantlar aralashadi. 6 mavzu, har javobga o'zbekcha tushuntirish. |
| O'qish | 2 ta matn, IELTS formatida: True / False / Not Given va tanlov. Savollar va variantlar har urinishda aralashadi. Taymer, har javobning dalili, taxminiy band. |
| Gapirish | Part 1, 2, 3 savollari. Brauzer ovozni matnga aylantiradi (Chrome / Edge), tezlik, to'ldiruvchi so'zlar, so'z boyligi va xatolar baholanadi. Part 2 uchun tayyorlanish taymeri. |
| Yozish | Task 2 mavzulari. To'rt mezon bo'yicha ball, qizil qalamli insho, imlo va odatiy xatolar. Qoralama avtomatik saqlanadi. |
| Natijalar | Ketma-ket kunlar, o'zlashtirilgan so'zlar, mavzu bo'yicha aniqlik, ball dinamikasi. |

## Ishga tushirish

```bash
npm install
npm run dev:web      # http://localhost:3000
npm test             # birlik testlari
npm run typecheck
```

Node 24 yoki yangiroq kerak (ichki `node:sqlite` ishlatiladi).

### Tekshiruv qanday ishlaydi

- **Bepul tekshiruv (standart).** Qoidalarga asoslangan, brauzerda va serverda bepul ishlaydi: uzunlik, tuzilma, bog'lovchilar, imlo va o'zbek o'quvchilari tez-tez qiladigan xatolar. Mazmunni baholamaydi, shuning uchun ballar 7.0 dan oshmaydi va natijada "Bepul tekshiruv" belgisi ko'rinadi.
- **AI tekshiruvi (ixtiyoriy).** `.env` ga `ANTHROPIC_API_KEY` qo'ysangiz, insho Claude orqali tekshiriladi. API pullik, shuning uchun bu kerak bo'lmasa, kalit qo'ymang. Kalit bo'lmasa yoki kredit tugasa, sayt avtomatik bepul tekshiruvga o'tadi.
- **Gapirish** to'liq brauzerda ishlaydi: ovozni matnga aylantirishni brauzerning o'zi bajaradi, sayt ovozni yozib olmaydi va saqlamaydi.

## Tuzilma

```
apps/web            Next.js (App Router) + Tailwind v4 + shadcn/ui
  src/content       Lug'at, grammatika, matn, savol va mavzular (ma'lumot sifatida)
  src/lib           Sof mantiq: srs, band, shuffle, writing/speaking-analysis, progress (testlangan)
  src/components    Interfeys; "use client" faqat kerak joyda
  src/app/api       POST /api/writing-feedback (AI yoki bepul tekshiruv)
packages/core       Umumiy yadro: AI provayder interfeysi (Claude + mock), SQLite, i18n
```

Muhim qarorlar:

- **Mantiq UI dan ajratilgan.** Takrorlash tizimi, band hisoblash, aralashtirish va tahlil oddiy funksiyalar, vitest bilan tekshirilgan. Kontent butunligi ham testlanadi (noyob id, yaroqli javoblar).
- **Ko'chirishga qarshi.** Savollar tartibi, tanlov variantlari va grammatika to'plami har urinishda tasodifiy. Aralashtirish faqat brauzerda tuziladi, shuning uchun server va mijoz sahifasi mos keladi.
- **Bitta javob shakli.** AI ham, bepul tekshiruv ham `Feedback` (zod sxemasi) qaytaradi, interfeys ikkalasini bir xil chizadi. Belgilar matn ichidan `quote` bo'yicha topiladi, topilmaganlari tashlanadi.
- **Foydalanuvchi ma'lumoti brauzerda.** Hisob va server bazasi yo'q, natijalar `localStorage` da. Buzilgan yoki eski ma'lumot xavfsiz tarzda bo'shga qaytadi.
- **AI kaliti himoyalangan.** Faqat serverda, so'rovlar tezligi cheklangan, inshodagi buyruqlar "ma'lumot" sifatida qaraladi.

## Cheklovlar

- Ballar taxminiy. Rasmiy IELTS natijasini bildirmaydi.
- Speaking: talaffuz baholanmaydi. Chrome ko'pincha um/uh kabi so'zlarni yozmaydi, shuning uchun ularning soni kam chiqishi mumkin. Firefox va Safari ovoz tanishni to'liq qo'llamaydi, u yerda javobni yozib tekshirtirsa bo'ladi.
- Kontent hajmi hali kichik (2 matn, 38 savol, 36 so'z). Yangisini `src/content` ga qo'shish kifoya.
- Tezlik chegarasi (AI yo'li uchun) bitta server jarayoni xotirasida.
