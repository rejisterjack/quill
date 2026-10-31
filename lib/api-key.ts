import { createHash, randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";

export function hashApiKey(secret: string): string {
  return createHash("sha256").update(secret).digest("hex");
}

export function generateApiKey(): { secret: string; preview: string; hash: string } {
  const secret = `qk_${randomBytes(24).toString("hex")}`;
  return {
    secret,
    preview: `${secret.slice(0, 7)}…${secret.slice(-4)}`,
    hash: hashApiKey(secret),
  };
}

export async function workspaceForApiKey(secret: string) {
  const key = await prisma.apiKey.findFirst({
    where: { keyHash: hashApiKey(secret), status: "ACTIVE" },
  });
  if (!key) return null;
  await prisma.apiKey.update({ where: { id: key.id }, data: { lastUsedAt: new Date() } });
  return key;
}
