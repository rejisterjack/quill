import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || workspace.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  if (body.switch) {
    await prisma.user.update({ where: { id: user.id }, data: { activeWorkspaceId: id } });
    return NextResponse.json({ success: true, activeWorkspaceId: id });
  }
  const updated = await prisma.workspace.update({
    where: { id },
    data: {
      name: typeof body.name === "string" ? body.name : undefined,
      brandName: typeof body.brandName === "string" ? body.brandName : undefined,
      brandColor: typeof body.brandColor === "string" ? body.brandColor : undefined,
      customDomain: typeof body.customDomain === "string" ? body.customDomain : undefined,
      chatModel: typeof body.chatModel === "string" ? body.chatModel : undefined,
      embeddingModel: typeof body.embeddingModel === "string" ? body.embeddingModel : undefined,
      slackTeamId: typeof body.slackTeamId === "string" ? body.slackTeamId : undefined,
      discordGuildId: typeof body.discordGuildId === "string" ? body.discordGuildId : undefined,
      ssoMetadata: body.ssoMetadata,
    },
  });
  await writeAudit({
    event: "WORKSPACE_UPDATED",
    userId: user.id,
    workspaceId: id,
    metadata: { name: updated.name },
  }).catch(() => {});
  return NextResponse.json({ workspace: updated });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || workspace.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  await prisma.workspace.delete({ where: { id } });
  if (user.activeWorkspaceId === id) {
    const next = await prisma.workspaceMember.findFirst({ where: { userId: user.id } });
    await prisma.user.update({
      where: { id: user.id },
      data: { activeWorkspaceId: next?.workspaceId ?? null },
    });
  }
  await writeAudit({
    event: "WORKSPACE_DELETED",
    userId: user.id,
    metadata: { workspaceId: id },
  }).catch(() => {});
  return NextResponse.json({ success: true });
}
