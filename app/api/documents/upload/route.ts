import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";
import { writeAudit } from "@/lib/audit";
import { storeOriginal } from "@/lib/storage";
import { assertCanUpload } from "@/lib/authz";
import { inngest } from "@/inngest/client";
import { EmbeddingError } from "@/lib/env";
import type { Prisma } from "@prisma/client";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const workspaceId =
    req.nextUrl.searchParams.get("workspaceId") ||
    user.activeWorkspaceId ||
    (await prisma.workspaceMember.findFirst({ where: { userId: user.id } }))?.workspaceId;

  if (!workspaceId) return NextResponse.json({ error: "No active workspace found" }, { status: 400 });

  try {
    await assertCanUpload(user.id, workspaceId, user.role);
  } catch {
    return NextResponse.json({ error: "Forbidden: Administrator privileges required to index knowledge documents." }, { status: 403 });
  }

  const rateLimit = await checkRateLimit(`upload:${user.id}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    await writeAudit({
      userId: user.id,
      workspaceId,
      event: "RATE_LIMIT_HIT",
      severity: "WARNING",
      metadata: { endpoint: "/api/documents/upload", resetMs: rateLimit.resetMs },
    }).catch(() => {});
    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please wait a minute before uploading more documents." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } },
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let fileName = "Pasted Text";
    let fileType = "txt";
    let fileSize = 0;
    let sourceUrl: string | undefined;
    let storageKey: string | undefined;
    let storageUrl: string | undefined;
    const metadata: Record<string, unknown> = {};

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const urlInput = formData.get("url") as string | null;
      if (urlInput) {
        sourceUrl = urlInput;
        fileName = urlInput;
        fileType = "url";
      } else if (file) {
        fileName = file.name;
        fileSize = file.size;
        const buffer = Buffer.from(await file.arrayBuffer());
        if (fileName.endsWith(".pdf")) fileType = "pdf";
        else if (fileName.endsWith(".docx")) fileType = "docx";
        else if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) fileType = "md";
        else if (/\.(png|jpe?g|webp)$/i.test(fileName)) {
          fileType = fileName.split(".").pop()?.toLowerCase() || "png";
          metadata.mime = file.type || "image/png";
        } else fileType = "txt";
        const stored = await storeOriginal({
          bytes: buffer,
          filename: fileName,
          resourceType: fileType === "png" || fileType === "jpg" || fileType === "jpeg" || fileType === "webp" ? "image" : "raw",
        });
        storageKey = stored.storageKey;
        storageUrl = stored.storageUrl;
      } else {
        return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
      }
    } else {
      const body = await req.json();
      if (body.url) {
        sourceUrl = body.url;
        fileName = body.url;
        fileType = "url";
        if (body.recrawlHours) metadata.recrawlHours = Number(body.recrawlHours);
      } else if (body.text) {
        fileName = body.title || "Pasted Text";
        fileType = "txt";
        fileSize = Buffer.byteLength(body.text, "utf-8");
        metadata.inlineText = body.text;
        const stored = await storeOriginal({
          bytes: Buffer.from(body.text, "utf8"),
          filename: `${fileName}.txt`,
        });
        storageKey = stored.storageKey;
        storageUrl = stored.storageUrl;
      } else {
        return NextResponse.json({ error: "No text or URL provided in request" }, { status: 400 });
      }
    }

    const document = await prisma.document.create({
      data: {
        workspaceId,
        userId: user.id,
        name: fileName,
        contentType: fileType,
        size: fileSize,
        sourceUrl,
        sourceType: fileType,
        storageKey,
        storageUrl,
        status: "PENDING",
        metadata: metadata as Prisma.InputJsonValue,
      },
    });

    await inngest.send({ name: "quill/document.ingest", data: { documentId: document.id } });
    await writeAudit({
      userId: user.id,
      workspaceId,
      event: "DOCUMENT_UPLOADED",
      metadata: { documentId: document.id, name: fileName },
    }).catch(() => {});

    return NextResponse.json({ success: true, document, status: "PENDING" }, { status: 202 });
  } catch (err) {
    const message = err instanceof EmbeddingError || err instanceof Error ? err.message : "Failed to process document";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
