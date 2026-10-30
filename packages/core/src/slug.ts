const CYRILLIC: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "yo", ж: "j", з: "z",
  и: "i", й: "y", к: "k", л: "l", м: "m", н: "n", о: "o", п: "p", р: "r",
  с: "s", т: "t", у: "u", ф: "f", х: "x", ц: "ts", ч: "ch", ш: "sh", щ: "sh",
  ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya", ў: "o", қ: "q", ғ: "g", ҳ: "h",
  "№": "",
};

const APOSTROPHES = /[ʻʼ’‘`']/g;

/** O'zbek (lotin/kirill) va rus matnidan URL uchun xavfsiz slug yasaydi. */
export function slugify(input: string, maxLength = 48): string {
  const lowered = input.toLowerCase().replace(APOSTROPHES, "");
  let out = "";
  for (const ch of lowered.normalize("NFC")) {
    const mapped = CYRILLIC[ch];
    out += mapped ?? ch.normalize("NFKD").replace(/[̀-ͯ]/g, "");
  }
  return out
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength)
    .replace(/-+$/, "");
}

/** Mavjud slug'lar bilan to'qnashsa `-2`, `-3` qo'shadi. */
export function uniqueSlug(base: string, exists: (slug: string) => boolean): string {
  const root = slugify(base) || "item";
  if (!exists(root)) return root;
  for (let i = 2; i < 10_000; i++) {
    const candidate = `${root}-${i}`;
    if (!exists(candidate)) return candidate;
  }
  throw new Error("Unique slug topilmadi");
}
