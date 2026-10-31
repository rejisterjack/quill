import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { scimList, scimUser, workspaceFromScim } from "@/lib/scim";
import { assertSeatAvailable, SeatLimitError } from "@/lib/seats";

export async function GET(req: NextRequest) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const filter = req.nextUrl.searchParams.get("filter") || "";
  const emailMatch = filter.match(/userName eq \"([^\"]+)\"/i);
  const members = await prisma.workspaceMember.findMany({
    where: {
      workspaceId: workspace.id,
      status: { not: "REMOVED" },
      ...(emailMatch ? { user: { email: emailMatch[1].toLowerCase() } } : {}),
    },
    include: { user: true },
  });
  return NextResponse.json(
    scimList(members.map((member) => scimUser(member.user, member.status === "ACTIVE"))),
  );
}

export async function POST(req: NextRequest) {
  const workspace = await workspaceFromScim(req);
  if (!workspace) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const email = String(body.userName || body.emails?.[0]?.value || "").toLowerCase();
  if (!email) return NextResponse.json({ error: "userName required" }, { status: 400 });
  const user = await prisma.user.upsert({
    where: { email },
    update: { name: body.displayName },
    create: { email, name: body.displayName, role: "USER" },
  });
  try {
    await assertSeatAvailable(workspace.id, user.id);
  } catch (err) {
    if (err instanceof SeatLimitError) return NextResponse.json({ error: err.message }, { status: 409 });
    throw err;
  }
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
    update: { status: "ACTIVE" },
    create: { workspaceId: workspace.id, userId: user.id, role: "MEMBER", status: "ACTIVE" },
  });
  await writeAudit({
    event: "MEMBER_JOINED",
    userId: user.id,
    workspaceId: workspace.id,
    metadata: { source: "scim" },
  }).catch(() => {});
  return NextResponse.json(scimUser(user, true), { status: 201 });
}
