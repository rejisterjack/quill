import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { generateApiKey } from "@/lib/api-key";
import { writeAudit } from "@/lib/audit";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const keys = await prisma.apiKey.findMany({
    where: { userId: user.id },
    select: { id: true, name: true, keyPreview: true, status: true, workspaceId: true, createdAt: true },
  });
  return NextResponse.json({ keys });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const workspaceId = body.workspaceId || user.activeWorkspaceId;
  if (!workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const generated = generateApiKey();
  const key = await prisma.apiKey.create({
    data: {
      name: body.name || "Embed key",
      userId: user.id,
      workspaceId,
      keyHash: generated.hash,
      keyPreview: generated.preview,
      status: "ACTIVE",
    },
  });
  await writeAudit({
    event: "API_KEY_CREATED",
    userId: user.id,
    workspaceId,
    metadata: { keyId: key.id },
  }).catch(() => {});
  return NextResponse.json({ key: { id: key.id, preview: generated.preview }, secret: generated.secret });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  const key = await prisma.apiKey.update({ where: { id }, data: { status: "REVOKED" } });
  await writeAudit({
    event: "API_KEY_REVOKED",
    userId: user.id,
    workspaceId: key.workspaceId,
    metadata: { keyId: id },
  }).catch(() => {});
  return NextResponse.json({ success: true });
}
