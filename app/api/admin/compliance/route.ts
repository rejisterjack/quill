import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { complianceEvidence } from "@/lib/compliance";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  return NextResponse.json(await complianceEvidence());
}
