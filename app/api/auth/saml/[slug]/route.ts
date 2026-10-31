import { NextRequest, NextResponse } from "next/server";
import { samlPair } from "@/lib/saml";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pair = await samlPair(slug);
  if (!pair) return NextResponse.json({ error: "SAML is not configured for this workspace" }, { status: 404 });
  const request = pair.sp.createLoginRequest(pair.idp, "redirect");
  return NextResponse.redirect(request.context);
}
