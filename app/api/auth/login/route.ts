import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { verifyPassword, createSessionToken, SESSION_COOKIE_NAME } from "@/lib/auth";
import { writeAudit } from "@/lib/audit";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = loginSchema.parse(body);

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: {
        workspaces: {
          include: { workspace: true },
          take: 1,
        },
      },
    });

    if (!user || !user.password) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const activeWorkspaceId = user.activeWorkspaceId || user.workspaces[0]?.workspaceId || null;

    const token = await createSessionToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      image: user.image,
      activeWorkspaceId,
    });

    // Write audit log
    await writeAudit({
      userId: user.id,
      workspaceId: activeWorkspaceId,
      event: "USER_LOGIN",
      metadata: { method: "credentials" },
      ipAddress: req.headers.get("x-forwarded-for") || "127.0.0.1",
      userAgent: req.headers.get("user-agent"),
    }).catch(() => {});

    const res = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        image: user.image,
        activeWorkspaceId,
      },
    });

    res.cookies.set(SESSION_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 14 * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (err: unknown) {
    const message = err instanceof z.ZodError ? err.issues?.[0]?.message || "Validation failed" : "An error occurred during login";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
