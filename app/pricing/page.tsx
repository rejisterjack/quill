"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Button, Card, Chip } from "@heroui/react";
import {
  CheckCircleIcon,
  SparklesIcon,
  RocketLaunchIcon,
  ShieldCheckIcon,
  BoltIcon,
  CloudIcon,
  BuildingOffice2Icon,
  ChevronDownIcon,
  PaperAirplaneIcon,
  EnvelopeIcon,
  CpuChipIcon,
  ClockIcon,
  CommandLineIcon,
} from "@heroicons/react/24/outline";

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "annually">("annually");
  const [waitlistTier, setWaitlistTier] = useState<"pro" | "enterprise">("pro");
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistSubmitting, setWaitlistSubmitting] = useState(false);
  const [waitlistSuccess, setWaitlistSuccess] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) return;

    setWaitlistSubmitting(true);
    setTimeout(() => {
      setWaitlistSubmitting(false);
      setWaitlistSuccess(true);
    }, 600);
  };

  const faqs = [
    {
      q: "Is the self-hosted Community Edition truly 100% free forever?",
      a: "Yes, absolutely. The core RAG Starter Kit codebase is published under the open-source MIT License. You can clone it, deploy it on your own server, connect your own PostgreSQL with pgvector, and use free models from OpenRouter (such as Nemotron 3.5 Lightning and Liquid LFM embeddings) with zero licensing or subscription fees.",
    },
    {
      q: "When will the paid Pro Cloud and Enterprise tiers launch?",
      a: "We are actively engineering our multi-tenant cloud infrastructure and automated OCR pipeline. Pro Cloud and Enterprise Dedicated are scheduled to open for public beta in Q2 2026. Joining the waitlist guarantees early beta access and locks in a 50% discount for your entire first year.",
    },
    {
      q: "What features will be exclusive to the paid Pro Cloud tier?",
      a: "Pro Cloud is built for teams who want zero-devops convenience. It includes fully managed PostgreSQL + pgvector (no need to manage databases or extensions), an automated optical character recognition (OCR) pipeline for scanned PDFs and image receipts, multi-tenant workspaces with role-based team seats, automated Slack and Discord bot integrations, scheduled re-crawling of web documentation, and custom-branded embeddable widgets with your own domain.",
    },
    {
      q: "Can I migrate my self-hosted documents and vector embeddings to Pro Cloud later?",
      a: "Yes. We will provide a 1-click migration CLI command that securely transfers your existing PostgreSQL document chunks, embeddings, and chat histories directly to your managed cloud tenant without re-indexing your files.",
    },
    {
      q: "Do I need my own OpenRouter or OpenAI API key?",
      a: "For the self-hosted Free tier, yes: you supply your own free OpenRouter API key in your .env configuration. For the upcoming Pro Cloud and Enterprise tiers, high-throughput inference across premier LLMs and embedding models will be included out of the box with optional BYOK (Bring Your Own Key) support.",
    },
    {
      q: "What security compliance does the Enterprise tier provide?",
      a: "Enterprise Dedicated provides isolated single-tenant VPC deployments, SAML 2.0 / Okta SSO & SCIM directory sync, tamper-evident audit logs archived to private S3 buckets, HIPAA Business Associate Agreements (BAA), SOC 2 Type II compliance reports, and dedicated account engineering with 99.99% uptime SLAs.",
    },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto space-y-16 py-6 sm:py-10">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-semibold shadow-sm">
          <SparklesIcon className="w-4 h-4 text-primary animate-pulse" />
          <span>Flexible Plans & Transparent Infrastructure</span>
        </div>
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-foreground leading-[1.15]">
          Free Today.{" "}
          <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
            Managed Cloud Soon.
          </span>
        </h1>
        <p className="text-sm sm:text-base text-default-500 leading-relaxed max-w-2xl mx-auto">
          Deploy the complete self-hosted RAG engine for <strong className="text-foreground">$0 forever</strong> with full source code access. Sign up for our upcoming managed cloud and dedicated enterprise tiers for zero-devops hosting, automated OCR, and team integrations.
        </p>

        {/* Billing Toggle with Early Bird Callout */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
          <div className="inline-flex items-center p-1 rounded-2xl bg-default-100 dark:bg-default-50/20 border border-default-200/60 dark:border-default-100/30">
            <button
              type="button"
              onClick={() => setBillingPeriod("monthly")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                billingPeriod === "monthly"
                  ? "bg-background text-foreground shadow-sm"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingPeriod("annually")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingPeriod === "annually"
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/25"
                  : "text-default-500 hover:text-foreground"
              }`}
            >
              <span>Annual Billing</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-white/20 dark:bg-black/20 text-inherit">
                Save 20%
              </span>
            </button>
          </div>
          <span className="text-xs text-default-400 font-medium">
            (Lock in 50% launch discount on paid tiers below)
          </span>
        </div>
      </div>

      {/* 3-Tier Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 items-stretch">
        {/* Tier 1: Community Free (Available Now) */}
        <Card className="border border-default-200/80 dark:border-white/10 bg-default-50/60 dark:bg-default-50/10 backdrop-blur-xl p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-6 hover:border-default-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-success-500/10 text-success-500 flex items-center justify-center font-bold">
                  <CommandLineIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">Community Free</h3>
                  <span className="text-[11px] font-mono text-default-400">100% Open Source</span>
                </div>
              </div>
              <Chip size="sm" color="success" variant="soft" className="font-bold text-[11px]">
                Available Now
              </Chip>
            </div>

            <p className="text-xs text-default-500 leading-relaxed">
              Full-featured self-hosted RAG platform. Complete data sovereignty, zero telemetry, and zero recurring fees.
            </p>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">$0</span>
                <span className="text-xs font-semibold text-default-400 uppercase tracking-wide">/ forever</span>
              </div>
              <p className="text-[11px] text-success-600 dark:text-success-400 font-semibold">
                No credit card required • Deploy in minutes
              </p>
            </div>

            <div className="border-t border-default-200/50 dark:border-default-100/20 pt-4 space-y-3 text-xs sm:text-sm">
              <span className="text-[11px] font-mono uppercase font-bold text-default-400 tracking-wider">
                Included Features:
              </span>
              <div className="space-y-2 text-xs text-default-600 dark:text-default-300">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>Data Sovereignty:</strong> Own your PostgreSQL</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>Unlimited Files:</strong> PDF, DOCX, MD, TXT, URLs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>pgvector Search:</strong> Native cosine distance</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>Free OpenRouter:</strong> Nemotron & Liquid LFM</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>Embed Widget:</strong> 1-line drop-in iframe</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>Built-in RBAC:</strong> Admin portal & user roles</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>Safeguards:</strong> Rate limits & audit logging</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-success-500 shrink-0" />
                  <span><strong>MIT License:</strong> Full source code on GitHub</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <Link href="/chat" className="w-full block">
              <Button size="lg" variant="primary" className="w-full font-bold h-11 rounded-xl shadow-md shadow-primary/20">
                <span>Start Free Now</span>
                <RocketLaunchIcon className="w-4 h-4 ml-1" />
              </Button>
            </Link>
            <Link href="/docs" className="w-full block">
              <Button size="sm" variant="ghost" className="w-full text-xs text-default-500 hover:text-foreground">
                Read Self-Host Docs →
              </Button>
            </Link>
          </div>
        </Card>

        {/* Tier 2: Pro Cloud (Coming Soon - Recommended / Hero Card) */}
        <Card className="border-2 border-primary shadow-2xl shadow-primary/20 bg-gradient-to-b from-primary/10 via-default-50/80 dark:via-default-50/20 to-transparent p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-6 relative overflow-hidden">
          {/* Top Glow Accent */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-primary/30 blur-2xl pointer-events-none rounded-full" />

          <div className="space-y-5 relative">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary text-primary-foreground flex items-center justify-center font-bold shadow-md shadow-primary/30">
                  <CloudIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">Pro Cloud</h3>
                  <span className="text-[11px] font-mono text-primary font-semibold">Zero-Devops Managed</span>
                </div>
              </div>
              <Chip size="sm" color="accent" variant="primary" className="font-extrabold text-[10px] tracking-wide uppercase">
                Coming Soon
              </Chip>
            </div>

            <p className="text-xs text-default-500 leading-relaxed">
              Fully managed RAG cloud for fast-moving product teams. Automated OCR, team workspaces, and Slack/Discord sync.
            </p>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">
                  {billingPeriod === "annually" ? "$23" : "$29"}
                </span>
                <span className="text-xs font-semibold text-default-400">
                  / month {billingPeriod === "annually" ? "(billed annually)" : ""}
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-primary text-[11px] font-bold">
                <SparklesIcon className="w-3 h-3" />
                <span>Waitlist Deal: 50% off for life ($11.50/mo)</span>
              </div>
            </div>

            <div className="border-t border-default-200/50 dark:border-default-100/20 pt-4 space-y-3 text-xs sm:text-sm">
              <span className="text-[11px] font-mono uppercase font-bold text-primary tracking-wider">
                Upcoming Paid Features:
              </span>
              <div className="space-y-2 text-xs text-default-700 dark:text-default-200">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Everything in Community Free, plus:</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Managed Neon pgvector:</strong> Zero database ops</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Automated OCR:</strong> Scanned PDFs & image text</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Multi-Tenant Teams:</strong> Up to 10 workspaces</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Slack & Discord Bots:</strong> Channel AI search</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Scheduled Re-Crawls:</strong> Automatic sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>Custom-Branded:</strong> Custom domain & widget</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-primary shrink-0" />
                  <span><strong>100,000 Queries / Mo:</strong> Priority queue</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setWaitlistTier("pro");
                const el = document.getElementById("waitlist-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-sm shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>Join Pro Waitlist (50% Off)</span>
            </button>
            <p className="text-[11px] text-center text-default-400">
              Launching Q2 2026 • No payment required today
            </p>
          </div>
        </Card>

        {/* Tier 3: Enterprise Dedicated (Coming Soon) */}
        <Card className="border border-default-200/80 dark:border-white/10 bg-default-50/60 dark:bg-default-50/10 backdrop-blur-xl p-6 sm:p-7 rounded-3xl flex flex-col justify-between space-y-6 hover:border-default-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="space-y-5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                  <BuildingOffice2Icon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-foreground text-lg">Enterprise</h3>
                  <span className="text-[11px] font-mono text-default-400">Dedicated Compliance</span>
                </div>
              </div>
              <Chip size="sm" color="default" variant="soft" className="font-bold text-[11px]">
                Coming Soon
              </Chip>
            </div>

            <p className="text-xs text-default-500 leading-relaxed">
              Dedicated isolated infrastructure for organizations with strict compliance, custom models, and SAML SSO requirements.
            </p>

            <div className="space-y-1">
              <div className="flex items-baseline gap-1.5">
                <span className="text-4xl sm:text-5xl font-black text-foreground tracking-tight">Custom</span>
              </div>
              <p className="text-[11px] text-default-400 font-semibold">
                Dedicated VPC or on-premise cluster deployment
              </p>
            </div>

            <div className="border-t border-default-200/50 dark:border-default-100/20 pt-4 space-y-3 text-xs sm:text-sm">
              <span className="text-[11px] font-mono uppercase font-bold text-default-400 tracking-wider">
                Upcoming Enterprise Features:
              </span>
              <div className="space-y-2 text-xs text-default-600 dark:text-default-300">
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>Everything in Pro Cloud, plus:</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>Dedicated VPC Cluster:</strong> Air-gapped isolation</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>SAML 2.0 / Okta / Azure:</strong> SSO & SCIM sync</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>HIPAA & SOC 2 Type II:</strong> Immutable audit logs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>Custom Model Tuning:</strong> Fine-tuned vectors</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>Enterprise Connectors:</strong> Confluence, Drive, Jira</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>99.99% Uptime SLA:</strong> 24/7 dedicated engineer</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircleIcon className="w-4 h-4 text-purple-500 shrink-0" />
                  <span><strong>Custom Contracts:</strong> MSA & invoice billing</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={() => {
                setWaitlistTier("enterprise");
                const el = document.getElementById("waitlist-section");
                el?.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full flex items-center justify-center gap-2 px-4 h-11 rounded-xl bg-default-100 dark:bg-default-50/20 hover:bg-default-200 dark:hover:bg-default-50/40 text-foreground font-bold text-sm border border-default-200/60 dark:border-default-100/30 transition-all active:scale-[0.98]"
            >
              <span>Join Enterprise Waitlist</span>
            </button>
            <p className="text-[11px] text-center text-default-400">
              Custom MSA, invoice billing & BAA available
            </p>
          </div>
        </Card>
      </div>

      {/* Interactive Waitlist Capture Form */}
      <div id="waitlist-section" className="scroll-mt-24">
        <Card className="border border-primary/30 bg-gradient-to-br from-primary/10 via-background to-secondary/10 p-6 sm:p-10 rounded-3xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/40 bg-primary/20 text-primary text-xs font-bold">
              <ClockIcon className="w-3.5 h-3.5" />
              <span>Paid Tiers Launching Q2 2026</span>
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
                Get Early Beta Access & 50% Off for Life
              </h2>
              <p className="text-xs sm:text-sm text-default-500 max-w-lg mx-auto">
                Join 840+ developers on the waitlist for Pro Cloud and Enterprise. We’ll notify you first when slots open up.
              </p>
            </div>

            {waitlistSuccess ? (
              <div className="p-6 rounded-2xl bg-success-500/10 border border-success-500/30 text-success-600 dark:text-success-400 space-y-2 animate-in fade-in">
                <CheckCircleIcon className="w-8 h-8 mx-auto" />
                <h4 className="font-bold text-base">You’re on the VIP waitlist!</h4>
                <p className="text-xs text-default-500">
                  We’ve recorded <strong className="text-foreground">{waitlistEmail}</strong> for the{" "}
                  <strong className="text-foreground uppercase">{waitlistTier}</strong> tier. You’ve locked in the 50% early bird lifetime discount.
                </p>
              </div>
            ) : (
              <form onSubmit={handleWaitlistSubmit} className="space-y-4 max-w-md mx-auto">
                {/* Plan Selector */}
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-default-100 dark:bg-default-50/20 border border-default-200/50">
                  <button
                    type="button"
                    onClick={() => setWaitlistTier("pro")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      waitlistTier === "pro"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-default-500 hover:text-foreground"
                    }`}
                  >
                    Pro Cloud ($29/mo)
                  </button>
                  <button
                    type="button"
                    onClick={() => setWaitlistTier("enterprise")}
                    className={`py-1.5 px-3 rounded-lg text-xs font-bold transition-all ${
                      waitlistTier === "enterprise"
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-default-500 hover:text-foreground"
                    }`}
                  >
                    Enterprise Dedicated
                  </button>
                </div>

                {/* Email Input & Submit */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-grow">
                    <EnvelopeIcon className="w-4 h-4 text-default-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={waitlistEmail}
                      onChange={(e) => setWaitlistEmail(e.target.value)}
                      placeholder="engineer@company.com"
                      className="w-full h-11 pl-10 pr-4 rounded-xl bg-background border border-default-200 dark:border-default-100/30 text-xs sm:text-sm text-foreground placeholder:text-default-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                    />
                  </div>
                  <Button
                    type="submit"
                    variant="primary"
                    isDisabled={waitlistSubmitting}
                    className="h-11 px-6 font-bold text-xs sm:text-sm rounded-xl shrink-0"
                  >
                    {waitlistSubmitting ? "Submitting..." : "Claim 50% Off"}
                  </Button>
                </div>
                <p className="text-[11px] text-default-400">
                  Zero spam. We will only contact you regarding early beta access.
                </p>
              </form>
            )}
          </div>
        </Card>
      </div>

      {/* Feature Comparison Matrix */}
      <div className="space-y-6">
        <div className="text-center space-y-2 max-w-xl mx-auto">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Comprehensive Tier Comparison
          </h2>
          <p className="text-xs sm:text-sm text-default-500">
            Compare features across the active Community edition and upcoming paid tiers.
          </p>
        </div>

        <div className="overflow-x-auto rounded-3xl border border-default-200/60 dark:border-default-100/30 bg-default-50/50 dark:bg-default-50/10">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-default-200/60 dark:border-default-100/20 bg-default-100/40 dark:bg-default-50/20">
                <th className="p-4 sm:p-5 font-bold text-foreground text-sm">Feature / Capability</th>
                <th className="p-4 sm:p-5 font-bold text-success-600 dark:text-success-400 text-sm">
                  Community Free <br />
                  <span className="text-[10px] font-normal text-default-400">Active Now ($0)</span>
                </th>
                <th className="p-4 sm:p-5 font-bold text-primary text-sm">
                  Pro Cloud <br />
                  <span className="text-[10px] font-normal text-default-400">Coming Soon ($29/mo)</span>
                </th>
                <th className="p-4 sm:p-5 font-bold text-purple-400 text-sm">
                  Enterprise <br />
                  <span className="text-[10px] font-normal text-default-400">Coming Soon (Custom)</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-200/40 dark:divide-default-100/20 text-default-600 dark:text-default-300">
              {/* Category: RAG & Vector Engine */}
              <tr className="bg-default-100/20 dark:bg-default-50/10 font-bold text-foreground">
                <td colSpan={4} className="p-3 sm:px-5 uppercase font-mono text-[11px] tracking-wider text-default-500">
                  RAG & Vector Retrieval Engine
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">PostgreSQL + pgvector Vector Store</td>
                <td className="p-3.5 sm:p-4">Self-Hosted (Local/Neon)</td>
                <td className="p-3.5 sm:p-4 font-semibold text-primary">Fully Managed Serverless</td>
                <td className="p-3.5 sm:p-4 font-semibold text-purple-400">Dedicated Isolated VPC</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Vector Search Cosine Metric (&lt;=&gt;)</td>
                <td className="p-3.5 sm:p-4 text-success-500 font-bold">✓ Included</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Included</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Included (HNSW Accelerated)</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Sliding-Window Text Chunking</td>
                <td className="p-3.5 sm:p-4 text-success-500 font-bold">✓ 500 chars / 100 overlap</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Smart Semantic Chunking</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Custom Configurable Chunks</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Query Re-ranking & Hybrid Search</td>
                <td className="p-3.5 sm:p-4 text-default-400">—</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ FlashRank Re-ranker</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Custom Cross-Encoder</td>
              </tr>

              {/* Category: Document Ingestion */}
              <tr className="bg-default-100/20 dark:bg-default-50/10 font-bold text-foreground">
                <td colSpan={4} className="p-3 sm:px-5 uppercase font-mono text-[11px] tracking-wider text-default-500">
                  Document Ingestion & Formats
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Standard Ingestion (PDF, DOCX, TXT, MD)</td>
                <td className="p-3.5 sm:p-4 text-success-500 font-bold">✓ Unlimited</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Unlimited</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Unlimited</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Web URL Ingestion & Scraping</td>
                <td className="p-3.5 sm:p-4 text-success-500 font-bold">✓ Cheerio parser</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Headless browser parser</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Deep crawl with proxy rotators</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Scanned Document OCR Pipeline</td>
                <td className="p-3.5 sm:p-4 text-default-400">— (Requires manual OCR)</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Automated OCR (Tesseract + AI)</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ High-volume multi-lingual OCR</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Cloud Sync (Notion, Google Drive, Jira)</td>
                <td className="p-3.5 sm:p-4 text-default-400">—</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Notion & Google Drive</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Confluence, Jira, S3 & Zendesk</td>
              </tr>

              {/* Category: Delivery & Integrations */}
              <tr className="bg-default-100/20 dark:bg-default-50/10 font-bold text-foreground">
                <td colSpan={4} className="p-3 sm:px-5 uppercase font-mono text-[11px] tracking-wider text-default-500">
                  Widgets, Chat & Bots
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Embeddable Iframe Widget</td>
                <td className="p-3.5 sm:p-4 text-success-500 font-bold">✓ Included</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Included</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Included</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Widget Customization & Whitelabeling</td>
                <td className="p-3.5 sm:p-4 text-default-400">Standard branding</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Remove branding + custom colors</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Custom domain (chat.yourcompany.com)</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Slack & Discord Bot Integrations</td>
                <td className="p-3.5 sm:p-4 text-default-400">—</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ 1-click bot install</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Custom internal enterprise bots</td>
              </tr>

              {/* Category: Security & Governance */}
              <tr className="bg-default-100/20 dark:bg-default-50/10 font-bold text-foreground">
                <td colSpan={4} className="p-3 sm:px-5 uppercase font-mono text-[11px] tracking-wider text-default-500">
                  Security, RBAC & Compliance
                </td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Role-Based Access Control (RBAC)</td>
                <td className="p-3.5 sm:p-4 text-success-500 font-bold">✓ Admin & Member roles</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ Granular team permissions</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Custom roles + SCIM provisioning</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Audit Log Archiving</td>
                <td className="p-3.5 sm:p-4 text-success-500 font-bold">✓ Local database logs</td>
                <td className="p-3.5 sm:p-4 text-primary font-bold">✓ 90-day search & CSV export</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Immutable S3/GCS archival (7 yrs)</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Enterprise SAML 2.0 / Okta SSO</td>
                <td className="p-3.5 sm:p-4 text-default-400">—</td>
                <td className="p-3.5 sm:p-4 text-default-400">—</td>
                <td className="p-3.5 sm:p-4 text-purple-400 font-bold">✓ Okta, Azure AD, Google Workspace</td>
              </tr>
              <tr>
                <td className="p-3.5 sm:p-4 font-semibold text-foreground">Compliance Standards</td>
                <td className="p-3.5 sm:p-4">Self-governed</td>
                <td className="p-3.5 sm:p-4">SOC 2 Type I ready</td>
                <td className="p-3.5 sm:p-4 font-bold text-purple-400">SOC 2 Type II, HIPAA BAA, GDPR</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Zero Cost Breakdown Card (Explaining how free self-hosting works) */}
      <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl p-6 sm:p-8 rounded-3xl space-y-4">
        <div className="flex items-center gap-2">
          <BoltIcon className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">How Does the Self-Hosted $0 Free Tier Work?</h3>
        </div>
        <p className="text-xs sm:text-sm text-default-500 leading-relaxed">
          Unlike closed commercial chatbots that bill you $240/month plus $0.99 per resolution surcharge, the RAG Starter Kit is architected to operate fully inside generous, unmetered free tiers of industry standard cloud providers:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-4 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1.5">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <CpuChipIcon className="w-4 h-4 text-primary" />
              <span>OpenRouter AI ($0/mo)</span>
            </div>
            <p className="text-default-400 leading-relaxed">
              Provides free LLM access (Nvidia Nemotron 3.5 Lightning) and free dense vector embeddings (Liquid LFM 350M) with zero credit card required.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1.5">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <ShieldCheckIcon className="w-4 h-4 text-success-500" />
              <span>Neon PostgreSQL ($0/mo)</span>
            </div>
            <p className="text-default-400 leading-relaxed">
              Generous serverless tier includes pgvector 0.8.0 vector indexing, 0.5 GB storage, and automated branch scaling at zero financial cost.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-default-100/50 dark:bg-default-50/10 border border-default-200/50 space-y-1.5">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <RocketLaunchIcon className="w-4 h-4 text-purple-400" />
              <span>Vercel / Railway ($0/mo)</span>
            </div>
            <p className="text-default-400 leading-relaxed">
              Zero-cost global edge hosting with instant Git pushes, edge caching, and automated HTTPS certificates.
            </p>
          </div>
        </div>
      </Card>

      {/* FAQ Section */}
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-xs sm:text-sm text-default-500">
            Everything you need to know about our current free tier and upcoming paid cloud offerings.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="border border-default-200/60 dark:border-default-100/30 rounded-2xl bg-default-50/50 dark:bg-default-50/10 overflow-hidden transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-bold text-foreground text-xs sm:text-sm hover:text-primary transition-colors"
                >
                  <span>{faq.q}</span>
                  <ChevronDownIcon
                    className={`w-4 h-4 text-default-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-primary" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 text-xs sm:text-sm text-default-500 leading-relaxed border-t border-default-200/40 dark:border-default-100/20 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA Banner */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-8 rounded-3xl bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-purple-600/10 border border-primary/20 backdrop-blur-xl">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="text-xl font-extrabold text-foreground">
            Start building with the Community Edition today
          </h3>
          <p className="text-xs sm:text-sm text-default-500">
            No credit card, no waiting list for self-hosting. Deploy in under 5 minutes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3 shrink-0">
          <Link href="/chat">
            <Button size="md" variant="primary" className="font-bold rounded-xl px-5">
              <span>Launch Chatbot</span>
              <RocketLaunchIcon className="w-4 h-4 ml-1" />
            </Button>
          </Link>
          <Link href="/docs">
            <Button size="md" variant="secondary" className="font-semibold rounded-xl px-5 border border-default-200/60 dark:border-default-100/30">
              Developer Docs
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
