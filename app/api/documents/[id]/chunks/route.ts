import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const chunks = await prisma.documentChunk.findMany({
    where: { documentId: id },
    orderBy: { index: "asc" },
    select: {
      id: true,
      index: true,
      content: true,
      page: true,
      section: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ chunks });
}
