"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Chip,
} from "@heroui/react";
import {
  PaperAirplaneIcon,
  SparklesIcon,
  ArrowPathIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  BookOpenIcon,
  InformationCircleIcon,
  XMarkIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

interface CitationSource {
  id: string;
  documentName: string;
  documentType: string;
  page?: number;
  section?: string;
  similarity: number;
  content: string;
}

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: CitationSource[];
  latencyMs?: number;
}

const STARTER_PROMPTS = [
  "What is the refund policy?",
  "How do we onboard new enterprise clients?",
  "Summarize key internal guidelines",
];

export default function EmbedChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hello! I am your AI Knowledge Assistant. Ask me anything about our documentation, guides, and policies.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [activeCitation, setActiveCitation] = useState<CitationSource | null>(null);
  const [isCitationOpen, setIsCitationOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: query.trim(),
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMsg: Message = {
      id: assistantMsgId,
      role: "assistant",
      content: "",
      sources: [],
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput("");
    setIsLoading(true);

    const startTime = Date.now();

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }

      if (!response.body) {
        throw new Error("No response body received");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let streamBuffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        streamBuffer += decoder.decode(value, { stream: true });
        const blocks = streamBuffer.split("\n\n");
        streamBuffer = blocks.pop() || "";

        for (const block of blocks) {
          if (!block.trim()) continue;

          let eventName = "message";
          let dataStr = "";

          const lines = block.split("\n");
          for (const line of lines) {
            if (line.startsWith("event:")) {
              eventName = line.replace("event:", "").trim();
            } else if (line.startsWith("data:")) {
              dataStr = line.replace("data:", "").trim();
            }
          }

          if (!dataStr) continue;

          try {
            const data = JSON.parse(dataStr);
            if (eventName === "sources" && data.sources) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, sources: data.sources }
                    : m
                )
              );
            } else if (eventName === "content" && data.text) {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId
                    ? { ...m, content: m.content + data.text }
                    : m
                )
              );
            } else if (eventName === "done") {
              const latency = Date.now() - startTime;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMsgId ? { ...m, latencyMs: latency } : m
                )
              );
            }
          } catch {
            // Ignore parse errors on malformed chunks
          }
        }
      }
    } catch {
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantMsgId
            ? {
                ...m,
                content:
                  "I encountered an issue connecting to the knowledge base. Please try asking again.",
              }
            : m
        )
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content:
          "Hello! I am your AI Knowledge Assistant. Ask me anything about our documentation, guides, and policies.",
      },
    ]);
  };

  const openCitationModal = (source: CitationSource) => {
    setActiveCitation(source);
    setIsCitationOpen(true);
    setCopied(false);
  };

  const handleCopyCitation = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-screen max-h-[100dvh] bg-background text-foreground antialiased overflow-hidden">
      {/* Widget Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-default-200/50 dark:border-default-100/30 bg-background/80 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-white shadow-sm shadow-primary/30">
            <SparklesIcon className="w-4 h-4" />
          </div>
          <div>
            <h1 className="text-sm font-semibold tracking-tight leading-tight">
              AI Knowledge Assistant
            </h1>
            <div className="flex items-center gap-1.5 text-[11px] text-default-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>pgvector RAG • Active</span>
            </div>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onPress={handleReset}
          className="text-xs h-7 px-2 border border-default-200/50 rounded-lg flex items-center gap-1"
        >
          <ArrowPathIcon className="w-3.5 h-3.5" />
          <span>Reset</span>
        </Button>
      </div>

      {/* Message Stream */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-[88%] rounded-2xl p-3.5 text-sm leading-relaxed shadow-sm ${
                msg.role === "user"
                  ? "bg-primary text-primary-foreground font-medium rounded-tr-sm"
                  : "bg-default-100/80 dark:bg-default-50/20 text-foreground border border-default-200/40 dark:border-default-100/20 rounded-tl-sm backdrop-blur-md"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {/* Citations */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-default-200/40 dark:border-default-100/30 space-y-1.5">
                  <div className="text-[11px] font-semibold text-default-500 flex items-center gap-1">
                    <BookOpenIcon className="w-3.5 h-3.5" />
                    <span>Verified Knowledge Citations:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.sources.map((src, i) => (
                      <Chip
                        key={src.id || i}
                        size="sm"
                        variant="soft"
                        color="accent"
                        className="cursor-pointer text-[11px] hover:scale-105 transition-transform"
                        onClick={() => openCitationModal(src)}
                      >
                        <span className="flex items-center gap-1">
                          <CheckCircleIcon className="w-3 h-3 text-secondary" />
                          <span>
                            {src.documentName || `Source [${i + 1}]`}
                            {src.page ? ` (p.${src.page})` : ""}
                          </span>
                        </span>
                      </Chip>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Latency badge */}
            {msg.latencyMs && (
              <span className="text-[10px] text-default-400 mt-1 px-1">
                Completed in {msg.latencyMs}ms
              </span>
            )}
          </div>
        ))}

        {isLoading && messages[messages.length - 1]?.content === "" && (
          <div className="flex items-center gap-2 text-xs text-default-400 p-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span>Retrieving context & generating answer...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Starter Prompts when conversation is fresh */}
      {messages.length === 1 && (
        <div className="px-4 pb-2">
          <p className="text-[11px] text-default-400 mb-1.5 flex items-center gap-1 font-medium">
            <InformationCircleIcon className="w-3.5 h-3.5" />
            Suggested questions:
          </p>
          <div className="flex flex-wrap gap-1.5">
            {STARTER_PROMPTS.map((prompt, i) => (
              <Button
                key={i}
                size="sm"
                variant="secondary"
                className="text-xs h-7 px-2.5 bg-default-100/80 dark:bg-default-50/20 hover:bg-default-200 rounded-lg"
                onPress={() => handleSend(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Input Box */}
      <div className="p-3 border-t border-default-200/50 dark:border-default-100/30 bg-background/80 backdrop-blur-md">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about the docs..."
            disabled={isLoading}
            className="flex-1 text-sm bg-default-100/70 dark:bg-default-50/10 border border-default-200/60 dark:border-default-100/30 rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <Button
            type="submit"
            size="sm"
            variant="primary"
            className="h-9 px-3 rounded-xl font-bold flex items-center gap-1 shrink-0"
            isDisabled={!input.trim() || isLoading}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <PaperAirplaneIcon className="w-4 h-4" />
            )}
          </Button>
        </form>
        <div className="flex items-center justify-between text-[10px] text-default-400 mt-1.5 px-1">
          <span>Powered by Quill</span>
          <span>Zero recurring cost</span>
        </div>
      </div>

      {/* Citation Inspector Modal */}
      {isCitationOpen && activeCitation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <Card className="w-full max-w-md border border-default-200/60 dark:border-white/10 bg-background/95 backdrop-blur-2xl shadow-2xl rounded-2xl overflow-hidden">
            <CardHeader className="flex justify-between items-center p-4 border-b border-default-200/60 dark:border-default-100/30">
              <div className="flex items-center gap-2">
                <DocumentTextIcon className="w-5 h-5 text-secondary" />
                <span className="font-bold text-sm">Citation Inspector</span>
              </div>
              <button
                type="button"
                onClick={() => setIsCitationOpen(false)}
                className="text-default-400 hover:text-foreground p-1 rounded-lg"
              >
                <XMarkIcon className="w-4 h-4" />
              </button>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs text-default-500">
                <div>
                  <strong>Document:</strong> {activeCitation.documentName}
                </div>
                <Chip size="sm" color="success" variant="soft">
                  Match: {Math.round((activeCitation.similarity || 0.85) * 100)}%
                </Chip>
              </div>
              {activeCitation.page && (
                <div className="text-xs text-default-400">
                  Page: {activeCitation.page}
                </div>
              )}
              <div>
                <div className="flex justify-between items-center mb-1 text-xs font-semibold text-default-500">
                  <span>Exact Semantic Chunk:</span>
                  <button
                    type="button"
                    onClick={() => handleCopyCitation(activeCitation.content)}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    {copied ? (
                      <>
                        <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-success-500" />
                        <span className="text-success-500">Copied!</span>
                      </>
                    ) : (
                      <>
                        <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                        <span>Copy Text</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="p-3 rounded-xl bg-default-100 dark:bg-default-50/20 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto border border-default-200/50">
                  {activeCitation.content}
                </div>
              </div>
            </CardContent>
            <CardFooter className="justify-end p-3 border-t border-default-200/60 dark:border-default-100/30">
              <Button
                size="sm"
                variant="secondary"
                onPress={() => setIsCitationOpen(false)}
                className="rounded-xl text-xs"
              >
                Close Inspector
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
