import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createProCheckout } from "@/lib/billing";
import { workspaceRole } from "@/lib/authz";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json();
  const workspaceId = String(body.workspaceId || user.activeWorkspaceId || "");
  const role = await workspaceRole(user.id, workspaceId);
  if (role !== "OWNER" && user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  try {
    const url = await createProCheckout(workspaceId, user.email);
    return NextResponse.json({ url });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Checkout failed" }, { status: 400 });
  }
}
