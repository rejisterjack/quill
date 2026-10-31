import { createHash, randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const email = String(body.email || "").toLowerCase();
  const user = await prisma.user.findUnique({ where: { email } });
  if (user) {
    const token = randomBytes(24).toString("hex");
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: createHash("sha256").update(token).digest("hex"),
        expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      },
    });
    await writeAudit({
      event: "PASSWORD_RESET_REQUESTED",
      userId: user.id,
      metadata: { email },
    }).catch(() => {});
    if (env.NODE_ENV !== "production") {
      return NextResponse.json({ ok: true, resetPath: `/reset?token=${token}` });
    }
    if (env.SMTP_URL) {
      await fetch(env.SMTP_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to: email, resetPath: `/reset?token=${token}` }),
      }).catch(() => {});
    }
  }
  return NextResponse.json({ ok: true });
}
