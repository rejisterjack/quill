import { createHash } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { assertSeatAvailable, SeatLimitError } from "@/lib/seats";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { token } = await params;
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const invite = await prisma.workspaceInvite.findUnique({ where: { tokenHash } });
  if (!invite || invite.expiresAt.getTime() < Date.now()) {
    return NextResponse.json({ error: "Invite expired" }, { status: 400 });
  }
  if (invite.email !== user.email.toLowerCase()) {
    return NextResponse.json({ error: "This invite is for a different email" }, { status: 403 });
  }
  try {
    await assertSeatAvailable(invite.workspaceId, user.id);
  } catch (err) {
    if (err instanceof SeatLimitError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: invite.workspaceId, userId: user.id } },
    update: { role: invite.role, status: "ACTIVE" },
    create: { workspaceId: invite.workspaceId, userId: user.id, role: invite.role, status: "ACTIVE" },
  });
  await prisma.workspaceInvite.delete({ where: { id: invite.id } });
  await writeAudit({
    event: "MEMBER_JOINED",
    userId: user.id,
    workspaceId: invite.workspaceId,
    metadata: { role: invite.role },
  }).catch(() => {});
  return NextResponse.json({ success: true, workspaceId: invite.workspaceId });
}
