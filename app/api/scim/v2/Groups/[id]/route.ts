import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workspaceFromScim } from "@/lib/scim";

function groupResource(group: { id: string; displayName: string; externalId: string | null; members: unknown }) {
  return {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    id: group.id,
    displayName: group.displayName,
    externalId: group.externalId,
    members: Array.isArray(group.members) ? group.members : [],
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const group = await prisma.scimGroup.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(groupResource(group));
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const group = await prisma.scimGroup.findFirst({ where: { id, workspaceId: workspace.id } });
  if (!group) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const body = await req.json();
  let members = Array.isArray(group.members) ? [...group.members] : [];
  let displayName = group.displayName;
  for (const operation of Array.isArray(body.Operations) ? body.Operations : []) {
    const op = String(operation.op || "").toLowerCase();
    if (op === "replace" && operation.path === "displayName") displayName = String(operation.value);
    if (op === "replace" && operation.path === "members") members = operation.value || [];
    if (op === "add" && String(operation.path || "").startsWith("members")) {
      const added = Array.isArray(operation.value) ? operation.value : [operation.value];
      members.push(...added);
    }
    if (op === "remove" && String(operation.path || "").startsWith("members")) {
      const removed = String(operation.path);
      members = members.filter((member) => !removed.includes(String((member as { value?: string }).value || "")));
    }
  }
  const updated = await prisma.scimGroup.update({
    where: { id: group.id },
    data: { displayName, members },
  });
  return NextResponse.json(groupResource(updated));
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  await prisma.scimGroup.deleteMany({ where: { id, workspaceId: workspace.id } });
  return new NextResponse(null, { status: 204 });
}
