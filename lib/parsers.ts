import * as cheerio from "cheerio";
import mammoth from "mammoth";
import { PDFParse } from "pdf-parse";
import { describeImage } from "@/lib/ai";

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
    const parser = new PDFParse({ data: buffer });
    const result = await parser.getText();
    const info = await parser.getInfo().catch(() => ({}));
    await parser.destroy().catch(() => {});

    const pages = result.pages ?? [];
    const text =
      pages.length > 0
        ? pages.map((page) => page.text || "").join("\n\f\n")
        : result.text || "";

    return {
      text,
      metadata: {
        title: (info as { Title?: string })?.Title || undefined,
        author: (info as { Author?: string })?.Author || undefined,
        pageCount: result.total || pages.length || undefined,
      },
    };
  } catch {
    const str = buffer.toString("utf-8").replace(/[^\x20-\x7E\n\t]/g, " ");
    return { text: str.trim(), metadata: {} };
  }
}

export async function parseDocx(buffer: Buffer): Promise<ParsedDocument> {
  const result = await mammoth.extractRawText({ buffer });
  return { text: result.value, metadata: {} };
}

export async function parseImage(buffer: Buffer, mime: string): Promise<ParsedDocument> {
  const text = await describeImage(buffer, mime);
  return { text, metadata: { title: "Scanned image" } };
}

export async function parseUrl(url: string): Promise<ParsedDocument> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(10000),
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
  $("script, style, nav, footer, header, noscript, svg, iframe, form").remove();

  const title = $("title").text().trim() || $("h1").first().text().trim() || url;
  const content = $("main, article, #content, .content, body").first().text();
  const cleanText = content.replace(/\s+/g, " ").trim();
  const links = $("a[href]")
    .map((_, el) => $(el).attr("href") || "")
    .get()
    .filter(Boolean);

  return {
    text: cleanText,
    metadata: { title, url, links } as ParsedDocument["metadata"] & { links?: string[] },
  };
}

export function linksFromHtml(html: string, base: string): string[] {
  const $ = cheerio.load(html);
  const origin = new URL(base).origin;
  const found = new Set<string>();
  $("a[href]").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;
    try {
      const next = new URL(href, base);
      if (next.origin === origin && (next.protocol === "http:" || next.protocol === "https:")) {
        next.hash = "";
        found.add(next.toString());
      }
    } catch {
      /* ignore bad hrefs */
    }
  });
  return Array.from(found);
}

export async function parseText(text: string, title?: string): Promise<ParsedDocument> {
  return { text, metadata: { title } };
}
