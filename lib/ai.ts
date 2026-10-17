import OpenAI from "openai";
import { env } from "@/lib/env";

export const openai = new OpenAI({
  apiKey: env.OPENROUTER_API_KEY || "dummy",
  baseURL: env.EMBEDDING_BASE_URL || "https://openrouter.ai/api/v1",
});

export const DEFAULT_CHAT_MODELS = [
  "nvidia/nemotron-3.5-lightning:free",
  "liquid/lfm-2.5-2.6b:free",
  "google/gemma-4-26b-a4b-it:free",
  "meta-llama/llama-3.3-70b-instruct:free",
];

// Fallback deterministic embedding generator
function generateFallbackEmbedding(text: string, dimensions = 1024): number[] {
  const vector = new Array(dimensions).fill(0);
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash |= 0;
  }
  for (let i = 0; i < dimensions; i++) {
    const val = Math.sin(hash + i) * 10000;
    vector[i] = Number((val - Math.floor(val)).toFixed(4));
  }
  return vector;
}

export async function createEmbedding(text: string): Promise<number[]> {
  const cleanInput = text.trim().slice(0, 8000);
  if (!cleanInput) {
    return generateFallbackEmbedding("empty", env.EMBEDDING_DIMENSIONS);
  }

  if (env.OPENROUTER_API_KEY) {
    try {
      const resp = await openai.embeddings.create({
        model: env.EMBEDDING_MODEL,
        input: cleanInput,
      });

      const embedding = resp.data[0]?.embedding;
      if (Array.isArray(embedding) && embedding.length > 0) {
        return embedding;
      }
    } catch (err) {
      console.warn("OpenRouter embedding request failed, using fallback vector:", err instanceof Error ? err.message : err);
    }
  }

  return generateFallbackEmbedding(cleanInput, env.EMBEDDING_DIMENSIONS);
}

export interface StreamingChatOptions {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
  contextChunks?: Array<{
    documentTitle: string;
    content: string;
    similarity: number;
    pageNumber?: number;
    section?: string;
  }>;
}

export async function streamChatCompletion({
  messages,
  contextChunks = [],
}: StreamingChatOptions) {
  // Build system prompt strictly enforcing grounding on uploaded knowledge base
  const contextText =
    contextChunks.length > 0
      ? contextChunks
          .map(
            (c, i) =>
              `[Source ${i + 1}: ${c.documentTitle}${c.pageNumber ? `, p.${c.pageNumber}` : ""}]\n${c.content}`
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

  // Try available models
  for (const model of DEFAULT_CHAT_MODELS) {
    try {
      const stream = await openai.chat.completions.create({
        model,
        messages: promptMessages,
        stream: true,
        temperature: 0.2,
      });

      return stream;
    } catch (err) {
      console.warn(`Model ${model} unavailable, trying next...`, err instanceof Error ? err.message : err);
    }
  }

  return null;
}
