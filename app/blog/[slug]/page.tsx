import Link from "next/link";
import { notFound } from "next/navigation";

const ARTICLES: Record<string, { title: string; body: string }> = {
  "zero-cost-rag-architecture": {
    title: "How We Built a Production RAG Chatbot at $0 Recurring Cost",
    body: "Chat and embeddings go through lib/ai.ts using OpenRouter free models. Vectors live in document_chunks via lib/vector.ts. The default models are nvidia/nemotron-3.5-lightning:free and liquid/lfm-2.5-embedding-350m:free.",
  },
  "pgvector-vs-pinecone": {
    title: "Why pgvector Cosine Search Beats Dedicated Vector DBs for Next.js",
    body: "lib/vector.ts orders rows with embedding <=> $1::vector. The HNSW index is created in prisma/migrations/20261030120000_init/migration.sql on document_chunks.embedding.",
  },
  "real-time-sse-streaming-citations": {
    title: "Streaming Server-Sent Events with Verified Citations in React 19",
    body: "app/api/chat/route.ts returns a text/event-stream of sources, token, and done events. app/chat/page.tsx and app/embed/page.tsx render the inspector from the full chunk content.",
  },
  "sliding-window-rate-limiting": {
    title: "Sliding-Window Rate Limiting: Protecting AI Apps from Bill Abuse",
    body: "lib/rate-limit.ts uses Upstash sliding windows. Chat allows 40 requests a minute and upload allows 20. Production boot requires UPSTASH_REDIS_REST_URL.",
  },
};

export default async function BlogArticle({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = ARTICLES[slug];
  if (!article) notFound();
  return (
    <article className="max-w-3xl mx-auto py-10 space-y-4">
      <Link href="/blog" className="text-sm text-primary">Back to the blog</Link>
      <h1 className="text-3xl font-bold">{article.title}</h1>
      <p className="text-sm leading-relaxed text-default-600">{article.body}</p>
    </article>
  );
}
