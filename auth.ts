import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import type { Provider } from "next-auth/providers";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { env } from "@/lib/env";

async function ensureWorkspace(userId: string, name: string) {
  const existing = await prisma.workspaceMember.findFirst({ where: { userId } });
  if (existing) return existing.workspaceId;
  const slug = `${name.toLowerCase().replace(/[^a-z0-9]/g, "-")}-${Math.random().toString(36).slice(2, 6)}`;
  const workspace = await prisma.workspace.create({
    data: {
      name: `${name}'s Workspace`,
      slug,
      ownerId: userId,
      members: { create: { userId, role: "OWNER", status: "ACTIVE" } },
    },
  });
  await prisma.user.update({ where: { id: userId }, data: { activeWorkspaceId: workspace.id } });
  return workspace.id;
}

export const { handlers, auth, signIn, signOut } = NextAuth(async () => ({
  trustHost: true,
  secret: env.AUTH_SECRET,
  session: { strategy: "jwt" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {} },
      authorize: async (credentials) => {
        const email = String(credentials?.email || "").toLowerCase();
        const password = String(credentials?.password || "");
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user?.password) return null;
        const valid = await bcrypt.compare(password, user.password);
        if (!valid) return null;
        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),
    ...(env.AUTH_GITHUB_ID
      ? [GitHub({ clientId: env.AUTH_GITHUB_ID, clientSecret: env.AUTH_GITHUB_SECRET })]
      : []),
    ...(env.AUTH_GOOGLE_ID
      ? [Google({ clientId: env.AUTH_GOOGLE_ID, clientSecret: env.AUTH_GOOGLE_SECRET })]
      : []),
    ...((await oidcProviders()) as Provider[]),
  ] as Provider[],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "credentials") return true;
      const email = user.email?.toLowerCase();
      if (!email) return false;
      let record = await prisma.user.findUnique({ where: { email } });
      if (!record) {
        record = await prisma.user.create({
          data: { email, name: user.name, image: user.image, role: "USER" },
        });
      }
      const workspaceId = await ensureWorkspace(record.id, record.name || email);
      if (account?.provider?.startsWith("oidc-")) {
        const slug = account.provider.slice("oidc-".length);
        const workspace = await prisma.workspace.findUnique({ where: { slug } });
        if (workspace) {
          await prisma.workspaceMember.upsert({
            where: { workspaceId_userId: { workspaceId: workspace.id, userId: record.id } },
            update: { status: "ACTIVE" },
            create: { workspaceId: workspace.id, userId: record.id, role: "MEMBER", status: "ACTIVE" },
          });
          await prisma.user.update({
            where: { id: record.id },
            data: { activeWorkspaceId: workspace.id },
          });
        }
      } else {
        user.id = record.id;
      }
      user.id = record.id;
      void workspaceId;
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        const record = await prisma.user.findUnique({ where: { id: user.id } });
        token.id = record?.id;
        token.role = record?.role;
        token.activeWorkspaceId = record?.activeWorkspaceId;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = String(token.id || "");
        session.user.role = (token.role as "USER" | "ADMIN") || "USER";
        session.user.activeWorkspaceId = (token.activeWorkspaceId as string | null) ?? null;
      }
      return session;
    },
  },
}));

async function oidcProviders() {
  const workspaces = await prisma.workspace.findMany({ take: 20 });
  return workspaces
    .map((workspace) => {
      const meta = workspace.ssoMetadata as {
        protocol?: string;
        issuer?: string;
        clientId?: string;
        clientSecret?: string;
      } | null;
      if (meta?.protocol === "saml") return null;
      if (!meta?.issuer || !meta.clientId || !meta.clientSecret) return null;
      return {
        id: `oidc-${workspace.slug}`,
        name: `${workspace.name} SSO`,
        type: "oidc",
        issuer: meta.issuer,
        clientId: meta.clientId,
        clientSecret: meta.clientSecret,
      };
    })
    .filter(Boolean);
}
