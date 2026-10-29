import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { id } = await params;
  const messages = await prisma.message.findMany({
    where: { chat: { workspaceId: id }, role: "ASSISTANT" },
    orderBy: { createdAt: "asc" },
    include: { chat: { include: { messages: { orderBy: { createdAt: "asc" } } } } },
  });
  const lines = messages.map((message) => {
    const prior = message.chat.messages.filter((item) => item.createdAt < message.createdAt && item.role === "USER").at(-1);
    return JSON.stringify({ question: prior?.content || "", answer: message.content });
  });
  return new NextResponse(lines.join("\n"), {
    headers: { "Content-Type": "application/jsonl", "Content-Disposition": "attachment; filename=tuning.jsonl" },
  });
}
