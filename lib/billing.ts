import Stripe from "stripe";
import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { writeAudit } from "@/lib/audit";

function stripeClient() {
  if (!env.STRIPE_SECRET_KEY) throw new Error("STRIPE_SECRET_KEY is required");
  return new Stripe(env.STRIPE_SECRET_KEY);
}

export async function createProCheckout(workspaceId: string, email: string) {
  if (!env.STRIPE_PRICE_PRO) throw new Error("STRIPE_PRICE_PRO is required");
  const stripe = stripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer_email: email,
    line_items: [{ price: env.STRIPE_PRICE_PRO, quantity: 1 }],
    success_url: `${env.NEXT_PUBLIC_APP_URL}/admin/billing?status=success`,
    cancel_url: `${env.NEXT_PUBLIC_APP_URL}/admin/billing?status=cancel`,
    metadata: { workspaceId },
  });
  return session.url;
}

export async function applyProPlan(workspaceId: string) {
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { plan: "PRO", seatLimit: 10, monthlyQueryLimit: 100000 },
  });
  await writeAudit({
    event: "WORKSPACE_SETTINGS_CHANGED",
    workspaceId,
    metadata: { plan: "PRO", seatLimit: 10, source: "stripe" },
  }).catch(() => {});
  return workspace;
}

export function constructStripeEvent(payload: string, signature: string) {
  if (!env.STRIPE_WEBHOOK_SECRET) throw new Error("STRIPE_WEBHOOK_SECRET is required");
  return stripeClient().webhooks.constructEvent(payload, signature, env.STRIPE_WEBHOOK_SECRET);
}
