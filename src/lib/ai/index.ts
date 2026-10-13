/**
 * @fileoverview AI Module - Complete AI provider integration
 *
 * Provides a unified interface for LLM chat completions and text embeddings.
 * Default configuration uses OpenRouter free models for chat, vision, and
 * embeddings, with automatic fallback chains for reliability.
 *
 * ## Supported Providers
 *
 * ### Chat/Completion (LLM)
 * - **OpenRouter** - Access to multiple free models (Nemotron, Gemma, GLM) — the only chat provider
 * - **Ollama** - Self-hosted local models
 *
 * ### Embeddings
 * - **OpenRouter** - Free embedding models via EMBEDDING_PROVIDER=openai
 * - **Google Gemini** - Optional (1,500 req/day free tier)
 * - **Ollama / Local** - Self-hosted options
 *
 * ## Quick Start
 *
 * ```typescript
 * import { streamChatCompletion, generateEmbedding } from '@/lib/ai';
 *
 * // Stream a chat response
 * const stream = await streamChatCompletion([
 *   { role: 'user', content: 'Hello!' }
 * ]);
 *
 * // Generate embeddings
 * const embedding = await generateEmbedding('Your text here');
 * ```
 *
 * ## Configuration
 *
 * Set environment variables in `.env`:
 * ```
 * OPENROUTER_API_KEY=sk-or-v1-...
 * ```
 *
 * @module ai
 * @requires @openrouter/ai-sdk-provider
 * @see {@link https://sdk.vercel.ai/|Vercel AI SDK Documentation}
 * @see {@link https://openrouter.ai/docs|OpenRouter Documentation}
 */

import { createHash } from 'node:crypto';
import { openrouter } from '@openrouter/ai-sdk-provider';
import {
  generateText,
  type LanguageModelUsage,
  type LanguageModelV1,
  streamText,
  type UIMessage,
} from 'ai';
import { logger } from '@/lib/logger';
import { estimateTokens } from '@/lib/rag/token-budget';
import { embeddingCircuitBreaker } from '@/lib/resilience/external-services';
import type { RAGConfig } from '@/types';

const DEFAULT_EMBEDDING_MODEL = 'liquid/lfm-2.5-embedding-350m:free';

/**
 * BEST OpenRouter FREE Models - Ranked by Performance
 * All available at: https://openrouter.ai/models?max_price=0
 * Last verified live: 2026-08-30
 */
export const BEST_FREE_MODELS = {
  // 🥇 TIER 1: Best Overall Performance (confirmed working)
  PRIMARY_CHAT: 'nvidia/nemotron-3.5-lightning:free', // Fast, reliable, verified live

  // 🥈 TIER 2: Great Performance
  NEMOTRON_SUPER: 'nvidia/nemotron-3-super-120b-a12b:free', // Verified live, strong quality
  GEMMA_4_26B: 'google/gemma-4-26b-a4b-it:free', // Google, verified available

  // 🥉 TIER 3: Good Alternatives
  GLM_5_2: 'z-ai/glm-5.2:free', // Capable, occasionally rate-limited

  // 🏅 TIER 4: Fallback options
  NEMOTRON_ULTRA: 'nvidia/nemotron-3-ultra-550b-a55b:free', // Very capable but slow
} as const;

/**
 * Task-specific model assignments for optimal free-tier utilization.
 * Routes each AI task to the best provider based on speed, quality, and rate limits.
 *
 * Strategy:
 * - All tasks route through OpenRouter free models, with tiered fallbacks
 * - Fast tasks (expansion, compression): lightweight tier first
 * - HyDE (needs quality): strongest free tier first
 * - Reranking: Cohere Rerank API (purpose-built)
 * - Embeddings: Google Gemini (free, high quality)
 */
export const TASK_MODELS = {
  // Fast internal tasks (query expansion, compression, sub-queries)
  FAST_TASK: BEST_FREE_MODELS.PRIMARY_CHAT,
  FAST_TASK_FALLBACK_1: BEST_FREE_MODELS.NEMOTRON_SUPER,
  FAST_TASK_FALLBACK_2: BEST_FREE_MODELS.GEMMA_4_26B,

  // HyDE (needs quality hypothetical documents)
  HYDE: BEST_FREE_MODELS.NEMOTRON_SUPER,
  HYDE_FALLBACK_1: BEST_FREE_MODELS.PRIMARY_CHAT,
  HYDE_FALLBACK_2: BEST_FREE_MODELS.GLM_5_2,
} as const;

