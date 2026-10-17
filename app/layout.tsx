import "@/styles/globals.css";
import { Metadata, Viewport } from "next";
import clsx from "clsx";

import { Providers } from "./providers";
import { siteConfig } from "@/config/site";
import { fontSans, fontMono } from "@/config/fonts";
import { AppShell } from "@/components/app-shell";

export const metadata: Metadata = {
  title: {
    default: "RAG Starter Kit — Own Your AI Knowledge Base",
    template: `%s - RAG Starter Kit`,
  },
  description: "Self-hosted, production-grade Next.js 16 RAG starter kit with PostgreSQL, Prisma 7, pgvector, and HeroUI at $0 recurring cost.",
  icons: {
    icon: "/favicon.ico",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "#090d16" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html suppressHydrationWarning lang="en">
      <head />
      <body
        className={clsx(
          "min-h-screen text-foreground bg-background font-sans antialiased selection:bg-primary/20 selection:text-primary",
          fontSans.variable,
          fontMono.variable,
        )}
      >
        <Providers themeProps={{ attribute: "class", defaultTheme: "dark" }}>
          {/* Atmospheric ambient lighting & grid backdrop */}
          <div className="fixed inset-0 pointer-events-none bg-ambient-mesh opacity-70 z-0" />
          <div className="fixed inset-0 pointer-events-none bg-grid-pattern opacity-30 z-0" />

          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}
