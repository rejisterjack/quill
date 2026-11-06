import { NextResponse } from "next/server";
import { env } from "@/lib/env";
import { PLAN_LIMITS } from "@/lib/plan-limits";

export async function GET() {
  const stripeEnabled = Boolean(env.STRIPE_SECRET_KEY && env.STRIPE_PRICE_PRO);
  return NextResponse.json({
    stripeEnabled,
    limits: PLAN_LIMITS,
  });
}
