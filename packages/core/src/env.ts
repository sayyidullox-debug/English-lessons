import type { z } from "zod";

/** `.env` bo'lsa o'qiydi, keyin o'zgaruvchilarni sxema bo'yicha tekshiradi. */
export function loadEnv<S extends z.ZodType>(schema: S, source: NodeJS.ProcessEnv = process.env): z.infer<S> {
  try {
    process.loadEnvFile?.();
  } catch {
    // .env yo'q bo'lishi normal holat
  }
  const parsed = schema.safeParse(source);
  if (!parsed.success) {
    const lines = parsed.error.issues.map((i) => `  - ${i.path.join(".") || "(root)"}: ${i.message}`);
    throw new Error(`Muhit o'zgaruvchilari noto'g'ri:\n${lines.join("\n")}`);
  }
  return parsed.data;
}
