import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getConnector, listConnectors } from "@/lib/connectors/registry";
import { inngest } from "@/inngest/client";
import { storeOriginal } from "@/lib/storage";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ connectors: listConnectors() });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const body = await req.json();
  const connector = getConnector(String(body.connector || ""));
  if (!connector) return NextResponse.json({ error: "Unknown connector" }, { status: 404 });
  const workspaceId = body.workspaceId || user.activeWorkspaceId;
  if (!workspaceId) return NextResponse.json({ error: "No workspace" }, { status: 400 });
  const docs = await connector.listUpdates(body.config || {});
  const created = [];
  for (const doc of docs) {
    const stored = await storeOriginal({
      bytes: Buffer.from(doc.text || "", "utf8"),
      filename: `${doc.title}.txt`,
    });
    const record = await prisma.document.create({
      data: {
        workspaceId,
        userId: user.id,
        name: doc.title,
        contentType: "txt",
        sourceUrl: doc.sourceUrl,
        sourceType: connector.id,
        storageKey: stored.storageKey,
        storageUrl: stored.storageUrl,
        status: "PENDING",
        metadata: { inlineText: doc.text, externalId: doc.externalId },
      },
    });
    await inngest.send({ name: "quill/document.ingest", data: { documentId: record.id } });
    created.push(record.id);
  }
  return NextResponse.json({ created });
}
