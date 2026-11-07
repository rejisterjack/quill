import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function upsertUser(
  email: string,
  password: string,
  name: string,
  role: "ADMIN" | "USER",
) {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, name, role },
    create: { email, password: passwordHash, name, role },
  });
  const existing = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
  });
  if (!existing) {
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug: email.split("@")[0],
        ownerId: user.id,
        members: {
          create: { userId: user.id, role: "OWNER", status: "ACTIVE" },
        },
      },
    });
    await prisma.user.update({
      where: { id: user.id },
      data: { activeWorkspaceId: workspace.id },
    });
    return { user, workspaceId: workspace.id };
  }
  const membership = await prisma.workspaceMember.findFirst({
    where: { userId: user.id },
  });
  return { user, workspaceId: membership?.workspaceId ?? user.activeWorkspaceId };
}

async function ensureSampleDoc(userId: string, workspaceId: string | null | undefined) {
  if (!workspaceId) return;
  const existing = await prisma.document.findFirst({
    where: { workspaceId, name: "Quill Demo FAQ" },
  });
  if (existing) return;

  const content = `Quill is a self-hosted TypeScript RAG chatbot.
Upload company docs, then chat at /chat or embed /embed.
Default demo login is demo@quill.dev with password Demo1234!.
Self-host on Vercel + Neon for private data. The public playground resets daily.`;

  await prisma.document.create({
    data: {
      userId,
      workspaceId,
      name: "Quill Demo FAQ",
      contentType: "text/plain",
      size: content.length,
      content,
      status: "COMPLETED",
      chunkCount: 1,
      metadata: { inlineText: content },
      chunks: {
        create: [
          {
            userId,
            workspaceId,
            content,
            index: 0,
            start: 0,
            end: content.length,
            documentName: "Quill Demo FAQ",
            documentType: "text/plain",
          },
        ],
      },
    },
  });
}

/** Upsert demo users (+ sample FAQ). Safe to call from /api/demo/reset. */
export async function seedDemo() {
  const admin = await upsertUser(
    "admin@quill.dev",
    "Admin1234!",
    "Quill Admin",
    "ADMIN",
  );
  const demo = await upsertUser(
    "demo@quill.dev",
    "Demo1234!",
    "Demo User",
    "USER",
  );
  await ensureSampleDoc(admin.user.id, admin.workspaceId);
  await ensureSampleDoc(demo.user.id, demo.workspaceId);
  console.log("Seed complete. Demo: demo@quill.dev / Demo1234!");
}

if (import.meta.main) {
  seedDemo()
    .then(() => prisma.$disconnect())
    .catch(async (err) => {
      console.error(err);
      await prisma.$disconnect();
      process.exit(1);
    });
}
