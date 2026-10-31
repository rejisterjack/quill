import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { workspaceForApiKey } from "@/lib/api-key";

export async function GET(req: NextRequest) {
  const key = new URL(req.url).searchParams.get("key");
  const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0];
  const apiKey = key ? await workspaceForApiKey(key) : null;
  const byKey = apiKey?.workspaceId
    ? await prisma.workspace.findUnique({ where: { id: apiKey.workspaceId } })
    : null;
  const byHost = host
    ? await prisma.workspace.findUnique({ where: { customDomain: host } })
    : null;
  const workspace = byKey || byHost;
  return NextResponse.json({
    brandName: workspace?.brandName || "Quill",
    brandColor: workspace?.brandColor || "",
  });
}
