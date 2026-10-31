import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { workspaceRole } from "@/lib/authz";
import { assertSeatAvailable, SeatLimitError } from "@/lib/seats";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const role = await workspaceRole(user.id, id);
  if (role !== "OWNER" && role !== "ADMIN" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = await req.json();
  try {
    await assertSeatAvailable(id);
  } catch (err) {
    if (err instanceof SeatLimitError) return NextResponse.json({ error: err.message }, { status: 403 });
    throw err;
  }
  const token = randomBytes(18).toString("hex");
  const invite = await prisma.workspaceInvite.create({
    data: {
      workspaceId: id,
      email: String(body.email || "").toLowerCase(),
      role: body.role || "MEMBER",
      tokenHash: createHash("sha256").update(token).digest("hex"),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });
  await writeAudit({
    event: "MEMBER_INVITED",
    userId: user.id,
    workspaceId: id,
    metadata: { email: invite.email, role: invite.role },
  }).catch(() => {});
  return NextResponse.json({ invitePath: `/invite/${token}`, email: invite.email });
}
