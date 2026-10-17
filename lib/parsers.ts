import * as cheerio from "cheerio";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";

export interface ParsedDocument {
  text: string;
  metadata: {
    title?: string;
    pageCount?: number;
    url?: string;
    author?: string;
  };
}

export async function parsePdf(buffer: Buffer): Promise<ParsedDocument> {
  try {
    const parser = new PDFParse(buffer);
    const result = await parser.getText();
    const info = await parser.getInfo().catch(() => ({}));
    await parser.destroy().catch(() => {});

    return {
      text: typeof result === "string" ? result : (result as { text?: string })?.text || "",
      metadata: {
        title: (info as { Title?: string })?.Title || undefined,
        author: (info as { Author?: string })?.Author || undefined,
      },
    };
  } catch (err) {
    // Fallback simple string extraction if PDF parsing errors
    const str = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\t]/g, " ");
    return {
      text: str.trim(),
      metadata: {},
    };
  }
}

export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  return {
    text: result.value,
    metadata: {},
  };
}

export async function parseUrl(url: string): Promise<ParsedDocument> {
  const response = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch URL: ${response.statusText} (${response.status})`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // Remove non-content elements
  $("script, style, nav, footer, header, noscript, svg, iframe, form").remove();

  const title = $("title").text().trim() || $("h1").first().text().trim() || url;
  
  // Extract text from body or main content
  const content = $("main, article, #content, .content, body").first().text();
  // Normalize whitespace
  const cleanText = content.replace(/\s+/g, " ").trim();

  return {
    text: cleanText,
    metadata: {
      title,
      url,
    },
  };
}

export async function parseText(text: string, title?: string): Promise<ParsedDocument> {
  return {
    text,
    metadata: {
      title,
    },
  };
}
