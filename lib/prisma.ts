import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaByUrl: Map<string, PrismaClient> | undefined;
};

function createPrismaClient(connectionString: string): PrismaClient {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

function defaultUrl(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }
  return connectionString;
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient(defaultUrl());

/** Tenant Postgres when a workspace has a stored Neon URI; otherwise the control-plane client. */
export function prismaForUrl(connectionString: string): PrismaClient {
  if (!connectionString || connectionString === process.env.DATABASE_URL) return prisma;
  const cache = globalForPrisma.prismaByUrl ?? new Map<string, PrismaClient>();
  globalForPrisma.prismaByUrl = cache;
  const hit = cache.get(connectionString);
  if (hit) return hit;
  const client = createPrismaClient(connectionString);
  cache.set(connectionString, client);
  return client;
}

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export type { PrismaClient };
