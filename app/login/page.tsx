"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardHeader, CardContent, CardFooter, Button } from "@heroui/react";
import {
  BoltIcon,
  UserIcon,
  ShieldCheckIcon,
  LockClosedIcon,
  EnvelopeIcon,
  ArrowRightEndOnRectangleIcon,
  UserPlusIcon,
  ExclamationCircleIcon,
  SparklesIcon,
  KeyIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [selectedTab, setSelectedTab] = useState<"login" | "register">("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Register form state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      await refresh();
      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/chat");
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: regName,
          email: regEmail,
          password: regPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      await refresh();
      router.push("/chat");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const quickFillAdmin = () => {
    setEmail("admin@rag-starter.dev");
    setPassword("Admin1234!");
    setError(null);
  };

  const quickFillDemo = () => {
    setEmail("demo@rag-starter.dev");
    setPassword("Demo1234!");
    setError(null);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-14rem)] py-12 px-4 relative">
      {/* Background Glow */}
      <div className="absolute w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none -top-10" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
              <BoltIcon className="w-6 h-6" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              RAG Starter Kit
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-default-500">
            Sign in to manage your knowledge base or query the assistant.
          </p>
        </div>

        <Card className="p-4 sm:p-6 shadow-2xl border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl">
          <CardHeader className="flex flex-col gap-3 pb-0 p-0">
            {/* Tab switch buttons */}
            <div className="flex w-full p-1 bg-default-100/80 dark:bg-default-50/30 rounded-xl gap-1 border border-default-200/40 dark:border-default-100/30">
              <button
                type="button"
                onClick={() => {
                  setSelectedTab("login");
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  selectedTab === "login"
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setSelectedTab("register");
                  setError(null);
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  selectedTab === "register"
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-default-500 hover:text-foreground"
                }`}
              >
                <UserPlusIcon className="w-4 h-4" />
                Create Account
              </button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 p-0">
            {error && (
              <div className="mb-4 p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-xs text-danger-600 dark:text-danger-400 flex items-start gap-2">
                <ExclamationCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                <span>
                  <strong className="mr-1">Authentication Error:</strong> {error}
                </span>
              </div>
            )}

            {selectedTab === "login" ? (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-default-700 dark:text-default-300 flex items-center gap-1.5">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-default-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="admin@rag-starter.dev"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-default-700 dark:text-default-300 flex items-center gap-1.5">
                    <LockClosedIcon className="w-3.5 h-3.5 text-default-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="w-full font-bold h-11 shadow-lg shadow-primary/25 mt-2 flex items-center justify-center gap-2 rounded-xl"
                >
                  <ArrowRightEndOnRectangleIcon className="w-4 h-4" />
                  {loading ? "Signing in..." : "Sign In"}
                </Button>

                <div className="mt-4 pt-4 border-t border-default-200/50 dark:border-default-100/30">
                  <p className="text-[11px] text-default-400 font-medium mb-2.5 text-center flex items-center justify-center gap-1">
                    <KeyIcon className="w-3.5 h-3.5 text-primary" />
                    <span>Quick login with pre-configured accounts:</span>
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={quickFillAdmin}
                      className="p-2.5 rounded-xl border border-default-200/60 dark:border-default-100/40 bg-default-100/40 dark:bg-default-50/10 hover:border-primary/50 text-left transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-primary">
                        <ShieldCheckIcon className="w-4 h-4 text-primary" />
                        Admin
                      </div>
                      <div className="text-[10px] text-default-400 mt-0.5 truncate">
                        admin@rag-starter.dev
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={quickFillDemo}
                      className="p-2.5 rounded-xl border border-default-200/60 dark:border-default-100/40 bg-default-100/40 dark:bg-default-50/10 hover:border-primary/50 text-left transition-all duration-200 group"
                    >
                      <div className="flex items-center gap-1.5 text-xs font-bold text-foreground group-hover:text-primary">
                        <UserIcon className="w-4 h-4 text-default-500" />
                        Demo User
                      </div>
                      <div className="text-[10px] text-default-400 mt-0.5 truncate">
                        demo@rag-starter.dev
                      </div>
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-default-700 dark:text-default-300 flex items-center gap-1.5">
                    <UserIcon className="w-3.5 h-3.5 text-default-400" />
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Jane Doe"
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-default-700 dark:text-default-300 flex items-center gap-1.5">
                    <EnvelopeIcon className="w-3.5 h-3.5 text-default-400" />
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="you@domain.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-default-700 dark:text-default-300 flex items-center gap-1.5">
                    <LockClosedIcon className="w-3.5 h-3.5 text-default-400" />
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="At least 8 characters"
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  />
                </div>

                <Button
                  variant="primary"
                  type="submit"
                  size="lg"
                  className="w-full font-bold h-11 shadow-lg shadow-primary/25 mt-2 flex items-center justify-center gap-2 rounded-xl"
                >
                  <UserPlusIcon className="w-4 h-4" />
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            )}
          </CardContent>

          <CardFooter className="justify-center text-xs text-default-400 pt-5 border-t border-default-200/50 dark:border-default-100/30 p-0 mt-4">
            Self-hosted • PostgreSQL + pgvector • 100% TypeScript
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
