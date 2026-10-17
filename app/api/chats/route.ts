import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId") || user?.activeWorkspaceId;

  const chats = await prisma.chat.findMany({
    where: {
      ...(workspaceId ? { workspaceId } : {}),
      ...(user ? { userId: user.id } : {}),
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

  await prisma.chat.deleteMany({
    where: {
      id,
      userId: user.id,
    },
  });

  return NextResponse.json({ success: true });
}
