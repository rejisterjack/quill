import { createHash } from "crypto";
import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function workspaceFromScim(req: NextRequest) {
  const header = req.headers.get("authorization") || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const hash = createHash("sha256").update(token).digest("hex");
  return prisma.workspace.findFirst({ where: { scimTokenHash: hash } });
}

export function scimUser(user: { id: string; email: string; name: string | null }, active: boolean) {
  return {
    schemas: ["urn:ietf:params:scim:schemas:core:2.0:User"],
    id: user.id,
    userName: user.email,
    displayName: user.name || user.email,
    active,
    emails: [{ value: user.email, primary: true }],
  };
}

export function scimList(resources: unknown[]) {
  return {
    schemas: ["urn:ietf:params:scim:api:messages:2.0:ListResponse"],
    totalResults: resources.length,
    startIndex: 1,
    itemsPerPage: resources.length,
    Resources: resources,
  };
}
