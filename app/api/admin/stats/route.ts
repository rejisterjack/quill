import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  let healthy = true;
  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch {
    healthy = false;
  }

  const [users, documents, chunks, chats, formats, messages] = await Promise.all([
    prisma.user.count(),
    prisma.document.count(),
    prisma.documentChunk.count(),
    prisma.chat.count(),
    prisma.document.groupBy({ by: ["contentType"], _count: { _all: true } }),
    prisma.message.findMany({
      where: { role: "ASSISTANT" },
      select: { metadata: true },
      take: 200,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const latencies: number[] = [];
  const similarities: number[] = [];
  for (const message of messages) {
    const meta = (message.metadata ?? {}) as { retrievalMs?: number; topSimilarity?: number | null };
    if (typeof meta.retrievalMs === "number") latencies.push(meta.retrievalMs);
    if (typeof meta.topSimilarity === "number") similarities.push(meta.topSimilarity);
  }
  const avg = (values: number[]) =>
    values.length ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length) : 0;

  return NextResponse.json({
    users,
    documents,
    chunks,
    chats,
    healthy,
    formats: formats.map((row) => ({ type: row.contentType, count: row._count._all })),
    avgRetrievalMs: avg(latencies),
    avgSimilarity: similarities.length
      ? Number((similarities.reduce((sum, value) => sum + value, 0) / similarities.length).toFixed(3))
      : 0,
  });
}
