import { NextRequest } from "next/server";
import { workspaceForApiKey } from "@/lib/api-key";
import { writeAudit } from "@/lib/audit";
import { runGroundedChat } from "@/lib/run-chat";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const queryKey = req.nextUrl.searchParams.get("key") || "";
  const secret = header.startsWith("Bearer ") ? header.slice(7) : queryKey;
  if (!secret) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  const key = await workspaceForApiKey(secret);
  if (!key?.workspaceId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });
  }
  await writeAudit({
    event: "API_KEY_USED",
    userId: key.userId,
    workspaceId: key.workspaceId,
    metadata: { keyId: key.id },
  }).catch(() => {});

  const body = await req.json();
  if (!body.message || typeof body.message !== "string") {
    return new Response(JSON.stringify({ error: "Message is required" }), { status: 400 });
  }
  const user = await prisma.user.findUnique({ where: { id: key.userId } });
  if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401 });

  return runGroundedChat({
    message: body.message,
    userId: user.id,
    workspaceId: key.workspaceId,
    chatId: body.chatId,
    eventName: "embed_message",
  });
}
