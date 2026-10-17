import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const workspaceId = searchParams.get("workspaceId") || user.activeWorkspaceId;

  const documents = await prisma.document.findMany({
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

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
  }

  const doc = await prisma.document.findUnique({
    where: { id },
  });

  if (!doc) {
    return NextResponse.json({ error: "Document not found" }, { status: 404 });
  }

  // Delete chunks and document
  await prisma.documentChunk.deleteMany({
    where: { documentId: id },
  });

  await prisma.document.delete({
    where: { id },
  });

  await prisma.auditLog.create({
    data: {
      userId: user.id,
      workspaceId: doc.workspaceId,
      event: "DOCUMENT_DELETED",
      severity: "INFO",
      metadata: { documentId: id, name: doc.name },
    },
  }).catch(() => {});

  return NextResponse.json({ success: true });
}
