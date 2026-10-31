import { z } from "zod";

const isProd = process.env.NODE_ENV === "production";

function authSecret(): string {
  const secret = process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET;
  if (secret && secret.length > 0) return secret;
  if (isProd) {
    throw new Error("AUTH_SECRET is required in production");
  }
  return "dev-only-quill-auth-secret";
}

function upstashUrl(): string {
  const value = process.env.UPSTASH_REDIS_REST_URL || "";
  if (!value && isProd) {
    throw new Error("UPSTASH_REDIS_REST_URL is required in production");
  }
  return value;
}

function upstashToken(): string {
  const value = process.env.UPSTASH_REDIS_REST_TOKEN || "";
  if (!value && isProd) {
    throw new Error("UPSTASH_REDIS_REST_TOKEN is required in production");
  }
  return value;
}

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  OPENROUTER_API_KEY: z.string().optional().default(""),
  AUTH_SECRET: z.string().min(1),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:7392"),
  EMBEDDING_PROVIDER: z.string().default("openai"),
  EMBEDDING_MODEL: z.string().default("liquid/lfm-2.5-embedding-350m:free"),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(1024),
  EMBEDDING_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
  CLOUDINARY_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_URL: z.string().optional().default(""),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional().default(""),
  AUTH_GITHUB_ID: z.string().optional().default(""),
  AUTH_GITHUB_SECRET: z.string().optional().default(""),
  AUTH_GOOGLE_ID: z.string().optional().default(""),
  AUTH_GOOGLE_SECRET: z.string().optional().default(""),
  POSTHOG_KEY: z.string().optional().default(""),
  NEXT_PUBLIC_POSTHOG_HOST: z.string().optional().default("https://us.i.posthog.com"),
  SMTP_URL: z.string().optional().default(""),
  ENCRYPTION_KEY: z.string().optional().default(""),
  AUDIT_ARCHIVE_URL: z.string().optional().default(""),
  NOTION_TOKEN: z.string().optional().default(""),
  GITHUB_TOKEN: z.string().optional().default(""),
  SLACK_SIGNING_SECRET: z.string().optional().default(""),
  DISCORD_PUBLIC_KEY: z.string().optional().default(""),
  TARGET_DATABASE_URL: z.string().optional().default(""),
  NEON_API_KEY: z.string().optional().default(""),
  STRIPE_SECRET_KEY: z.string().optional().default(""),
  STRIPE_WEBHOOK_SECRET: z.string().optional().default(""),
  STRIPE_PRICE_PRO: z.string().optional().default(""),
  OPENAI_API_KEY: z.string().optional().default(""),
  TUNING_MODEL: z.string().optional().default("gpt-4o-mini-2024-07-18"),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  AUTH_SECRET: authSecret(),
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER,
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS: process.env.EMBEDDING_DIMENSIONS,
  EMBEDDING_BASE_URL: process.env.EMBEDDING_BASE_URL,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
  UPSTASH_REDIS_REST_URL: upstashUrl(),
  UPSTASH_REDIS_REST_TOKEN: upstashToken(),
  AUTH_GITHUB_ID: process.env.AUTH_GITHUB_ID,
  AUTH_GITHUB_SECRET: process.env.AUTH_GITHUB_SECRET,
  AUTH_GOOGLE_ID: process.env.AUTH_GOOGLE_ID,
  AUTH_GOOGLE_SECRET: process.env.AUTH_GOOGLE_SECRET,
  POSTHOG_KEY: process.env.POSTHOG_KEY || process.env.NEXT_PUBLIC_POSTHOG_KEY,
  NEXT_PUBLIC_POSTHOG_HOST: process.env.NEXT_PUBLIC_POSTHOG_HOST,
  SMTP_URL: process.env.SMTP_URL,
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
  AUDIT_ARCHIVE_URL: process.env.AUDIT_ARCHIVE_URL,
  NOTION_TOKEN: process.env.NOTION_TOKEN,
  GITHUB_TOKEN: process.env.GITHUB_TOKEN,
  SLACK_SIGNING_SECRET: process.env.SLACK_SIGNING_SECRET,
  DISCORD_PUBLIC_KEY: process.env.DISCORD_PUBLIC_KEY,
  TARGET_DATABASE_URL: process.env.TARGET_DATABASE_URL,
  NEON_API_KEY: process.env.NEON_API_KEY,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  STRIPE_PRICE_PRO: process.env.STRIPE_PRICE_PRO,
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  TUNING_MODEL: process.env.TUNING_MODEL,
});

export class EmbeddingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EmbeddingError";
  }
}
