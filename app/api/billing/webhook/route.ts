import { NextRequest, NextResponse } from "next/server";
import { applyProPlan, constructStripeEvent } from "@/lib/billing";

export async function POST(req: NextRequest) {
  const signature = req.headers.get("stripe-signature") || "";
  const payload = await req.text();
  try {
    const event = constructStripeEvent(payload, signature);
    if (event.type === "checkout.session.completed") {
      const workspaceId = event.data.object.metadata?.workspaceId;
      if (workspaceId) await applyProPlan(workspaceId);
    }
    return NextResponse.json({ received: true });
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : "Invalid webhook" }, { status: 400 });
  }
}
