import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || (workspace.ownerId !== user.id && user.role !== "ADMIN")) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  const updated = await prisma.workspace.update({
    where: { id },
    data: {
      chatModel: body.chatModel,
      embeddingModel: body.embeddingModel,
      embeddingDimensions: body.embeddingDimensions,
    },
  });
  await writeAudit({
    event: "WORKSPACE_SETTINGS_CHANGED",
    userId: user.id,
    workspaceId: id,
    metadata: { chatModel: updated.chatModel, embeddingModel: updated.embeddingModel },
  }).catch(() => {});
  return NextResponse.json({ workspace: updated });
}
