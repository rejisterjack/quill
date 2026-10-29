import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyAuditChain } from "@/lib/audit";

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden: Administrator privileges required." }, { status: 403 });

  if (req.nextUrl.searchParams.get("verify") === "1") {
    const result = await verifyAuditChain();
    return NextResponse.json(result);
  }

  const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    include: { user: { select: { email: true, name: true } } },
  });
  const nextCursor = logs.length === 50 ? logs[logs.length - 1]?.id : null;
  return NextResponse.json({ logs, nextCursor });
}
