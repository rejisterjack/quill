"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card, CardHeader, CardContent, Chip } from "@heroui/react";
import {
  CurrencyDollarIcon,
  CheckCircleIcon,
  XCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");

  return (
    <div className="max-w-5xl mx-auto space-y-12 py-6">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-success-500/30 bg-success-500/10 text-success-600 dark:text-success-400 text-xs font-semibold">
          <SparklesIcon className="w-3.5 h-3.5" />
          <span>Transparent Self-Hosted Economics</span>
        </div>
        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-foreground">
          Simple, Honest Pricing:{" "}
          <span className="bg-gradient-to-r from-success-500 to-emerald-400 bg-clip-text text-transparent">
            $0.00 Forever.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-default-500 leading-relaxed">
          Proprietary AI chatbot tools charge up to $650/month plus per-resolution fees. RAG Starter Kit gives you a production-grade foundation that costs $0 to run.
        </p>
      </div>

      {/* Pricing Comparison Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
        {/* Self-Hosted Free Tier */}
        <Card className="border-2 border-primary shadow-2xl bg-gradient-to-b from-primary/10 via-default-50/40 dark:via-default-50/10 to-transparent p-6 sm:p-8 rounded-3xl space-y-6 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-4 right-4">
            <Chip size="sm" color="accent" variant="soft" className="font-bold">
              Recommended • 100% Open Source
            </Chip>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-black text-foreground">Self-Hosted RAG</h3>
              <p className="text-xs text-default-400 mt-1">Deploy on your own infrastructure in under 20 minutes.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-foreground">$0</span>
              <span className="text-sm font-semibold text-default-400">/ forever</span>
            </div>

            <div className="divide-y divide-default-200/40 dark:divide-default-100/20 text-xs sm:text-sm space-y-2.5 pt-2">
              <div className="flex items-center gap-2 pt-2">
                <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                <span><strong>100% Data Sovereignty:</strong> Stored in your own PostgreSQL</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                <span><strong>Zero Recurring Cost:</strong> OpenRouter & Neon free tiers</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                <span><strong>Unlimited Documents:</strong> PDF, DOCX, Markdown, Text, URLs</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                <span><strong>pgvector Cosine Search:</strong> Native sub-100ms vector scans</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                <span><strong>Embeddable Widget:</strong> One-line iframe for client sites</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                <span><strong>Production Safeguards:</strong> Rate limiting & audit logging</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/chat" className="w-full">
              <Button size="lg" variant="primary" className="w-full font-bold h-12 rounded-xl shadow-lg shadow-primary/25">
                <span>Start Free Today</span>
                <RocketLaunchIcon className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </Card>

        {/* Closed Proprietary SaaS */}
        <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/50 dark:bg-default-50/10 p-6 sm:p-8 rounded-3xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-bold text-default-700 dark:text-default-200">Commercial SaaS Bots</h3>
              <p className="text-xs text-default-400 mt-1">Intercom Fin / Chatbase / Enterprise vendors.</p>
            </div>

            <div className="flex items-baseline gap-1">
              <span className="text-5xl font-black text-danger-500">$240+</span>
              <span className="text-sm font-semibold text-default-400">/ month + resolution fees</span>
            </div>

            <div className="divide-y divide-default-200/40 dark:divide-default-100/20 text-xs sm:text-sm space-y-2.5 pt-2 text-default-500">
              <div className="flex items-center gap-2 pt-2">
                <XCircleIcon className="w-4 h-4 text-danger-500 shrink-0" />
                <span>Data stored in vendor cloud (no privacy guarantee)</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <XCircleIcon className="w-4 h-4 text-danger-500 shrink-0" />
                <span>$0.99 per automated resolution surcharge</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <XCircleIcon className="w-4 h-4 text-danger-500 shrink-0" />
                <span>Per-seat team pricing ($39 to $99/seat/mo)</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <XCircleIcon className="w-4 h-4 text-danger-500 shrink-0" />
                <span>Closed proprietary models (no custom code access)</span>
              </div>
              <div className="flex items-center gap-2 pt-2">
                <XCircleIcon className="w-4 h-4 text-danger-500 shrink-0" />
                <span>High switching costs & vendor lock-in</span>
              </div>
            </div>
          </div>

          <div className="pt-6">
            <Link href="/admin" className="w-full">
              <Button size="lg" variant="secondary" className="w-full font-semibold h-12 rounded-xl border border-default-200/60 dark:border-default-100/30">
                <span>Explore Admin Suite</span>
              </Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Free Tier Breakdown Spec */}
      <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold text-foreground">How Does the Free Tier Work Under the Hood?</h3>
        <p className="text-xs sm:text-sm text-default-500 leading-relaxed">
          We designed the RAG Starter Kit to operate entirely within the generous, unmetered free tiers of world-class infrastructure providers:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <BoltIcon className="w-4 h-4 text-primary" />
              <span>OpenRouter AI</span>
            </div>
            <p className="text-default-400">Free models including Nemotron 3.5 Lightning and Liquid LFM 2.5 embeddings at $0.00 cost.</p>
          </div>

          <div className="p-4 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-success-500" />
              <span>Neon PostgreSQL</span>
            </div>
            <p className="text-default-400">Generous serverless free tier with pgvector 0.8.0 vector search and automated scaling.</p>
          </div>

          <div className="p-4 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <RocketLaunchIcon className="w-4 h-4 text-purple-400" />
              <span>Vercel / Railway</span>
            </div>
            <p className="text-default-400">Zero-cost global edge hosting with instant Git pushes and automatic SSL certificates.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
