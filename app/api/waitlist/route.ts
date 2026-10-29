import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  email: z.string().email(),
  tier: z.enum(["pro", "enterprise"]).default("pro"),
});

export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const email = body.email.toLowerCase();
  const existing = await prisma.waitlistEntry.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Already on the waitlist" }, { status: 409 });
  const entry = await prisma.waitlistEntry.create({ data: { email, tier: body.tier } });
  return NextResponse.json({ email: entry.email, tier: entry.tier }, { status: 201 });
}
