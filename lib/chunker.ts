import { decode, encode } from "gpt-tokenizer";

export interface TextChunk {
  content: string;
  chunkIndex: number;
  start: number;
  end: number;
  /** Token count from gpt-tokenizer (o200k/cl100k via the package default). */
  tokenCount: number;
  section?: string;
  page?: number;
}

export interface ChunkOptions {
  /** Window size in tokens. */
  chunkSize?: number;
  /** Overlap in tokens. */
  chunkOverlap?: number;
}

const PAGE_MARK = "\f";
const DEFAULT_TOKENS = 256;
const DEFAULT_OVERLAP = 40;

function sectionName(text: string): string | undefined {
  const match = text.match(/^(#{1,4}\s+[^\n]+)/m);
  return match ? match[1].replace(/^[#\s]+/, "") : undefined;
}

function chunkPage(
  pageText: string,
  page: number | undefined,
  chunkSize: number,
  overlap: number,
  baseChar: number,
  startIndex: number,
): { chunks: TextChunk[]; nextIndex: number } {
  const tokens = encode(pageText);
  const chunks: TextChunk[] = [];
  if (tokens.length === 0) return { chunks, nextIndex: startIndex };

  let tokenStart = 0;
  let index = startIndex;
  let searchFrom = 0;

  while (tokenStart < tokens.length) {
    const tokenEnd = Math.min(tokenStart + chunkSize, tokens.length);
    const slice = tokens.slice(tokenStart, tokenEnd);
    const content = decode(slice).trim();
    if (content.length > 0) {
      const located = pageText.indexOf(content, searchFrom);
      const start = baseChar + (located === -1 ? searchFrom : located);
      const prior = pageText.slice(0, located === -1 ? searchFrom : located);
      const priorHeadings = prior.match(/^(#{1,4}\s+[^\n]+)/gm);
      const priorSection = priorHeadings?.at(-1)?.replace(/^[#\s]+/, "");
      chunks.push({
        content,
        chunkIndex: index,
        start,
        end: start + content.length,
        tokenCount: encode(content).length,
        section: sectionName(content) || priorSection,
        page,
      });
      if (located !== -1) searchFrom = located + 1;
      index += 1;
    }
    if (tokenEnd >= tokens.length) break;
    const next = tokenEnd - overlap;
    tokenStart = next > tokenStart ? next : tokenStart + 1;
  }

  return { chunks, nextIndex: index };
}

export function chunkText(text: string, options?: ChunkOptions): TextChunk[] {
  const chunkSize = options?.chunkSize ?? DEFAULT_TOKENS;
  const chunkOverlap = Math.min(options?.chunkOverlap ?? DEFAULT_OVERLAP, Math.max(0, chunkSize - 1));
  if (!text || text.trim().length === 0 || chunkSize < 1) return [];

  const hasPages = text.includes(PAGE_MARK);
  const pages = text.split(PAGE_MARK);
  const chunks: TextChunk[] = [];
  let charBase = 0;
  let index = 0;

  pages.forEach((pageText, pageIndex) => {
    const result = chunkPage(
      pageText,
      hasPages ? pageIndex + 1 : undefined,
      chunkSize,
      chunkOverlap,
      charBase,
      index,
    );
    chunks.push(...result.chunks);
    index = result.nextIndex;
    charBase += pageText.length + PAGE_MARK.length;
  });

  return chunks;
}
