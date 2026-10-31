import { z } from "zod";

const band = z.number().min(1).max(9);

/** Insho tekshiruvi natijasi: AI ham, demo tahlil ham shu shaklda qaytaradi. */
export const feedbackSchema = z.object({
  bands: z.object({
    task: band,
    coherence: band,
    lexical: band,
    grammar: band,
  }),
  summary: z.string().min(1),
  annotations: z
    .array(
      z.object({
        quote: z.string().min(1),
        fix: z.string(),
        why: z.string(),
      }),
    )
    .max(14),
  strengths: z.array(z.string()).max(4),
  nextSteps: z.array(z.string()).max(4),
});

export type Feedback = z.infer<typeof feedbackSchema>;
export type FeedbackAnnotation = Feedback["annotations"][number];

export const feedbackRequestSchema = z.object({
  prompt: z.string().min(10).max(600),
  essay: z.string().min(1).max(6000),
});

export interface Segment {
  text: string;
  annotation?: FeedbackAnnotation;
}

/**
 * Inshoni belgilangan bo'laklarga ajratadi. Har bir `quote` matndan topiladi;
 * bir xil iboralar ketma-ket joylashuvlarga bog'lanadi, ustma-ust tushganlari tashlanadi.
 */
export function buildSegments(text: string, annotations: readonly FeedbackAnnotation[]): Segment[] {
  const cursors = new Map<string, number>();
  const found: Array<{ start: number; end: number; annotation: FeedbackAnnotation }> = [];

  for (const annotation of annotations) {
    const from = cursors.get(annotation.quote) ?? 0;
    const start = text.indexOf(annotation.quote, from);
    if (start === -1) continue;
    cursors.set(annotation.quote, start + annotation.quote.length);
    found.push({ start, end: start + annotation.quote.length, annotation });
  }

  found.sort((a, b) => a.start - b.start);
  const segments: Segment[] = [];
  let position = 0;
  for (const item of found) {
    if (item.start < position) continue; // ustma-ust tushgan belgi
    if (item.start > position) segments.push({ text: text.slice(position, item.start) });
    segments.push({ text: text.slice(item.start, item.end), annotation: item.annotation });
    position = item.end;
  }
  if (position < text.length) segments.push({ text: text.slice(position) });
  return segments;
}
