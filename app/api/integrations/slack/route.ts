import { createHmac, timingSafeEqual } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { runGroundedChat } from "@/lib/run-chat";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const raw = await req.text();
  const timestamp = req.headers.get("x-slack-request-timestamp") || "";
  const signature = req.headers.get("x-slack-signature") || "";
  if (!env.SLACK_SIGNING_SECRET) {
    return new Response(JSON.stringify({ error: "Slack is not configured" }), { status: 400 });
  }
  const base = `v0:${timestamp}:${raw}`;
  const expected = `v0=${createHmac("sha256", env.SLACK_SIGNING_SECRET).update(base).digest("hex")}`;
  const a = Buffer.from(expected);
  const b = Buffer.from(signature);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
  }
  const payload = JSON.parse(raw);
  if (payload.type === "url_verification") {
    return Response.json({ challenge: payload.challenge });
  }
  const teamId = payload.team_id || payload.team?.id;
  const text = payload.event?.text || "";
  const workspace = await prisma.workspace.findFirst({ where: { slackTeamId: teamId } });
  if (!workspace) return new Response(JSON.stringify({ error: "Unknown team" }), { status: 404 });
  const owner = await prisma.user.findUnique({ where: { id: workspace.ownerId } });
  if (!owner) return new Response(JSON.stringify({ error: "No owner" }), { status: 404 });
  const chat = await runGroundedChat({
    message: text,
    userId: owner.id,
    workspaceId: workspace.id,
    eventName: "embed_message",
  });
  const answer = await chat.text();
  return new Response(answer, { headers: { "Content-Type": chat.headers.get("Content-Type") || "text/plain" } });
}
