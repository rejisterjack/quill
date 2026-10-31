import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { scimUser, workspaceFromScim } from "@/lib/scim";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: id } },
    include: { user: true },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(scimUser(member.user, member.status === "ACTIVE"));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const operations = Array.isArray(body.Operations) ? body.Operations : [];
  const data: { name?: string; status?: "ACTIVE" | "REMOVED" } = {};
  for (const operation of operations) {
    const op = String(operation.op || "").toLowerCase();
    if (op !== "replace" && op !== "add") continue;
    const path = String(operation.path || "");
    if (path === "active" || operation.value?.active !== undefined) {
      const active = path === "active" ? operation.value : operation.value.active;
      data.status = active === false || active === "false" ? "REMOVED" : "ACTIVE";
    }
    if (path === "displayName" || operation.value?.displayName) {
      data.name = path === "displayName" ? String(operation.value) : String(operation.value.displayName);
    }
  }
  if (data.name) {
    await prisma.user.update({ where: { id }, data: { name: data.name } });
  }
  if (data.status) {
    await prisma.workspaceMember.updateMany({
      where: { workspaceId: workspace.id, userId: id },
      data: { status: data.status },
    });
    await writeAudit({
      event: data.status === "REMOVED" ? "MEMBER_REMOVED" : "MEMBER_JOINED",
      userId: id,
      workspaceId: workspace.id,
      metadata: { source: "scim" },
    }).catch(() => {});
  }
  const member = await prisma.workspaceMember.findUnique({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: id } },
    include: { user: true },
  });
  if (!member) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(scimUser(member.user, member.status === "ACTIVE"));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.workspaceMember.updateMany({
    where: { workspaceId: workspace.id, userId: id },
    data: { status: "REMOVED" },
  });
  await writeAudit({
    event: "MEMBER_REMOVED",
    userId: id,
    workspaceId: workspace.id,
    metadata: { source: "scim" },
  }).catch(() => {});
  return new NextResponse(null, { status: 204 });
}
