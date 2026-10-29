import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { openai } from "@/lib/ai";
import { writeAudit } from "@/lib/audit";
import { env } from "@/lib/env";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!env.OPENROUTER_API_KEY) return NextResponse.json({ error: "OPENROUTER_API_KEY is required" }, { status: 400 });
  const form = await req.formData();
  const file = form.get("audio") as File | null;
  if (!file) return NextResponse.json({ error: "audio required" }, { status: 400 });
  const workspace = user.activeWorkspaceId
    ? await prisma.workspace.findUnique({ where: { id: user.activeWorkspaceId } })
    : null;
  const bytes = Buffer.from(await file.arrayBuffer());
  const response = await openai.chat.completions.create({
    model: workspace?.chatModel || "google/gemma-4-26b-a4b-it:free",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Transcribe this audio. Return only the transcript." },
          { type: "input_audio", input_audio: { data: bytes.toString("base64"), format: "wav" } },
        ],
      },
    ],
  });
  const text = response.choices[0]?.message?.content || "";
  await writeAudit({
    event: "VOICE_TRANSCRIPTION",
    userId: user.id,
    workspaceId: user.activeWorkspaceId,
    metadata: { bytes: bytes.length },
  }).catch(() => {});
  return NextResponse.json({ text });
}
