import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();
  const rating = body.rating === "DOWN" ? "DOWN" : "UP";
  const feedback = await prisma.messageFeedback.upsert({
    where: { messageId_userId: { messageId: id, userId: user.id } },
    update: { rating },
    create: { messageId: id, userId: user.id, rating },
  });
  return NextResponse.json({ feedback });
}
