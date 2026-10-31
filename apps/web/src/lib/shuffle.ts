export type Rng = () => number;

/** Fisher-Yates: asl massivni o'zgartirmaydi. Testda `rng` ni almashtirish mumkin. */
export function shuffle<T>(items: readonly T[], rng: Rng = Math.random): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
}

/** Variantlarni aralashtiradi va to'g'ri javob indeksini yangi o'rniga ko'chiradi. */
export function shuffleChoices(
  options: readonly string[],
  answer: number,
  rng: Rng = Math.random,
): { options: string[]; answer: number } {
  const order = shuffle(
    options.map((_, i) => i),
    rng,
  );
  return { options: order.map((i) => options[i]!), answer: order.indexOf(answer) };
}