export type AITask = 'fast' | 'hyde' | 'chat';

/**
 * Get the ordered list of models to try for a given task type.
 * For 'chat', delegates to dynamic model discovery.
 */
export async function getModelsForTask(task: AITask): Promise<string[]> {
  switch (task) {
    case 'fast':
      return [
        TASK_MODELS.FAST_TASK,
        TASK_MODELS.FAST_TASK_FALLBACK_1,
        TASK_MODELS.FAST_TASK_FALLBACK_2,
      ];
    case 'hyde':
      return [TASK_MODELS.HYDE, TASK_MODELS.HYDE_FALLBACK_1, TASK_MODELS.HYDE_FALLBACK_2];
    case 'chat': {
      const { getModelsForStreaming } = await import('./model-discovery');
      const result = await getModelsForStreaming('chat');
      return result.modelsToTry;
    }
  }
}

/**
 * Model fallback chain for resilience
 * Automatically tries next model if one fails/rate-limits.
 * OpenRouter free models only — all verified live 2026-08-30.
 */
export const MODEL_FALLBACK_CHAIN = [
  BEST_FREE_MODELS.PRIMARY_CHAT,
  BEST_FREE_MODELS.NEMOTRON_SUPER,
  BEST_FREE_MODELS.GEMMA_4_26B,
  BEST_FREE_MODELS.GLM_5_2,
  BEST_FREE_MODELS.NEMOTRON_ULTRA,
];

export const defaultAIConfig: RAGConfig = {
  chunkSize: 1000,
  chunkOverlap: 200,
  topK: 5,
  similarityThreshold: 0.7,
  temperature: 0.7,
  maxTokens: 2000,
  model: (process.env.DEFAULT_MODEL as RAGConfig['model']) || 'auto', // Dynamic — resolved via model discovery
  embeddingModel: process.env.EMBEDDING_MODEL ?? DEFAULT_EMBEDDING_MODEL,
};

// ==================== Chat Completions (OpenRouter) ====================

export async function streamChatCompletion(
  messages: Array<{ role: string; content: string }>,
  config: Partial<RAGConfig> = {}
) {
  const modelConfig = { ...defaultAIConfig, ...config };
  const { getModelsForStreaming } = await import('./model-discovery');
  const { modelsToTry: discoveredModels } = await getModelsForStreaming('chat');

  // Skip 'auto' — it's a placeholder meaning "use discovered models"
  const requestedModel = modelConfig.model !== 'auto' ? modelConfig.model : null;
  const modelsToTry = [
    ...(requestedModel ? [requestedModel] : []),
    ...discoveredModels.filter((m) => m !== requestedModel),
  ];

  let lastError: Error | undefined;

  for (const model of modelsToTry) {
    try {
      const languageModel = resolveModel(model);
      if (!languageModel) continue;

      const result = streamText({
        model: languageModel,
        messages: messages as Parameters<typeof streamText>[0]['messages'],
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
      });

      return Object.assign(result, { _modelUsed: model });
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      logger.warn('Model failed during streaming, trying fallback', {
        model,
        error: lastError.message,
      });
    }
  }

  throw lastError ?? new Error('All models failed');
}

export interface ChatCompletionResult {
  text: string;
  modelUsed: string;
  usage: LanguageModelUsage;
}

