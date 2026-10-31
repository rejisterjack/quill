import { serve } from "inngest/next";
import { inngest } from "@/inngest/client";
import { archiveAuditFunction, ingestDocumentFunction, recrawlFunction } from "@/inngest/functions/ingest-document";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [ingestDocumentFunction, recrawlFunction, archiveAuditFunction],
});
