import { AiError, type AiProvider, type JsonRequest, type TextRequest } from "./types.ts";

export interface MockHandlers {
  json?: (request: JsonRequest<unknown>) => unknown;
  text?: (request: TextRequest) => string;
}

/**
 * Kalitsiz "demo rejim" va testlar uchun deterministik provayder.
 * Chaqiruvlar `calls` ga yoziladi, shuning uchun testda nimani so'raganimizni tekshirish mumkin.
 */
export class MockProvider implements AiProvider {
  readonly name = "mock";
  readonly calls: Array<{ kind: "json" | "text"; prompt: string }> = [];

  constructor(private readonly handlers: MockHandlers = {}) {}

  async completeJson<T>(request: JsonRequest<T>): Promise<T> {
    this.calls.push({ kind: "json", prompt: request.prompt });
    if (!this.handlers.json) throw new AiError("MockProvider: json handler berilmagan");
    return request.schema.parse(this.handlers.json(request as JsonRequest<unknown>));
  }

  async completeText(request: TextRequest): Promise<string> {
    this.calls.push({ kind: "text", prompt: request.prompt });
    if (!this.handlers.text) throw new AiError("MockProvider: text handler berilmagan");
    return this.handlers.text(request);
  }
}
