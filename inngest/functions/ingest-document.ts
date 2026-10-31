import { inngest } from "@/inngest/client";
import { ingestDocument } from "@/lib/ingest";
import { prisma } from "@/lib/prisma";
import { crawlUrl } from "@/lib/crawler";

export const ingestDocumentFunction = inngest.createFunction(
  { id: "ingest-document", retries: 2, triggers: [{ event: "quill/document.ingest" }] },
  async ({ event }) => {
    const data = event.data as { documentId?: string };
    if (!data.documentId) return;
    await ingestDocument(data.documentId);
  },
);

export const recrawlFunction = inngest.createFunction(
  { id: "recrawl-urls", triggers: [{ cron: "0 * * * *" }] },
  async () => {
    const docs = await prisma.document.findMany({
      where: { contentType: "url", status: "COMPLETED" },
      take: 50,
    });
    const now = Date.now();
    for (const doc of docs) {
      const meta = (doc.metadata ?? {}) as { recrawlHours?: number; pages?: string[] };
      const hours = meta.recrawlHours;
      if (!hours || !doc.sourceUrl) continue;
      if (now - doc.updatedAt.getTime() < hours * 60 * 60 * 1000) continue;
      const crawled = await crawlUrl(doc.sourceUrl);
      await prisma.document.update({
        where: { id: doc.id },
        data: { status: "PENDING", metadata: { ...meta, pages: crawled.pages, inlineText: crawled.text } },
      });
      await inngest.send({ name: "quill/document.ingest", data: { documentId: doc.id } });
    }
    return { checked: docs.length };
  },
);

export const archiveAuditFunction = inngest.createFunction(
  { id: "archive-audit", triggers: [{ cron: "0 3 * * *" }] },
  async () => {
    const { archiveAuditChain } = await import("@/lib/audit-archive");
    return archiveAuditChain();
  },
);
