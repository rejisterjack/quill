import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
  DATABASE_URL: z.string().min(1),
  OPENROUTER_API_KEY: z.string().optional().default(""),
  AUTH_SECRET: z.string().default(process.env.NEXTAUTH_SECRET || "super-secret-quill-key-1234"),
  NEXT_PUBLIC_APP_URL: z.string().default("http://localhost:7392"),
  EMBEDDING_PROVIDER: z.string().default("openai"),
  EMBEDDING_MODEL: z.string().default("liquid/lfm-2.5-embedding-350m:free"),
  EMBEDDING_DIMENSIONS: z.coerce.number().default(1024),
  EMBEDDING_BASE_URL: z.string().default("https://openrouter.ai/api/v1"),
  CLOUDINARY_URL: z.string().optional(),
});

export const env = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  DATABASE_URL: process.env.DATABASE_URL,
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  EMBEDDING_PROVIDER: process.env.EMBEDDING_PROVIDER,
  EMBEDDING_MODEL: process.env.EMBEDDING_MODEL,
  EMBEDDING_DIMENSIONS: process.env.EMBEDDING_DIMENSIONS,
  EMBEDDING_BASE_URL: process.env.EMBEDDING_BASE_URL,
  CLOUDINARY_URL: process.env.CLOUDINARY_URL,
});
