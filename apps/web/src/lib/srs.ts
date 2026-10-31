/**
 * Leitner tizimi: so'z qancha yaxshi eslansa, shuncha kech qaytib keladi.
 * 1-quti: bugun yana ko'rsatiladi; 5-quti: 16 kundan keyin.
 */
export const MAX_BOX = 5;
const INTERVAL_DAYS = [0, 0, 1, 3, 7, 16] as const;
/** Shu qutidan boshlab so'z "o'zlashtirilgan" hisoblanadi. */
export const MASTERED_BOX = 4;

export interface CardState {
  box: number;
  /** Epoxadan beri o'tgan kun (mahalliy vaqt). */
  due: number;
  seen: number;
  lapses: number;
}

export type Grade = "again" | "good" | "easy";

export function dayNumber(now: number | Date = Date.now()): number {
  const d = typeof now === "number" ? new Date(now) : now;
  // Mahalliy yarim tun chegarasi: UTC emas, foydalanuvchi kuni bo'yicha
  return Math.floor((d.getTime() - d.getTimezoneOffset() * 60_000) / 86_400_000);
}

export function review(state: CardState | undefined, grade: Grade, day: number): CardState {
  const prev = state ?? { box: 1, due: day, seen: 0, lapses: 0 };
  const box =
    grade === "again" ? 1 : Math.min(MAX_BOX, prev.box + (grade === "easy" ? 2 : 1));
  return {
    box,
    due: day + INTERVAL_DAYS[box]!,
    seen: prev.seen + 1,
    lapses: prev.lapses + (grade === "again" ? 1 : 0),
  };
}

export function isMastered(state: CardState | undefined): boolean {
  return (state?.box ?? 0) >= MASTERED_BOX;
}

/**
 * Bugungi navbat: avval muddati o'tganlar (eng eskisi birinchi), keyin yangi so'zlar.
 * `newLimit` bir kunda nechta yangi so'z qo'shilishini cheklaydi.
 */
export function buildQueue(
  ids: readonly string[],
  states: Readonly<Record<string, CardState | undefined>>,
  day: number,
  newLimit = 8,
): string[] {
  const due = ids
    .filter((id) => {
      const s = states[id];
      return s !== undefined && s.due <= day;
    })
    .sort((a, b) => states[a]!.due - states[b]!.due);
  const fresh = ids.filter((id) => states[id] === undefined).slice(0, newLimit);
  return [...due, ...fresh];
}
