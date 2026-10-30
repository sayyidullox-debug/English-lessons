import type { z } from "zod";

export type ImageMediaType = "image/jpeg" | "image/png" | "image/webp" | "image/gif";

export interface AiImage {
  mediaType: ImageMediaType;
  data: Buffer;
}

export interface JsonRequest<T> {
  system: string;
  prompt: string;
  images?: AiImage[];
  schema: z.ZodType<T>;
  maxTokens?: number;
}

export interface TextRequest {
  system: string;
  prompt: string;
  maxTokens?: number;
}

/** Botlar faqat shu interfeysga bog'liq: Claude, mock yoki boshqa model almashtirilishi mumkin. */
export interface AiProvider {
  readonly name: string;
  completeJson<T>(request: JsonRequest<T>): Promise<T>;
  completeText(request: TextRequest): Promise<string>;
}

export class AiError extends Error {
  override name = "AiError";
}
