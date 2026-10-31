"use client";

import React from "react";
import Link from "next/link";
import { Button, Card, CardHeader, CardContent, Chip } from "@heroui/react";
import {
  SparklesIcon,
  HeartIcon,
  CodeBracketIcon,
  CpuChipIcon,
  ShieldCheckIcon,
  ArrowRightIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/outline";

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="space-y-4 text-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold">
          <HeartIcon className="w-3.5 h-3.5 text-primary" />
          <span>The Project Manifesto</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
          Why We Built Quill
        </h1>
        <p className="text-sm sm:text-base text-default-500 max-w-2xl mx-auto leading-relaxed">
          The fastest way for a TypeScript developer to go from "I have documents" to "I have a production chatbot" — in one weekend, at zero recurring cost.
        </p>
      </div>

      {/* The Core Story */}
      <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl space-y-4">
        <h2 className="text-xl font-bold text-foreground">The Confusion We Ended</h2>
        <div className="space-y-3 text-xs sm:text-sm text-default-600 dark:text-default-300 leading-relaxed">
          <p>
            When developers try to build document-aware AI chatbots today, they run into a wall of confusion. The entire RAG ecosystem is dominated by Python frameworks like LangChain, LlamaIndex, and RAGFlow. For a TypeScript and Next.js developer, adding AI either meant introducing an unwanted Python microservice or piecing together fragile glue code from shallow blog posts.
          </p>
          <p>
            At the same time, managed SaaS chatbot platforms emerged, charging $240 to $650 per month, plus per-resolution fees, while locking customer knowledge behind proprietary walls.
          </p>
          <p>
            <strong>We built Quill to change that.</strong> We believe you should own your AI, own your data, own your infrastructure, and deploy production-grade software in a single weekend without writing Python or pulling out a credit card.
          </p>
        </div>
      </Card>

      {/* Design Principles */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground text-center">Our Core Principles</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-5 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
              1
            </div>
            <h3 className="font-bold text-sm text-foreground">100% TypeScript</h3>
            <p className="text-xs text-default-500 leading-relaxed">
              No Python, no shell script workarounds. One unified language for React 19, Next.js 16 APIs, Prisma 7 ORM, and pgvector.
            </p>
          </Card>

          <Card className="p-5 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-success-500/10 text-success-500 flex items-center justify-center font-bold text-xs">
              2
            </div>
            <h3 className="font-bold text-sm text-foreground">$0 to Run by Default</h3>
            <p className="text-xs text-default-500 leading-relaxed">
              The zero-cost configuration is not a compromise — it is the feature. Developers can build and deploy without fear of surprise bills.
            </p>
          </Card>

          <Card className="p-5 border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 rounded-2xl space-y-2">
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-400 flex items-center justify-center font-bold text-xs">
              3
            </div>
            <h3 className="font-bold text-sm text-foreground">Production-First</h3>
            <p className="text-xs text-default-500 leading-relaxed">
              Rate limiting, tamper-evident audit logs, verified source citations, and multi-format parsers come pre-wired out of the box.
            </p>
          </Card>
        </div>
      </div>

      {/* Maintainer Callout */}
      <Card className="border border-default-200/60 dark:border-white/10 bg-gradient-to-r from-primary/10 via-secondary/5 to-transparent p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-foreground">Open Source & MIT Licensed</h3>
          <p className="text-xs text-default-500 mt-0.5">
            Maintained with care by <a href="https://github.com/rejisterjack" target="_blank" rel="noreferrer" className="text-primary hover:underline font-semibold">@rejisterjack</a> and the community.
          </p>
        </div>
        <div className="flex gap-2">
          <a href="https://github.com/rejisterjack/quill" target="_blank" rel="noreferrer">
            <Button size="sm" variant="secondary" className="font-semibold text-xs border border-default-200/60 dark:border-white/10">
              Star on GitHub ★
            </Button>
          </a>
          <Link href="/chat">
            <Button size="sm" variant="primary" className="font-bold text-xs">
              Launch Assistant
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
