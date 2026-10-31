import { prisma } from "@/lib/prisma";
import { parseDocx, parseImage, parsePdf, parseText } from "@/lib/parsers";
import { crawlUrl } from "@/lib/crawler";
import { chunkText } from "@/lib/chunker";
import { createEmbedding } from "@/lib/ai";
import { insertDocumentChunks } from "@/lib/vector";
import { writeAudit } from "@/lib/audit";
import { decryptContent, encryptContent } from "@/lib/crypto";
import { downloadOriginal, storeOriginal } from "@/lib/storage";
import { captureProductEvent } from "@/lib/analytics";
import { EmbeddingError } from "@/lib/env";

export async function ingestDocument(documentId: string): Promise<void> {
  const document = await prisma.document.findUnique({ where: { id: documentId } });
  if (!document) return;

  await prisma.document.update({
    where: { id: documentId },
    data: { status: "PROCESSING" },
  });

  try {
    const workspace = document.workspaceId
      ? await prisma.workspace.findUnique({ where: { id: document.workspaceId } })
      : null;

    let text = "";
    let pageMarked = false;
    const meta = (document.metadata ?? {}) as {
      pages?: string[];
      inlineText?: string;
      mime?: string;
    };

    if (document.sourceUrl && document.contentType === "url") {
      const crawled = await crawlUrl(document.sourceUrl);
      text = crawled.text;
      const stored = await storeOriginal({
        bytes: Buffer.from(text, "utf8"),
        filename: `${document.name}.txt`,
      });
      await prisma.document.update({
        where: { id: documentId },
        data: {
          storageKey: stored.storageKey,
          storageUrl: stored.storageUrl,
          metadata: { ...meta, pages: crawled.pages },
          name: crawled.title || document.name,
        },
      });
    } else if (meta.inlineText) {
      text = meta.inlineText;
    } else if (document.storageUrl) {
      const bytes = await downloadOriginal(document.storageUrl);
      if (document.contentType === "pdf") {
        const parsed = await parsePdf(bytes);
        text = parsed.text;
        pageMarked = true;
        if (!text.trim()) {
          text = (await parseImage(bytes, "application/pdf")).text;
          pageMarked = false;
        }
      } else if (document.contentType === "docx") {
        text = (await parseDocx(bytes)).text;
      } else if (["png", "jpg", "jpeg", "webp"].includes(document.contentType)) {
        const mime = meta.mime || `image/${document.contentType === "jpg" ? "jpeg" : document.contentType}`;
        text = (await parseImage(bytes, mime)).text;
      } else {
        text = bytes.toString("utf8");
      }
    } else if (document.content) {
      text = decryptContent(document.content);
    }

    if (!text.trim()) {
      throw new EmbeddingError("Failed to extract text from document");
    }

    const textChunks = chunkText(text);
    const chunksToInsert = [];
    for (const tc of textChunks) {
      const embedding = await createEmbedding(tc.content, {
        model: workspace?.embeddingModel,
        dimensions: workspace?.embeddingDimensions,
      });
      chunksToInsert.push({
        documentId: document.id,
        workspaceId: document.workspaceId || "",
        userId: document.userId,
        content: tc.content,
        chunkIndex: tc.chunkIndex,
        start: tc.start,
        end: tc.end,
        page: pageMarked ? tc.page : tc.page,
        section: tc.section,
        documentName: document.name,
        documentType: document.contentType,
        embedding,
      });
    }

    await insertDocumentChunks(chunksToInsert);
    await prisma.document.update({
      where: { id: documentId },
      data: {
        status: "COMPLETED",
        chunkCount: textChunks.length,
        content: encryptContent(text.slice(0, 10000)),
      },
    });
    await writeAudit({
      event: "DOCUMENT_PROCESSED",
      userId: document.userId,
      workspaceId: document.workspaceId,
      metadata: { documentId, chunks: textChunks.length },
    });
    await captureProductEvent("document_ingested", {
      workspaceId: document.workspaceId,
      contentType: document.contentType,
      chunks: textChunks.length,
    });
  } catch (err) {
    await prisma.document.update({
      where: { id: documentId },
      data: { status: "FAILED" },
    });
    await writeAudit({
      event: "DOCUMENT_PROCESSING_FAILED",
      severity: "ERROR",
      userId: document.userId,
      workspaceId: document.workspaceId,
      metadata: { documentId, error: err instanceof Error ? err.message : "failed" },
    }).catch(() => {});
    throw err;
  }
}

export async function parseTextPreview(text: string) {
  return parseText(text);
}
