import OpenAI from "openai";
import { env, EmbeddingError } from "@/lib/env";

export const openai = new OpenAI({
  apiKey: env.OPENROUTER_API_KEY || "missing",
  baseURL: env.EMBEDDING_BASE_URL || "https://openrouter.ai/api/v1",
});

export const DEFAULT_CHAT_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "liquid/lfm-2.5-2.6b:free",
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

export async function createEmbedding(
  text: string,
  options?: { model?: string; dimensions?: number },
): Promise<number[]> {
  const cleanInput = text.trim().slice(0, 8000);
  const dimensions = options?.dimensions ?? env.EMBEDDING_DIMENSIONS;
  const model = options?.model ?? env.EMBEDDING_MODEL;

  if (!cleanInput) {
    throw new EmbeddingError("Cannot embed empty text");
  }
  if (!env.OPENROUTER_API_KEY) {
    throw new EmbeddingError("OPENROUTER_API_KEY is required to create embeddings");
  }

  const resp = await openai.embeddings.create({
    model,
    input: cleanInput,
  });
  const embedding = resp.data[0]?.embedding;
  if (!Array.isArray(embedding) || embedding.length !== dimensions) {
    throw new EmbeddingError(
      `Embedding length ${embedding?.length ?? 0} does not match expected ${dimensions}`,
    );
  }
  return embedding;
}

export interface StreamingChatOptions {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  contextChunks?: Array<{
    documentTitle: string;
    content: string;
    similarity: number | null;
    pageNumber?: number;
    section?: string;
  }>;
  model?: string;
}

export async function streamChatCompletion({
  messages,
  contextChunks = [],
  model,
}: StreamingChatOptions) {
  const contextText =
    contextChunks.length > 0
      ? contextChunks
          .map(
            (c, i) =>
              `[Source ${i + 1}: ${c.documentTitle}${c.pageNumber ? `, p.${c.pageNumber}` : ""}]\n${c.content}`,
          )
          .join("\n\n---\n\n")
      : "No relevant documents found in knowledge base.";

  const systemPrompt = `You are the AI Knowledge Assistant for this workspace.
Your primary role is to answer user questions accurately, concisely, and helpfully using ONLY the knowledge base sources provided below.

RULES:
1. Always cite your sources when referring to information from the provided context (e.g. "[Source 1]").
2. If the answer cannot be found in the provided sources, politely explain that the current documentation does not contain that information and offer what is known.
3. Keep answers clear, nicely formatted with markdown headings, bullet points, and code blocks where appropriate.

KNOWLEDGE BASE CONTEXT:
${contextText}`;

  const promptMessages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
    { role: "system", content: systemPrompt },
    ...messages,
  ];

  const models = model ? [model, ...DEFAULT_CHAT_MODELS.filter((item) => item !== model)] : DEFAULT_CHAT_MODELS;

  for (const candidate of models) {
    try {
      return await openai.chat.completions.create({
        model: candidate,
        messages: promptMessages,
        stream: true,
        temperature: 0.2,
      });
    } catch (err) {
      console.warn(`Model ${candidate} unavailable, trying next...`, err instanceof Error ? err.message : err);
    }
  }

  return null;
}

export async function describeImage(buffer: Buffer, mime: string): Promise<string> {
  if (!env.OPENROUTER_API_KEY) {
    throw new EmbeddingError("OPENROUTER_API_KEY is required for OCR");
  }
  const dataUrl = `data:${mime};base64,${buffer.toString("base64")}`;
  const response = await openai.chat.completions.create({
    model: DEFAULT_CHAT_MODELS[0],
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Transcribe all visible text in this document image. Return only the text." },
          { type: "image_url", image_url: { url: dataUrl } },
        ],
      },
    ],
  });
  return response.choices[0]?.message?.content || "";
}
