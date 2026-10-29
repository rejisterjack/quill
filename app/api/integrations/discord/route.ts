import { createPublicKey, verify } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { runGroundedChat } from "@/lib/run-chat";
import { env } from "@/lib/env";

function discordSignatureValid(rawBody: string, signature: string, timestamp: string) {
  if (!env.DISCORD_PUBLIC_KEY) return false;
  const key = createPublicKey({
    key: Buffer.concat([
      Buffer.from("302a300506032b6570032100", "hex"),
      Buffer.from(env.DISCORD_PUBLIC_KEY, "hex"),
    ]),
    format: "der",
    type: "spki",
  });
  return verify(null, Buffer.from(timestamp + rawBody), key, Buffer.from(signature, "hex"));
}

export async function POST(req: NextRequest) {
  const signature = req.headers.get("x-signature-ed25519");
  const timestamp = req.headers.get("x-signature-timestamp");
  const rawBody = await req.text();
  if (!signature || !timestamp || !discordSignatureValid(rawBody, signature, timestamp)) {
    return new Response(JSON.stringify({ error: "Invalid Discord signature" }), { status: 401 });
  }
  const body = JSON.parse(rawBody);
  if (body.type === 1) return Response.json({ type: 1 });
  const guildId = body.guild_id;
  const content = body.data?.options?.find((option: { name: string }) => option.name === "question")?.value || body.data?.content || "";
  const workspace = await prisma.workspace.findFirst({ where: { discordGuildId: guildId } });
  if (!workspace) return Response.json({ type: 4, data: { content: "This server is not linked." } });
  const owner = await prisma.user.findUnique({ where: { id: workspace.ownerId } });
  if (!owner) return Response.json({ type: 4, data: { content: "Workspace owner missing." } });
  const chat = await runGroundedChat({
    message: String(content),
    userId: owner.id,
    workspaceId: workspace.id,
    eventName: "embed_message",
  });
  const raw = await chat.text();
  const answer = raw.includes("event: token") ? "Answer is streaming in Quill." : raw.slice(0, 1800);
  return Response.json({ type: 4, data: { content: answer || "No answer." } });
}
