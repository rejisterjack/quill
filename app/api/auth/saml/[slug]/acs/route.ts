import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";
import { samlPair } from "@/lib/saml";
import { assertSeatAvailable, SeatLimitError } from "@/lib/seats";
import { env } from "@/lib/env";

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pair = await samlPair(slug);
  if (!pair) return NextResponse.json({ error: "SAML is not configured" }, { status: 404 });
  const form = await req.formData();
  const samlResponse = String(form.get("SAMLResponse") || "");
  if (!samlResponse) return NextResponse.json({ error: "SAMLResponse required" }, { status: 400 });

  let email = "";
  let name = "";
  try {
    const parsed = await pair.sp.parseLoginResponse(pair.idp, "post", {
      body: { SAMLResponse: samlResponse },
    });
    const attribute = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) || "";
    email = (parsed.extract.nameID || attribute(parsed.extract.attributes?.email)).toLowerCase();
    name = attribute(parsed.extract.attributes?.displayName) || attribute(parsed.extract.attributes?.name) || email;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "SAML assertion rejected" },
      { status: 401 },
    );
  }
  if (!email.includes("@")) return NextResponse.json({ error: "SAML nameID is not an email" }, { status: 400 });

  const user = await prisma.user.upsert({
    where: { email },
    update: { name },
    create: { email, name, role: "USER" },
  });
  try {
    await assertSeatAvailable(pair.workspace.id, user.id);
  } catch (err) {
    if (err instanceof SeatLimitError) {
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(err.message)}`, env.NEXT_PUBLIC_APP_URL));
    }
    throw err;
  }
  await prisma.workspaceMember.upsert({
    where: { workspaceId_userId: { workspaceId: pair.workspace.id, userId: user.id } },
    update: { status: "ACTIVE" },
    create: { workspaceId: pair.workspace.id, userId: user.id, role: "MEMBER", status: "ACTIVE" },
  });
  await prisma.user.update({ where: { id: user.id }, data: { activeWorkspaceId: pair.workspace.id } });
  const token = await createSessionToken({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    activeWorkspaceId: pair.workspace.id,
  });
  await writeAudit({
    event: "USER_LOGIN",
    userId: user.id,
    workspaceId: pair.workspace.id,
    metadata: { method: "saml", slug },
  }).catch(() => {});
  const res = NextResponse.redirect(new URL("/chat", env.NEXT_PUBLIC_APP_URL));
  res.cookies.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
  });
  return res;
}
