import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { scimList, workspaceFromScim } from "@/lib/scim";

function groupResource(group: { id: string; displayName: string; externalId: string | null; members: unknown }) {
  const members = Array.isArray(group.members) ? group.members : [];
  return {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:Group"],
    id: group.id,
    displayName: group.displayName,
    externalId: group.externalId,
    members,
  };
}

export async function GET(req: NextRequest) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const groups = await prisma.scimGroup.findMany({ where: { workspaceId: workspace.id } });
  return NextResponse.json(scimList(groups.map(groupResource)));
}

export async function POST(req: NextRequest) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const displayName = String(body.displayName || "");
  if (!displayName) return NextResponse.json({ error: "displayName required" }, { status: 400 });
  const group = await prisma.scimGroup.upsert({
    where: { workspaceId_displayName: { workspaceId: workspace.id, displayName } },
    update: { externalId: body.externalId, members: body.members || [] },
    create: {
      workspaceId: workspace.id,
      displayName,
      externalId: body.externalId,
      members: body.members || [],
    },
  });
  return NextResponse.json(groupResource(group), { status: 201 });
}