export async function generateChatCompletion(
  messages: Array<{ role: string; content: string }>,
  config: Partial<RAGConfig> = {}
): Promise<ChatCompletionResult> {
  const modelConfig = { ...defaultAIConfig, ...config };
  const { getModelsForStreaming } = await import('./model-discovery');
  const { modelsToTry: discoveredModels } = await getModelsForStreaming('chat');

  // Skip 'auto' — it's a placeholder meaning "use discovered models"
  const requestedModel = modelConfig.model !== 'auto' ? modelConfig.model : null;
  const modelsToTry = [
    ...(requestedModel ? [requestedModel] : []),
    ...discoveredModels.filter((m) => m !== requestedModel),
  ];

  for (const model of modelsToTry) {
    try {
      const languageModel = resolveModel(model);
      if (!languageModel) continue;

      const result = await generateText({
        model: languageModel,
        messages: messages as Parameters<typeof generateText>[0]['messages'],
        temperature: modelConfig.temperature,
        maxTokens: modelConfig.maxTokens,
      });

      return { text: result.text, modelUsed: model, usage: result.usage };
    } catch (error) {
      logger.warn('Model failed during generation, trying fallback', {
        model,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw new Error('All models failed');
}

// ==================== Task-Based Model Routing ====================

/**
 * Generate a chat completion using the optimal model for a specific task type.
 * Uses task-specific model chains instead of the main fallback chain.
 */
export async function generateTaskCompletion(
  task: AITask,
  messages: Array<{ role: string; content: string }>,
  config: Partial<RAGConfig> = {}
): Promise<ChatCompletionResult> {
  const modelsToTry = await getModelsForTask(task);

  for (const model of modelsToTry) {
    try {
      const languageModel = resolveModel(model);
      if (!languageModel) continue;

      const result = await generateText({
        model: languageModel,
        messages: messages as Parameters<typeof generateText>[0]['messages'],
        temperature: config.temperature ?? (task === 'fast' ? 0.5 : 0.7),
        maxTokens: config.maxTokens ?? (task === 'fast' ? 300 : 2000),
      });

      return { text: result.text, modelUsed: model, usage: result.usage };
    } catch (error) {
      logger.warn('Task model failed, trying fallback', {
        task,
        model,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  throw new Error(`All models failed for task: ${task}`);
}

// ==================== Model Routing ====================

/**
 * Resolve a model ID to the appropriate AI SDK language model instance.
 * All models route through OpenRouter.
 */
export function resolveModel(modelId: string): LanguageModelV1 | null {
  return openrouter(modelId);
}

// ==================== Embeddings (via EMBEDDING_PROVIDER config) ====================

/**
 * Generate an embedding using the configured embedding provider
 * (default: free OpenRouter model, see src/lib/ai/embeddings).
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  const { createEmbeddingProviderFromEnv } = await import('./embeddings');
  const provider = createEmbeddingProviderFromEnv();

  return embeddingCircuitBreaker.execute(() => provider.embedQuery(text));
}

/**
 * Generate embeddings for multiple texts using the configured provider.
 * Batching and rate limiting are handled by the provider.
 */
export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) return [];

  const { createEmbeddingProviderFromEnv } = await import('./embeddings');
  const provider = createEmbeddingProviderFromEnv();

  return provider.embedDocuments(texts);
}

/**
 * Generate cache key for embeddings
 */
export function generateEmbeddingCacheKey(text: string): string {
  return createHash('sha256').update(text).digest('hex');
}

// ==================== RAG System Prompt ====================

export interface RAGContext {
  content: string;
  source: string;
  score: number;
}

export function buildRAGSystemPrompt(context: RAGContext[], query: string): string {
  const contextBlocks = context
    .map((ctx, i) =>
      `
[Source ${i + 1}] ${ctx.source} (Relevance: ${(ctx.score * 100).toFixed(1)}%)
${ctx.content}
    `.trim()
    )
    .join('\n\n---\n\n');

  return `You are a helpful AI assistant answering questions based on the provided documents.

User Query: ${query}

Relevant Document Context:
${contextBlocks}

Instructions:
- Answer the user's query using ONLY the information from the provided documents above.
- If the documents don't contain enough information, say so clearly.
- Always cite your sources using [Source X] format when referencing information.
- Be concise but thorough in your response.`;
}

// ==================== Token Estimation ====================
// Note: estimateTokens is now imported from token-budget.ts for consistency
// See Fix #6 - Unified token estimation

export { estimateTokens };

export function truncateToTokenLimit(text: string, maxTokens: number): string {
  const estimatedChars = maxTokens * 4;
  if (text.length <= estimatedChars) return text;
  return `${text.slice(0, estimatedChars)}...`;
}

// ==================== Similarity Calculation ====================

/**
 * Calculate cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same dimension');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  if (normA === 0 || normB === 0) return 0;

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Find most similar documents given a query embedding
 */
export function findSimilarDocuments(
  queryEmbedding: number[],
  documentEmbeddings: Array<{
    id: string;
    embedding: number[];
    metadata?: Record<string, unknown>;
  }>,
  topK: number = 5,
  threshold: number = 0.7
): Array<{ id: string; score: number; metadata?: Record<string, unknown> }> {
  const similarities = documentEmbeddings.map((doc) => ({
    id: doc.id,
    score: cosineSimilarity(queryEmbedding, doc.embedding),
    metadata: doc.metadata,
  }));

  return similarities
    .filter((doc) => doc.score >= threshold)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);
}

// ==================== Re-export types ====================

export type { UIMessage };
