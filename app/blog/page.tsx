"use client";

import React from "react";
import Link from "next/link";
import { Button, Card, CardHeader, CardContent, Chip } from "@heroui/react";
import {
  SparklesIcon,
  BookOpenIcon,
  ClockIcon,
  ArrowRightIcon,
  CpuChipIcon,
  BoltIcon,
  ShieldCheckIcon,
} from "@heroicons/react/24/outline";

interface Article {
  slug: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  description: string;
}

const ARTICLES: Article[] = [
  {
    slug: "zero-cost-rag-architecture",
    title: "How We Built a Production RAG Chatbot at $0 Recurring Cost",
    category: "Architecture",
    readTime: "6 min read",
    date: "October 2026",
    description:
      "A deep dive into pairing OpenRouter free models (Nemotron 3.5 Lightning & Liquid LFM embeddings) with Neon's serverless PostgreSQL tier to run production RAG without credit cards.",
  },
  {
    slug: "pgvector-vs-pinecone",
    title: "Why pgvector Cosine Search Beats Dedicated Vector DBs for Next.js",
    category: "Databases",
    readTime: "8 min read",
    date: "October 2026",
    description:
      "Comparing native PostgreSQL `<=>` vector distance queries with dedicated vector databases like Pinecone and Weaviate. How relational joins and zero sync lag win every time.",
  },
  {
    slug: "real-time-sse-streaming-citations",
    title: "Streaming Server-Sent Events with Verified Citations in React 19",
    category: "Frontend",
    readTime: "5 min read",
    date: "October 2026",
    description:
      "How to implement chunk-by-chunk token streaming using Next.js App Router API handlers and Server-Sent Events, complete with clickable citation inspector modals.",
  },
  {
    slug: "sliding-window-rate-limiting",
    title: "Sliding-Window Rate Limiting: Protecting AI Apps from Bill Abuse",
    category: "Security",
    readTime: "4 min read",
    date: "October 2026",
    description:
      "Designing a high-performance in-memory sliding-window rate limiter in pure TypeScript to protect AI inference and document ingestion endpoints from DDoS and runaway costs.",
  },
];

export default function BlogPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-10 py-6">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
          <BookOpenIcon className="w-4 h-4" />
          <span>Engineering Blog & Insights</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-foreground">
          Technical Deep Dives & Guides
        </h1>
        <p className="text-sm sm:text-base text-default-500 max-w-2xl leading-relaxed">
          Architectural breakdowns, benchmarking studies, and production guides from the RAG Starter Kit team.
        </p>
      </div>

      {/* Article Cards */}
      <div className="space-y-6">
        {ARTICLES.map((article) => (
          <Card
            key={article.slug}
            className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 rounded-3xl space-y-3 hover:border-primary/40 transition-all"
          >
            <div className="flex items-center justify-between text-xs text-default-400">
              <div className="flex items-center gap-2">
                <Chip size="sm" color="accent" variant="soft" className="font-semibold text-xs">
                  {article.category}
                </Chip>
                <span>•</span>
                <span>{article.date}</span>
              </div>
              <div className="flex items-center gap-1">
                <ClockIcon className="w-3.5 h-3.5" />
                <span>{article.readTime}</span>
              </div>
            </div>

            <h2 className="text-xl font-bold text-foreground hover:text-primary transition-colors cursor-pointer">
              {article.title}
            </h2>

            <p className="text-xs sm:text-sm text-default-600 dark:text-default-300 leading-relaxed">
              {article.description}
            </p>

            <div className="pt-2 flex items-center justify-between border-t border-default-200/40 dark:border-default-100/20">
              <span className="text-xs text-default-400 font-mono">100% TypeScript • Open Source</span>
              <Link href="/docs">
                <Button size="sm" variant="secondary" className="text-xs font-semibold flex items-center gap-1">
                  <span>Read Guide</span>
                  <ArrowRightIcon className="w-3.5 h-3.5" />
                </Button>
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
