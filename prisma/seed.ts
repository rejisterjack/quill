import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

async function upsertUser(email: string, password: string, name: string, role: "ADMIN" | "USER") {
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: passwordHash, name, role },
    create: { email, password: passwordHash, name, role },
  });
  const existing = await prisma.workspaceMember.findFirst({ where: { userId: user.id } });
  if (!existing) {
    const workspace = await prisma.workspace.create({
      data: {
        name: `${name}'s Workspace`,
        slug: email.split("@")[0],
        ownerId: user.id,
        members: { create: { userId: user.id, role: "OWNER", status: "ACTIVE" } },
      },
    });
    await prisma.user.update({ where: { id: user.id }, data: { activeWorkspaceId: workspace.id } });
  }
}

async function main() {
  await upsertUser("admin@quill.dev", "Admin1234!", "Quill Admin", "ADMIN");
  await upsertUser("demo@quill.dev", "Demo1234!", "Demo User", "USER");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (err) => {
    console.error(err);
    await prisma.$disconnect();
    process.exit(1);
  });
