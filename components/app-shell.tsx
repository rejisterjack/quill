"use client";

import React from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { Navbar } from "@/components/navbar";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isEmbed = pathname?.startsWith("/embed");

  if (isEmbed) {
    return (
      <main className="min-h-screen w-full flex flex-col p-2 sm:p-4">
        {children}
      </main>
    );
  }

  return (
    <div className="relative z-10 flex flex-col min-h-screen">
      <Navbar />
      <main className="container mx-auto max-w-7xl pt-6 px-4 sm:px-6 flex-grow">
        {children}
      </main>
      <footer className="w-full border-t border-default-200/40 dark:border-default-100/30 py-6 mt-12 bg-background/50 backdrop-blur-md">
        <div className="container mx-auto max-w-7xl px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-default-500">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>PostgreSQL + pgvector • 100% TypeScript • $0 Recurring Cost</span>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <NextLink href="/docs" className="hover:text-primary transition-colors">
              Docs
            </NextLink>
            <span>•</span>
            <NextLink href="/pricing" className="hover:text-primary transition-colors">
              Pricing
            </NextLink>
            <span>•</span>
            <NextLink href="/about" className="hover:text-primary transition-colors">
              About
            </NextLink>
            <span>•</span>
            <NextLink href="/blog" className="hover:text-primary transition-colors">
              Blog
            </NextLink>
            <span>•</span>
            <a
              href="https://github.com/rejisterjack/rag-starter-kit"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors"
            >
              GitHub
            </a>
            <span>•</span>
            <a
              href="https://heroui.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-primary transition-colors font-medium text-foreground"
            >
              HeroUI
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
