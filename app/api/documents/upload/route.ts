import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { parsePdf, parseDocx, parseUrl, parseText } from "@/lib/parsers";
import { chunkText } from "@/lib/chunker";
import { createEmbedding } from "@/lib/ai";
import { insertDocumentChunks } from "@/lib/vector";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "Forbidden: Administrator privileges required to index knowledge documents." },
      { status: 403 }
    );
  }

  // Get workspace ID
  const workspaceId =
    req.nextUrl.searchParams.get("workspaceId") ||
    user.activeWorkspaceId ||
    (
      await prisma.workspaceMember.findFirst({
        where: { userId: user.id },
      })
    )?.workspaceId;

  if (!workspaceId) {
    return NextResponse.json({ error: "No active workspace found" }, { status: 400 });
  }

  // Rate limiting: 20 uploads per minute per user
  const { checkRateLimit } = await import("@/lib/rate-limit");
  const rateLimit = checkRateLimit(`upload:${user.id}`, { limit: 20, windowMs: 60 * 1000 });
  if (!rateLimit.success) {
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        workspaceId,
        event: "RATE_LIMIT_HIT",
        severity: "WARNING",
        metadata: { endpoint: "/api/documents/upload", resetMs: rateLimit.resetMs },
      },
    }).catch(() => {});

    return NextResponse.json(
      { error: "Upload rate limit exceeded. Please wait a minute before uploading more documents." },
      { status: 429, headers: { "Retry-After": Math.ceil(rateLimit.resetMs / 1000).toString() } }
    );
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let extractedText = "";
    let fileName = "";
    let fileType = "txt";
    let fileSize = 0;
    let sourceUrl: string | undefined = undefined;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      const urlInput = formData.get("url") as string | null;

      if (urlInput) {
        sourceUrl = urlInput;
        const parsed = await parseUrl(urlInput);
        extractedText = parsed.text;
        fileName = parsed.metadata.title || urlInput;
        fileType = "url";
        fileSize = Buffer.byteLength(extractedText, "utf-8");
      } else if (file) {
        fileName = file.name;
        fileSize = file.size;
        const buffer = Buffer.from(await file.arrayBuffer());

        if (fileName.endsWith(".pdf")) {
          fileType = "pdf";
          const parsed = await parsePdf(buffer);
          extractedText = parsed.text;
        } else if (fileName.endsWith(".docx")) {
          fileType = "docx";
          const parsed = await parseDocx(buffer);
          extractedText = parsed.text;
        } else if (fileName.endsWith(".md") || fileName.endsWith(".markdown")) {
          fileType = "md";
          extractedText = buffer.toString("utf-8");
        } else {
          fileType = "txt";
          extractedText = buffer.toString("utf-8");
        }
      } else {
        return NextResponse.json({ error: "No file or URL provided" }, { status: 400 });
      }
    } else {
      // JSON body
      const body = await req.json();
      if (body.url) {
        sourceUrl = body.url;
        const parsed = await parseUrl(body.url);
        extractedText = parsed.text;
        fileName = parsed.metadata.title || body.url;
        fileType = "url";
        fileSize = Buffer.byteLength(extractedText, "utf-8");
      } else if (body.text) {
        fileName = body.title || "Pasted Text";
        extractedText = body.text;
        fileType = "txt";
        fileSize = Buffer.byteLength(extractedText, "utf-8");
      } else {
        return NextResponse.json({ error: "No text or URL provided in request" }, { status: 400 });
      }
    }

    if (!extractedText.trim()) {
      return NextResponse.json({ error: "Failed to extract text from document" }, { status: 400 });
    }

    // 1. Create document record with PROCESSING status
    const document = await prisma.document.create({
      data: {
        workspaceId,
        userId: user.id,
        name: fileName,
        contentType: fileType,
        size: fileSize,
        content: extractedText.slice(0, 10000), // store preview
        sourceUrl,
        status: "PROCESSING",
      },
    });

    // 2. Chunk document
    const textChunks = chunkText(extractedText, { chunkSize: 1000, chunkOverlap: 200 });

    // 3. Compute embeddings and prepare chunks
    const chunksToInsert = await Promise.all(
      textChunks.map(async (tc) => {
        const embedding = await createEmbedding(tc.content);
        return {
          documentId: document.id,
          workspaceId,
          userId: user.id,
          content: tc.content,
          chunkIndex: tc.chunkIndex,
          start: tc.start,
          end: tc.end,
          page: tc.page,
          section: tc.section,
          documentName: fileName,
          documentType: fileType,
          embedding,
        };
      })
    );

    // 4. Insert into database with pgvector
    await insertDocumentChunks(chunksToInsert);

    // 5. Update document status to COMPLETED
    const updatedDocument = await prisma.document.update({
      where: { id: document.id },
      data: {
        status: "COMPLETED",
        chunkCount: textChunks.length,
      },
    });

    // 6. Log audit event
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        workspaceId,
        event: "DOCUMENT_UPLOADED",
        severity: "INFO",
        metadata: {
          documentId: document.id,
          name: fileName,
          chunks: textChunks.length,
        },
      },
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      document: updatedDocument,
      chunksCreated: textChunks.length,
    });
  } catch (err: unknown) {
    console.error("Document upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Failed to process document" },
      { status: 500 }
    );
  }
}
