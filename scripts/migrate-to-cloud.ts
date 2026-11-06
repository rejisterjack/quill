/**
 * Copy Community / self-hosted data into a Pro managed Neon tenant.
 *
 * Usage:
 *   DATABASE_URL=<source> TARGET_DATABASE_URL=<neon-uri> bun scripts/migrate-to-cloud.ts
 *
 * TARGET_DATABASE_URL should be the workspace's Neon connection string
 * (shown once after Provision Neon, also stored encrypted as workspace.targetDatabaseUrl).
 *
 * Vector columns:
 * - `document_chunks.embedding` is Prisma `Unsupported("vector")` / pgvector.
 * - Prisma upsert cannot round-trip Unsupported vector fields safely.
 * - This script copies scalar tables via Prisma; embeddings are copied with raw SQL
 *   (`embedding::text` → `::vector`) so cosine search works on the target without re-embed.
 * - Enable the extension on the target first: `CREATE EXTENSION IF NOT EXISTS vector;`
 * - Match embedding dimensions (default 1024) before cutover.
 */
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const source = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const targetUrl = process.env.TARGET_DATABASE_URL;
if (!targetUrl) throw new Error("TARGET_DATABASE_URL is required");
const target = new PrismaClient({ adapter: new PrismaPg({ connectionString: targetUrl }) });

async function copyTable(name: "user" | "workspace" | "document" | "chat" | "message") {
  const rows = await (source[name] as { findMany: () => Promise<unknown[]> }).findMany();
  for (const row of rows) {
    await (target[name] as { upsert: (args: unknown) => Promise<unknown> }).upsert({
      where: { id: (row as { id: string }).id },
      update: row,
      create: row,
    });
  }
  return rows.length;
}

/** Copy chunks including pgvector embeddings via text cast (not Prisma Unsupported). */
async function copyChunksWithVectors() {
  await target.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS vector`);
  const rows = await source.$queryRawUnsafe<
    Array<{
      id: string;
      documentId: string;
      userId: string;
      workspaceId: string | null;
      content: string;
      index: number;
      start: number;
      end: number;
      page: number | null;
      section: string | null;
      documentName: string | null;
      documentType: string | null;
      embedding: string | null;
      createdAt: Date;
      updatedAt: Date;
    }>
  >(
    `SELECT id, "documentId", "userId", "workspaceId", content, index, start, "end", page, section,
            "documentName", "documentType", embedding::text AS embedding, "createdAt", "updatedAt"
     FROM document_chunks`,
  );

  for (const row of rows) {
    await target.$executeRawUnsafe(
      `INSERT INTO document_chunks (
        id, "documentId", "userId", "workspaceId", content,
        index, start, "end", page, section,
        "documentName", "documentType", embedding, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13::vector, $14, $15
      )
      ON CONFLICT (id) DO UPDATE SET
        content = EXCLUDED.content,
        embedding = EXCLUDED.embedding,
        "updatedAt" = EXCLUDED."updatedAt"`,
      row.id,
      row.documentId,
      row.userId,
      row.workspaceId,
      row.content,
      row.index,
      row.start,
      row.end,
      row.page,
      row.section,
      row.documentName,
      row.documentType,
      row.embedding,
      row.createdAt,
      row.updatedAt,
    );
  }
  return rows.length;
}

async function main() {
  const counts = {
    users: await copyTable("user"),
    workspaces: await copyTable("workspace"),
    documents: await copyTable("document"),
    chunks: await copyChunksWithVectors(),
    chats: await copyTable("chat"),
    messages: await copyTable("message"),
  };
  console.log(counts);
  console.log(
    "Done. Point the Pro workspace at this Neon URI (already on workspace.targetDatabaseUrl after provision).",
  );
  await source.$disconnect();
  await target.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await source.$disconnect();
  await target.$disconnect();
  process.exit(1);
});
