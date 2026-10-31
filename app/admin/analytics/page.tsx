"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Chip,
} from "@heroui/react";
import {
  ClockIcon,
  CheckCircleIcon,
  ChatBubbleLeftRightIcon,
  ChartBarIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CircleStackIcon,
  SparklesIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

function formatShare(formats: Array<{ type: string; count: number }>, types: string[]) {
  const total = formats.reduce((sum, row) => sum + row.count, 0);
  if (!total) return 0;
  const count = formats.filter((row) => types.includes(row.type)).reduce((sum, row) => sum + row.count, 0);
  return Math.round((count / total) * 100);
}

export default function AdminAnalyticsPage() {
  const [docCount, setDocCount] = useState(0);
  const [chunkCount, setChunkCount] = useState(0);
  const [chatCount, setChatCount] = useState(0);
  const [avgRetrievalMs, setAvgRetrievalMs] = useState(0);
  const [avgSimilarity, setAvgSimilarity] = useState(0);
  const [formats, setFormats] = useState<Array<{ type: string; count: number }>>([]);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await fetch("/api/admin/stats");
        const stats = await res.json();
        setDocCount(stats.documents || 0);
        setChunkCount(stats.chunks || 0);
        setChatCount(stats.chats || 0);
        setAvgRetrievalMs(stats.avgRetrievalMs || 0);
        setAvgSimilarity(stats.avgSimilarity || 0);
        setFormats(stats.formats || []);
      } catch (err) {
        console.error("Failed to load analytics:", err);
      }
    }
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
          System & Retrieval Analytics
        </h1>
        <p className="text-xs sm:text-sm text-default-500 mt-1">
          Vector observability, retrieval latency benchmarks, and infrastructure cost breakdown.
        </p>
      </div>

      {/* 1. Top 3 Elevated KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-5 border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl shadow-md hover:border-primary/40 transition-all">
          <CardHeader className="p-0 text-xs font-semibold text-default-400 justify-between items-center">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ClockIcon className="w-4 h-4 text-primary" />
              Retrieval Latency
            </span>
            <Chip size="sm" color="success" variant="soft" className="text-[10px] font-bold">
              &lt; 150ms
            </Chip>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-3xl font-black text-foreground">{avgRetrievalMs} ms</div>
            <p className="text-xs text-default-400 mt-1">pgvector cosine scan on Neon</p>
            <div className="w-full bg-default-100 dark:bg-default-100/30 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-success-500 h-full rounded-full w-[25%]" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-5 border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl shadow-md hover:border-primary/40 transition-all">
          <CardHeader className="p-0 text-xs font-semibold text-default-400 justify-between items-center">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <CheckCircleIcon className="w-4 h-4 text-success-500" />
              Retrieval Confidence
            </span>
            <Chip size="sm" color="accent" variant="soft" className="text-[10px] font-bold">
              Cosine &lt;=&gt;
            </Chip>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-3xl font-black text-foreground">{Math.round(avgSimilarity * 1000) / 10}%</div>
            <p className="text-xs text-default-400 mt-1">Threshold confidence cutoff ≥ 0.70</p>
            <div className="w-full bg-default-100 dark:bg-default-100/30 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-primary h-full rounded-full w-[96%]" />
            </div>
          </CardContent>
        </Card>

        <Card className="p-5 border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl shadow-md hover:border-primary/40 transition-all">
          <CardHeader className="p-0 text-xs font-semibold text-default-400 justify-between items-center">
            <span className="flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-purple-400" />
              Total Sessions
            </span>
            <Chip size="sm" color="default" variant="soft" className="text-[10px] font-bold">
              Live
            </Chip>
          </CardHeader>
          <CardContent className="p-0 pt-3">
            <div className="text-3xl font-black text-foreground">{chatCount}</div>
            <p className="text-xs text-default-400 mt-1">Grounded multi-turn conversations</p>
            <div className="w-full bg-default-100 dark:bg-default-100/30 rounded-full h-1.5 mt-3 overflow-hidden">
              <div className="bg-purple-500 h-full rounded-full w-[70%]" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 2. Pipeline Breakdown & Cost Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Distribution */}
        <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl space-y-4 shadow-lg">
          <CardHeader className="p-0 font-bold text-sm sm:text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ChartBarIcon className="w-5 h-5 text-primary" />
              <span>Document Type Distribution</span>
            </div>
            <span className="text-xs text-default-400">{docCount} Total Files</span>
          </CardHeader>
          <CardContent className="p-0 space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                  Markdown & Raw Text
                </span>
                <span className="text-default-400 font-mono">{formatShare(formats, ["md", "txt"])}%</span>
              </div>
              <div className="w-full bg-default-100 dark:bg-default-100/30 rounded-full h-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full" style={{ width: `${formatShare(formats, ["md", "txt"])}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                  PDF Documents
                </span>
                <span className="text-default-400 font-mono">{formatShare(formats, ["pdf"])}%</span>
              </div>
              <div className="w-full bg-default-100 dark:bg-default-100/30 rounded-full h-2 overflow-hidden">
                <div className="bg-red-500 h-full rounded-full" style={{ width: `${formatShare(formats, ["pdf"])}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                  Web Crawled URLs
                </span>
                <span className="text-default-400 font-mono">{formatShare(formats, ["url"])}%</span>
              </div>
              <div className="w-full bg-default-100 dark:bg-default-100/30 rounded-full h-2 overflow-hidden">
                <div className="bg-cyan-500 h-full rounded-full" style={{ width: `${formatShare(formats, ["url"])}%` }} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Savings Calculator */}
        <Card className="p-6 border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl space-y-4 shadow-lg">
          <CardHeader className="p-0 font-bold text-sm sm:text-base flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BanknotesIcon className="w-5 h-5 text-success-500" />
              <span>Self-Hosted Cost Savings</span>
            </div>
            <Chip size="sm" color="success" variant="soft" className="font-bold text-xs">
              100% Free Tier
            </Chip>
          </CardHeader>
          <CardContent className="p-0 space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-2 border-b border-default-100 dark:border-default-100/30">
              <span className="text-default-400 flex items-center gap-1.5">
                <CircleStackIcon className="w-4 h-4 text-default-400" />
                LLM Generation (Mistral 7B)
              </span>
              <span className="font-semibold text-success-500">OpenRouter Free ($0.00)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-default-100 dark:border-default-100/30">
              <span className="text-default-400 flex items-center gap-1.5">
                <CpuChipIcon className="w-4 h-4 text-default-400" />
                Embeddings (1024-dim LFM)
              </span>
              <span className="font-semibold text-success-500">OpenRouter Free ($0.00)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-default-100 dark:border-default-100/30">
              <span className="text-default-400 flex items-center gap-1.5">
                <CircleStackIcon className="w-4 h-4 text-default-400" />
                Vector Storage (pgvector)
              </span>
              <span className="font-semibold text-success-500">Neon PostgreSQL Free ($0.00)</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-default-100/40 dark:bg-default-50/20 px-3 rounded-xl border border-default-200/40 dark:border-default-100/20">
              <div>
                <div className="font-bold text-foreground">Total Recurring Cost</div>
                <div className="text-[10px] text-default-400">vs ~$240/mo for proprietary vector DBs</div>
              </div>
              <div className="text-xl font-black text-success-500 font-mono">
                $0.00 / mo
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
