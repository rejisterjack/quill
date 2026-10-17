"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Card, Button, Chip } from "@heroui/react";
import { useAuth } from "@/lib/auth-context";
import {
  ChartBarSquareIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
  CircleStackIcon,
  CpuChipIcon,
} from "@heroicons/react/24/outline";

const navLinks = [
  { href: "/admin", label: "Dashboard", icon: ChartBarSquareIcon, description: "Overview & system health" },
  { href: "/admin/documents", label: "Knowledge Docs", icon: DocumentTextIcon, description: "Files, URLs & chunks" },
  { href: "/admin/analytics", label: "Analytics", icon: ArrowTrendingUpIcon, description: "Latency & cost savings" },
  { href: "/admin/audit", label: "Audit Logs", icon: ShieldCheckIcon, description: "Tamper-evident logs" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, activeWorkspace } = useAuth();

  useEffect(() => {
    if (!loading && (!user || user.role !== "ADMIN")) {
      // Non-admin fallback if needed
    }
  }, [user, loading, router]);

  return (
    <div className="flex flex-col md:flex-row gap-6 min-h-[calc(100vh-10rem)]">
      {/* 1. Admin Portal Sidebar */}
      <Card className="w-full md:w-72 h-fit border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl shadow-xl rounded-2xl p-4 flex flex-col gap-3">
        {/* Workspace Info Card */}
        <div className="p-3 rounded-xl bg-default-100/50 dark:bg-default-50/20 border border-default-200/40 dark:border-default-100/30">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-bold tracking-wider uppercase text-default-400">
              Active Workspace
            </span>
            <Chip size="sm" color="warning" variant="soft" className="h-4 text-[10px] font-bold">
              Admin
            </Chip>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
              {(activeWorkspace?.name || "RAG").substring(0, 2).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="font-bold text-xs text-foreground truncate">
                {activeWorkspace?.name || "Default Workspace"}
              </div>
              <div className="text-[10px] text-default-400 font-mono truncate">
                workspace_main
              </div>
            </div>
          </div>
        </div>

        {/* Navigation items */}
        <nav className="flex flex-col gap-1.5">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link key={link.href} href={link.href} className="w-full">
                <div
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 border ${
                    isActive
                      ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/25"
                      : "border-transparent text-default-600 dark:text-default-300 hover:bg-default-100/60 dark:hover:bg-default-50/20 hover:text-foreground"
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-default-400"}`} />
                  <div className="flex flex-col text-left">
                    <span className="leading-tight">{link.label}</span>
                    <span className={`text-[10px] font-normal ${isActive ? "text-white/80" : "text-default-400"}`}>
                      {link.description}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </nav>

        {/* System Health Card */}
        <div className="mt-2 p-3 rounded-xl border border-default-200/40 dark:border-default-100/30 bg-default-100/30 dark:bg-default-50/10 space-y-2 text-[11px]">
          <div className="text-[10px] font-bold text-default-400 uppercase tracking-wider">
            Infrastructure Status
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-default-500">
              <span className="flex items-center gap-1.5">
                <CircleStackIcon className="w-3.5 h-3.5 text-primary" />
                PostgreSQL
              </span>
              <span className="text-success-500 font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                Neon Connected
              </span>
            </div>
            <div className="flex items-center justify-between text-default-500">
              <span className="flex items-center gap-1.5">
                <CpuChipIcon className="w-3.5 h-3.5 text-success-500" />
                pgvector
              </span>
              <span className="font-mono text-[10px] text-default-400">v0.8.0</span>
            </div>
          </div>
        </div>

        {/* Open User Chat shortcut */}
        <div className="pt-2 border-t border-default-200/50 dark:border-default-100/30">
          <Link href="/chat" className="w-full">
            <Button
              variant="secondary"
              size="sm"
              className="w-full font-semibold flex items-center justify-center gap-2 border border-default-200/60 dark:border-default-100/30 rounded-xl h-9 text-xs"
            >
              <ChatBubbleLeftRightIcon className="w-4 h-4 text-primary" />
              <span>Open User Chat</span>
            </Button>
          </Link>
        </div>
      </Card>

      {/* 2. Main Content Area */}
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
