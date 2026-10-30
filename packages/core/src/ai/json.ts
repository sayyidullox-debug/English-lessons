/** Model javobidan JSON qismini ajratadi: ```json``` to'siqlari va oldidan/keyingi izohlarni tashlaydi. */
export function extractJson(text: string): unknown {
  const unfenced = text.replace(/```(?:json)?/gi, "");
  const start = unfenced.search(/[{[]/);
  if (start === -1) throw new SyntaxError("Javobda JSON topilmadi");
  const open = unfenced[start]!;
  const close = open === "{" ? "}" : "]";
  const end = unfenced.lastIndexOf(close);
  if (end <= start) throw new SyntaxError("JSON tugallanmagan");
  return JSON.parse(unfenced.slice(start, end + 1));
}
