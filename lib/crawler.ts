import { linksFromHtml, parseUrl } from "@/lib/parsers";

const MAX_PAGES = 20;
const MAX_DEPTH = 2;

export interface CrawlResult {
  text: string;
  title: string;
  pages: string[];
}

export async function crawlUrl(startUrl: string): Promise<CrawlResult> {
  const origin = new URL(startUrl).origin;
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }];
  const seen = new Set<string>();
  const pages: string[] = [];
  const parts: string[] = [];
  let title = startUrl;

  while (queue.length > 0 && pages.length < MAX_PAGES) {
    const next = queue.shift();
    if (!next || seen.has(next.url)) continue;
    seen.add(next.url);
    pages.push(next.url);

    const response = await fetch(next.url, {
      signal: AbortSignal.timeout(10000),
      headers: { "User-Agent": "QuillCrawler/1.0" },
    });
    if (!response.ok) continue;
    const html = await response.text();
    const parsed = await parseUrl(next.url);
    if (pages.length === 1) title = parsed.metadata.title || title;
    parts.push(`# ${parsed.metadata.title || next.url}\n\n${parsed.text}`);

    if (next.depth < MAX_DEPTH) {
      for (const link of linksFromHtml(html, next.url)) {
        if (new URL(link).origin !== origin) continue;
        if (!seen.has(link) && pages.length + queue.length < MAX_PAGES) {
          queue.push({ url: link, depth: next.depth + 1 });
        }
      }
    }
  }

  return { text: parts.join("\n\n"), title, pages };
}
