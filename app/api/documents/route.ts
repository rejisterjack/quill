import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { prismaForWorkspace } from "@/lib/hosting";
import { writeAudit } from "@/lib/audit";
import { decryptContent } from "@/lib/crypto";
import { isDemoMode } from "@/lib/demo";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId") || user.activeWorkspaceId;

  const db = workspaceId ? await prismaForWorkspace(workspaceId) : prisma;
  const documents = await db.document.findMany({
    where: {
      ...(workspaceId ? { workspaceId } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { chunks: true },
      },
    },
  });

  return NextResponse.json({
    documents: documents.map((doc) => ({
      ...doc,
      content: decryptContent(doc.content),
      chunkCount: doc._count.chunks || doc.chunkCount,
    })),
  });
}

export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to delete documents." },
      { status: 403 }
    );
  }
  if (isDemoMode()) {
    return NextResponse.json(
      { error: "Document deletion is disabled in demo mode" },
      { status: 403 },
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
  }

  const workspaceId = searchParams.get("workspaceId") || user.activeWorkspaceId;
  const db = workspaceId ? await prismaForWorkspace(workspaceId) : prisma;
  const doc =
    (await db.document.findUnique({ where: { id } })) ||
    (await prisma.document.findUnique({ where: { id } }));

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  const tenantId = doc.workspaceId || workspaceId;
  const store = tenantId ? await prismaForWorkspace(tenantId) : prisma;
  await store.documentChunk.deleteMany({
    where: { documentId: id },
  });

  await store.document.delete({
    where: { id },
  });

  await writeAudit({
    userId: user.id,
    workspaceId: doc.workspaceId,
    event: "DOCUMENT_DELETED",
    metadata: { documentId: id, name: doc.name },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
