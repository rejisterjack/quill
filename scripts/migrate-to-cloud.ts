import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const source = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
const targetUrl = process.env.TARGET_DATABASE_URL;
if (!targetUrl) throw new Error("TARGET_DATABASE_URL is required");
const target = new PrismaClient({ adapter: new PrismaPg({ connectionString: targetUrl }) });

async function copyTable(name: "user" | "workspace" | "document" | "documentChunk" | "chat" | "message") {
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

async function main() {
  const counts = {
    users: await copyTable("user"),
    workspaces: await copyTable("workspace"),
    documents: await copyTable("document"),
    chunks: await copyTable("documentChunk"),
    chats: await copyTable("chat"),
    messages: await copyTable("message"),
  };
  console.log(counts);
  await source.$disconnect();
  await target.$disconnect();
}

main().catch(async (err) => {
  console.error(err);
  await source.$disconnect();
  await target.$disconnect();
  process.exit(1);
});
