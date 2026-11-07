import { env } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { prismaForWorkspace } from "@/lib/hosting";
import { writeAudit } from "@/lib/audit";

export async function tuningJsonl(workspaceId: string) {
  const db = await prismaForWorkspace(workspaceId);
  const messages = await db.message.findMany({
    where: { chat: { workspaceId }, role: "ASSISTANT" },
    orderBy: { createdAt: "asc" },
    include: { chat: { include: { messages: { orderBy: { createdAt: "asc" } } } } },
  });
  return messages
    .map((message) => {
      const prior = message.chat.messages
        .filter((item) => item.createdAt < message.createdAt && item.role === "USER")
        .at(-1);
      return JSON.stringify({
        messages: [
          { role: "user", content: prior?.content || "" },
          { role: "assistant", content: message.content },
        ],
      });
    })
    .join("\n");
}

export async function startTuningJob(workspaceId: string, userId: string) {
  if (!env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is required to start a fine-tuning job");
  }
  const jsonl = await tuningJsonl(workspaceId);
  if (!jsonl.trim()) throw new Error("No question and answer pairs to train on");

  const body = new FormData();
  body.append("purpose", "fine-tune");
  body.append("file", new Blob([jsonl], { type: "application/jsonl" }), "tuning.jsonl");
  const fileResponse = await fetch("https://api.openai.com/v1/files", {
    method: "POST",
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
    body,
  });
  const filePayload = (await fileResponse.json()) as { id?: string; error?: { message?: string } };
  if (!fileResponse.ok || !filePayload.id) {
    throw new Error(filePayload.error?.message || "OpenAI file upload failed");
  }

  const jobResponse = await fetch("https://api.openai.com/v1/fine_tuning/jobs", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ training_file: filePayload.id, model: env.TUNING_MODEL }),
  });
  const jobPayload = (await jobResponse.json()) as {
    id?: string;
    status?: string;
    error?: { message?: string };
  };
  const job = await prisma.tuningJob.create({
    data: {
      workspaceId,
      status: jobResponse.ok ? jobPayload.status || "queued" : "failed",
      providerJobId: jobPayload.id,
      model: env.TUNING_MODEL,
      trainingFileId: filePayload.id,
      error: jobResponse.ok ? null : jobPayload.error?.message || "Fine-tune request failed",
    },
  });
  await writeAudit({
    event: "WORKSPACE_SETTINGS_CHANGED",
    userId,
    workspaceId,
    metadata: { tuningJobId: job.id, providerJobId: job.providerJobId, status: job.status },
  }).catch(() => {});
  if (!jobResponse.ok) throw new Error(job.error || "Fine-tune request failed");
  return job;
}

export async function applyFineTunedModel(workspaceId: string, modelId: string, userId?: string) {
  if (!modelId.trim()) throw new Error("Fine-tuned model id is required");
  const workspace = await prisma.workspace.update({
    where: { id: workspaceId },
    data: { chatModel: modelId.trim() },
  });
  await writeAudit({
    event: "WORKSPACE_SETTINGS_CHANGED",
    userId,
    workspaceId,
    metadata: { chatModel: workspace.chatModel, source: "fine-tune" },
  }).catch(() => {});
  return workspace;
}

export async function refreshTuningJob(jobId: string) {
  const job = await prisma.tuningJob.findUnique({ where: { id: jobId } });
  if (!job?.providerJobId || !env.OPENAI_API_KEY) return job;
  const response = await fetch(`https://api.openai.com/v1/fine_tuning/jobs/${job.providerJobId}`, {
    headers: { Authorization: `Bearer ${env.OPENAI_API_KEY}` },
  });
  if (!response.ok) return job;
  const payload = (await response.json()) as { status?: string; fine_tuned_model?: string; error?: { message?: string } };
  const modelId = payload.fine_tuned_model || job.model;
  const updated = await prisma.tuningJob.update({
    where: { id: job.id },
    data: {
      status: payload.status || job.status,
      model: modelId,
      error: payload.error?.message || null,
    },
  });
  const succeeded = (payload.status || "").toLowerCase() === "succeeded";
  if (succeeded && payload.fine_tuned_model) {
    await applyFineTunedModel(job.workspaceId, payload.fine_tuned_model);
  }
  return updated;
}
