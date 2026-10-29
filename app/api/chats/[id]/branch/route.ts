import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const chat = await prisma.chat.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!chat || chat.userId !== user.id) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const index = chat.messages.findIndex((message) => message.id === body.messageId);
  const kept = index >= 0 ? chat.messages.slice(0, index + 1) : chat.messages;
  const branched = await prisma.chat.create({
    data: {
      userId: user.id,
      workspaceId: chat.workspaceId,
      title: `Branch: ${chat.title}`,
      messages: {
        create: kept.map((message) => ({
          role: message.role,
          content: message.content,
          sources: message.sources ?? undefined,
        })),
      },
    },
  });
  await writeAudit({
    event: "CONVERSATION_BRANCHED",
    userId: user.id,
    workspaceId: chat.workspaceId,
    metadata: { from: id, to: branched.id, messageId: body.messageId },
  }).catch(() => {});
  return NextResponse.json({ chatId: branched.id });
}
