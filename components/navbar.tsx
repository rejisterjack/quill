"use client";

import React from "react";
import { Button, Link, Chip, Avatar } from "@heroui/react";
import NextLink from "next/link";
import { usePathname } from "next/navigation";
import { ThemeSwitch } from "@/components/theme-switch";
import { GithubIcon } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import {
  BoltIcon,
  ChatBubbleLeftRightIcon,
  WrenchScrewdriverIcon,
  ArrowRightStartOnRectangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";

export const Navbar = () => {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-default-200/50 dark:border-white/10 bg-background/70 backdrop-blur-xl transition-all">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Brand & Left Navigation */}
        <div className="flex items-center gap-8">
          <NextLink className="group flex items-center gap-2.5 font-bold text-inherit text-lg" href="/">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform duration-200">
              <BoltIcon className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent font-extrabold tracking-tight text-base leading-tight">
                RAG Starter Kit
              </span>
              <span className="text-[10px] font-mono text-default-400 font-medium tracking-wide">
                NEXT.JS 16 • PGVECTOR
              </span>
            </div>
          </NextLink>

          <ul className="hidden md:flex gap-1.5 items-center">
            <li>
              <NextLink
                href="/chat"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  pathname === "/chat"
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-default-600 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-50/50"
                }`}
              >
                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                <span>Chatbot</span>
              </NextLink>
            </li>
            <li>
              <NextLink
                href="/admin"
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                  pathname.startsWith("/admin")
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-default-600 hover:text-foreground hover:bg-default-100 dark:hover:bg-default-50/50"
                }`}
              >
                <WrenchScrewdriverIcon className="w-4 h-4" />
                <span>Admin Portal</span>
              </NextLink>
            </li>
          </ul>
        </div>

        {/* Right Navigation & Status Indicators */}
        <div className="flex items-center gap-3">
          {/* Live System Indicator */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full border border-success-500/20 bg-success-500/10 text-success-600 dark:text-success-400 text-[11px] font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-success-500" />
            </span>
            <span>pgvector Online</span>
          </div>

          <ThemeSwitch />

          <Link
            aria-label="Github"
            href="https://github.com/rejisterjack/rag-starter-kit"
            rel="noopener noreferrer"
            target="_blank"
            className="text-default-500 hover:text-foreground p-1.5 rounded-lg hover:bg-default-100 dark:hover:bg-default-50/50 transition-colors hidden sm:flex"
          >
            <GithubIcon />
          </Link>

          {!loading && (
            <>
              {user ? (
                <div className="flex items-center gap-2.5 pl-2 border-l border-default-200 dark:border-default-100/40">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shadow-inner">
                      {(user.name || user.email).substring(0, 2).toUpperCase()}
                    </div>
                    <div className="hidden sm:flex flex-col items-start leading-tight">
                      <span className="text-xs font-semibold max-w-[120px] truncate">
                        {user.name || user.email}
                      </span>
                      <span className="text-[10px] text-default-400 font-medium">
                        {user.role}
                      </span>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onPress={() => logout()}
                    className="text-xs text-danger hover:bg-danger-50 dark:hover:bg-danger-950/30 flex items-center gap-1 px-2.5 h-8"
                  >
                    <ArrowRightStartOnRectangleIcon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Logout</span>
                  </Button>
                </div>
              ) : (
                <NextLink href="/login">
                  <Button
                    size="sm"
                    variant="primary"
                    className="font-semibold px-4 h-8 text-xs shadow-md shadow-primary/20 flex items-center gap-1.5"
                  >
                    <SparklesIcon className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </Button>
                </NextLink>
              )}
            </>
          )}
        </div>
      </header>
    </nav>
  );
};
