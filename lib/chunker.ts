export interface TextChunk {
  content: string;
  chunkIndex: number;
  start: number;
  end: number;
  tokenCount: number;
  section?: string;
  page?: number;
}

export interface ChunkOptions {
  chunkSize?: number;
  chunkOverlap?: number;
}

export function chunkText(text: string, options?: ChunkOptions): TextChunk[] {
  const chunkSize = options?.chunkSize ?? 1000;
  const chunkOverlap = options?.chunkOverlap ?? 200;

  if (!text || text.trim().length === 0) {
    return [];
  }

  const cleanText = text.trim();
  const chunks: TextChunk[] = [];
  let startIndex = 0;
  let chunkIndex = 0;

  while (startIndex < cleanText.length) {
    let endIndex = Math.min(startIndex + chunkSize, cleanText.length);

    // If we are not at the end of text, try to find a sentence or newline break
    if (endIndex < cleanText.length) {
      const searchWindow = cleanText.substring(Math.max(startIndex, endIndex - 150), endIndex);
      const lastBreak = searchWindow.search(/(\n\n|\.\s|\?\s|!\s)/);
      if (lastBreak !== -1) {
        endIndex = Math.max(startIndex + 100, endIndex - 150 + lastBreak + 1);
      }
    }

    const chunkContent = cleanText.substring(startIndex, endIndex).trim();
    if (chunkContent.length > 0) {
      // Approximate token count: ~4 chars per token
      const tokenCount = Math.ceil(chunkContent.length / 4);

      // Extract optional section heading if markdown header exists
      const headerMatch = chunkContent.match(/^(#{1,4}\s+[^\n]+)/m);
      const section = headerMatch ? headerMatch[1].replace(/^[#\s]+/, "") : undefined;

      chunks.push({
        content: chunkContent,
        chunkIndex,
        start: startIndex,
        end: endIndex,
        tokenCount,
        section,
      });

      chunkIndex++;
    }

    if (endIndex >= cleanText.length) break;
    startIndex = Math.max(startIndex + 1, endIndex - chunkOverlap);
  }

  return chunks;
}
