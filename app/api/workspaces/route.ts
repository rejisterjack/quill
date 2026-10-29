import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { assertCanCreateWorkspace, SeatLimitError } from "@/lib/seats";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const memberships = await prisma.workspaceMember.findMany({
    where: { userId: user.id, status: "ACTIVE" },
    include: { workspace: true },
  });
  return NextResponse.json({
    workspaces: memberships.map((membership) => ({
      ...membership.workspace,
      role: membership.role,
    })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    await assertCanCreateWorkspace(user.id);
  } catch (err) {
    if (err instanceof SeatLimitError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
  const body = await req.json().catch(() => ({}));
  const name = String(body.name || `${user.name || "Quill"} workspace`);
  const slug = String(body.slug || name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  const workspace = await prisma.workspace.create({
    data: {
      name,
      slug: `${slug || "workspace"}-${Math.random().toString(36).slice(2, 6)}`,
      ownerId: user.id,
      members: { create: { userId: user.id, role: "OWNER", status: "ACTIVE" } },
    },
  });
  await prisma.user.update({ where: { id: user.id }, data: { activeWorkspaceId: workspace.id } });
  await writeAudit({
    event: "WORKSPACE_CREATED",
    userId: user.id,
    workspaceId: workspace.id,
    metadata: { slug: workspace.slug },
  }).catch(() => {});
  return NextResponse.json({ workspace }, { status: 201 });
}
