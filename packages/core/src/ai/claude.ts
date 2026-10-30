import Anthropic from "@anthropic-ai/sdk";
import { extractJson } from "./json.ts";
import { AiError, type AiProvider, type JsonRequest, type TextRequest } from "./types.ts";

export interface ClaudeOptions {
  apiKey: string;
  model?: string;
}

const DEFAULT_MODEL = "claude-sonnet-5-5";
const JSON_ATTEMPTS = 2;

export class ClaudeProvider implements AiProvider {
  readonly name = "claude";
  private readonly client: Anthropic;
  private readonly model: string;

  constructor({ apiKey, model = DEFAULT_MODEL }: ClaudeOptions) {
    this.client = new Anthropic({ apiKey });
    this.model = model;
  }

  async completeText({ system, prompt, maxTokens = 1024 }: TextRequest): Promise<string> {
    return this.send(system, [{ type: "text", text: prompt }], maxTokens);
  }

  async completeJson<T>({ system, prompt, images = [], schema, maxTokens = 1024 }: JsonRequest<T>): Promise<T> {
    const content: Anthropic.ContentBlockParam[] = [
      ...images.map(
        (image): Anthropic.ImageBlockParam => ({
          type: "image",
          source: { type: "base64", media_type: image.mediaType, data: image.data.toString("base64") },
        }),
      ),
      { type: "text", text: `${prompt}\n\nFaqat JSON qaytaring, boshqa matn yozmang.` },
    ];

    let lastError: unknown;
    for (let attempt = 1; attempt <= JSON_ATTEMPTS; attempt++) {
      const text = await this.send(system, content, maxTokens);
      try {
        return schema.parse(extractJson(text));
      } catch (error) {
        lastError = error;
      }
    }
    throw new AiError("Model yaroqli JSON qaytarmadi", { cause: lastError });
  }

  private async send(system: string, content: Anthropic.ContentBlockParam[], maxTokens: number): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: maxTokens,
      system,
      messages: [{ role: "user", content }],
    });
    return response.content.flatMap((block) => (block.type === "text" ? [block.text] : [])).join("");
  }
}
