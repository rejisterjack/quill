import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const workspace = await prisma.workspace.findUnique({ where: { id } });
  if (!workspace || workspace.ownerId !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const token = `qscim_${randomBytes(24).toString("hex")}`;
  const scimTokenHash = createHash("sha256").update(token).digest("hex");
  await prisma.workspace.update({ where: { id }, data: { scimTokenHash } });
  await writeAudit({
    event: "WORKSPACE_UPDATED",
    userId: user.id,
    workspaceId: id,
    metadata: { scim: true },
  }).catch(() => {});
  return NextResponse.json({ token });
}
