import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId") || user.activeWorkspaceId;

  const chats = await prisma.chat.findMany({
    where: {
      userId: user.id,
      ...(workspaceId ? { workspaceId } : {}),
    },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { messages: true } },
    },
    take: 30,
  });

  return NextResponse.json({
    chats: chats.map((c) => ({
      id: c.id,
      title: c.title,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      messageCount: c._count.messages,
    })),
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Chat ID required" }, { status: 400 });
  }

  const existing = await prisma.chat.findFirst({ where: { id, userId: user.id } });
  await prisma.chat.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });
  if (existing) {
    await writeAudit({
      event: "CHAT_DELETED",
      userId: user.id,
      workspaceId: existing.workspaceId,
      metadata: { chatId: id },
    }).catch(() => {});
  }

  return NextResponse.json({ success: true });
}
