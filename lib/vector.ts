import { prisma } from "@/lib/prisma";
import { createEmbedding } from "@/lib/ai";

export interface RetrievedChunk {
  id: string;
  documentId: string;
  documentTitle: string;
  content: string;
  similarity: number;
  pageNumber?: number;
  section?: string;
}

export interface ChunkToInsert {
  documentId: string;
  workspaceId: string;
  userId: string;
  content: string;
  chunkIndex: number;
  start: number;
  end: number;
  page?: number;
  section?: string;
  documentName: string;
  documentType: string;
  embedding: number[];
}

export async function insertDocumentChunks(chunks: ChunkToInsert[]): Promise<void> {
  for (const chunk of chunks) {
    const id = `chunk_${Math.random().toString(36).substring(2, 9)}_${Date.now()}`;
    const vectorString = `[${chunk.embedding.join(",")}]`;

    await prisma.$executeRawUnsafe(
      `INSERT INTO document_chunks (
        id, "documentId", "userId", "workspaceId", content,
        index, start, "end", page, section,
        "documentName", "documentType", embedding, "createdAt", "updatedAt"
      ) VALUES (
        $1, $2, $3, $4, $5,
        $6, $7, $8, $9, $10,
        $11, $12, $13::vector, NOW(), NOW()
      )`,
      id,
      chunk.documentId,
      chunk.userId,
      chunk.workspaceId,
      chunk.content,
      chunk.chunkIndex,
      chunk.start,
      chunk.end,
      chunk.page || null,
      chunk.section || null,
      chunk.documentName,
      chunk.documentType,
      vectorString
    );
  }
}

export async function searchSimilarChunks(
  query: string,
  workspaceId?: string | null,
  topK = 5
): Promise<RetrievedChunk[]> {
  try {
    const queryEmbedding = await createEmbedding(query);
    const vectorString = `[${queryEmbedding.join(",")}]`;

    let sql = `
      SELECT id, "documentId", "documentName", content, page, section,
             1 - (embedding <=> $1::vector) as similarity
      FROM document_chunks
      WHERE embedding IS NOT NULL
    `;
    const params: (string | number)[] = [vectorString];

    if (workspaceId) {
      sql += ` AND "workspaceId" = $2`;
      params.push(workspaceId);
    }

    sql += ` ORDER BY embedding <=> $1::vector ASC LIMIT $${params.length + 1}`;
    params.push(topK);

    const rows = (await prisma.$queryRawUnsafe(sql, ...params)) as Array<{
      id: string;
      documentId: string;
      documentName: string;
      content: string;
      page: number | null;
      section: string | null;
      similarity: number;
    }>;

    if (rows && rows.length > 0) {
      return rows.map((r) => ({
        id: r.id,
        documentId: r.documentId,
        documentTitle: r.documentName || "Document",
        content: r.content,
        similarity: Number(r.similarity.toFixed(4)),
        pageNumber: r.page || undefined,
        section: r.section || undefined,
      }));
    }
  } catch (err) {
    console.warn("Vector search failed, attempting keyword fallback:", err instanceof Error ? err.message : err);
  }

  // Keyword / ILIKE fallback if vector search yielded nothing or errored
  const terms = query
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .slice(0, 3);
  
  const chunks = await prisma.documentChunk.findMany({
    where: {
      ...(workspaceId ? { workspaceId } : {}),
      OR: terms.map((term) => ({
        content: { contains: term, mode: "insensitive" },
      })),
    },
    take: topK,
    include: {
      document: {
        select: { name: true },
      },
    },
  });

  return chunks.map((c, idx) => ({
    id: c.id,
    documentId: c.documentId,
    documentTitle: c.document?.name || c.documentName || "Document",
    content: c.content,
    similarity: Math.max(0.6, 0.9 - idx * 0.08),
    pageNumber: c.page || undefined,
    section: c.section || undefined,
  }));
}
