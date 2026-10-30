export type Lang = "uz" | "ru";
export type Dict = Record<string, string>;
export type Params = Record<string, string | number>;
export type Translate = (lang: Lang, key: string, params?: Params) => string;

/** Kalit topilmasa o'zbekchaga, u ham bo'lmasa kalitning o'ziga qaytadi. */
export function createTranslator(dicts: Record<Lang, Dict>): Translate {
  return (lang, key, params = {}) => {
    const template = dicts[lang][key] ?? dicts.uz[key] ?? key;
    return template.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`));
  };
}

/** Telegram `language_code` dan til tanlaydi: ruscha bo'lsa ru, aks holda uz. */
export function detectLang(code?: string | null): Lang {
  return code?.toLowerCase().startsWith("ru") ? "ru" : "uz";
}

export function isLang(value: unknown): value is Lang {
  return value === "uz" || value === "ru";
}
