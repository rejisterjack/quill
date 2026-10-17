"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Chip,
} from "@heroui/react";
import { useAuth } from "@/lib/auth-context";
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PaperAirplaneIcon,
  DocumentTextIcon,
  XMarkIcon,
  SparklesIcon,
  TrashIcon,
  ChatBubbleLeftRightIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
  ArrowPathIcon,
  CpuChipIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";

interface Source {
  chunkId: string;
  documentTitle: string;
  similarity: number;
  snippet: string;
  pageNumber?: number;
  section?: string;
}

interface ChatMessage {
  id: string;
  role: "USER" | "ASSISTANT" | "SYSTEM";
  content: string;
  sources?: Source[];
}

interface ChatSession {
  id: string;
  title: string;
  messageCount: number;
  updatedAt: string;
}

const STARTER_PROMPTS = [
  "How does the pgvector cosine distance search work in this starter kit?",
  "What document formats can I upload and index into the knowledge base?",
  "Explain the difference between Mode 1 (Turnkey) and Mode 2 (Starter Kit).",
  "How does this platform maintain $0 recurring monthly operating costs?",
];

export default function ChatPage() {
  const { user, activeWorkspace } = useAuth();
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedSnippetId, setCopiedSnippetId] = useState<string | null>(null);

  // Citation inspector modal state
  const [selectedSource, setSelectedSource] = useState<Source | null>(null);
  const [isCitationOpen, setIsCitationOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isStreaming]);

  // Load chat sessions
  const loadChats = async () => {
    try {
      const res = await fetch("/api/chats");
      if (res.ok) {
        const data = await res.json();
        setChats(data.chats || []);
      }
    } catch (err) {
      console.error("Failed to load chats:", err);
    }
  };

  useEffect(() => {
    loadChats();
  }, [activeWorkspace]);

  // Load messages when active chat changes
  const loadMessages = async (chatId: string) => {
    try {
      const res = await fetch(`/api/chats/${chatId}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          data.messages.map((m: any) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            sources: m.sources ? (typeof m.sources === "string" ? JSON.parse(m.sources) : m.sources) : undefined,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    }
  };

  const handleSelectChat = (chatId: string) => {
    setActiveChatId(chatId);
    loadMessages(chatId);
  };

  const handleNewChat = () => {
    setActiveChatId(null);
    setMessages([]);
  };

  const handleDeleteChat = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation();
    try {
      await fetch(`/api/chats?id=${chatId}`, { method: "DELETE" });
      if (activeChatId === chatId) {
        handleNewChat();
      }
      loadChats();
    } catch (err) {
      console.error("Failed to delete chat:", err);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isStreaming) return;

    setInputMessage("");

    // Add user message to UI immediately
    const tempUserMsgId = `user_${Date.now()}`;
    const newMessages: ChatMessage[] = [
      ...messages,
      { id: tempUserMsgId, role: "USER", content: text },
    ];
    setMessages(newMessages);
    setIsStreaming(true);

    // Placeholder for assistant
    const tempAssistantId = `assistant_${Date.now()}`;
    let streamedContent = "";
    let currentSources: Source[] = [];

    setMessages((prev) => [
      ...prev,
      {
        id: tempAssistantId,
        role: "ASSISTANT",
        content: "",
        sources: [],
      },
    ]);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          chatId: activeChatId,
          workspaceId: activeWorkspace?.id,
        }),
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const eventBlock of events) {
          if (!eventBlock.trim()) continue;

          const blockLines = eventBlock.split("\n");
          let eventType = "";
          let dataStr = "";

          for (const bl of blockLines) {
            if (bl.startsWith("event:")) {
              eventType = bl.slice(6).trim();
            } else if (bl.startsWith("data:")) {
              dataStr = bl.slice(5).trim();
            }
          }

          if (eventType === "sources" && dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              if (parsed.chatId && !activeChatId) {
                setActiveChatId(parsed.chatId);
              }
              currentSources = parsed.sources || [];
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempAssistantId ? { ...msg, sources: currentSources } : msg
                )
              );
            } catch (parseErr) {
              console.error("Failed to parse sources event:", parseErr);
            }
          } else if (eventType === "token" && dataStr) {
            try {
              const parsed = JSON.parse(dataStr);
              streamedContent += parsed.token || "";
              setMessages((prev) =>
                prev.map((msg) =>
                  msg.id === tempAssistantId
                    ? { ...msg, content: streamedContent, sources: currentSources }
                    : msg
                )
              );
            } catch (parseErr) {
              console.error("Failed to parse token event:", parseErr);
            }
          } else if (eventType === "done" || eventType === "end") {
            loadChats();
          }
        }
      }
    } catch (err: unknown) {
      console.error("Stream failed:", err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempAssistantId
            ? {
                ...msg,
                content:
                  msg.content ||
                  "⚠️ Unable to complete request. Please verify OpenRouter API key and network connection.",
              }
            : msg
        )
      );
    } finally {
      setIsStreaming(false);
    }
  };

  const handleInspectCitation = (source: Source) => {
    setSelectedSource(source);
    setIsCitationOpen(true);
  };

  const copySnippet = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSnippetId(id);
    setTimeout(() => setCopiedSnippetId(null), 2000);
  };

  const filteredChats = chats.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-8.5rem)] gap-4 relative">
      {/* 1. Sidebar - Conversation History */}
      <aside className="w-80 hidden md:flex flex-col rounded-2xl border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl shadow-xl overflow-hidden">
        {/* Sidebar Header */}
        <div className="p-3.5 border-b border-default-200/60 dark:border-default-100/30 space-y-3">
          <Button
            variant="primary"
            className="w-full font-bold h-10 shadow-md shadow-primary/20 flex items-center justify-center gap-2 rounded-xl text-xs"
            onPress={handleNewChat}
          >
            <PlusIcon className="w-4 h-4" />
            <span>New Conversation</span>
            <span className="text-[10px] bg-white/20 px-1.5 py-0.5 rounded font-mono ml-auto">
              ⌘K
            </span>
          </Button>

          {/* Search box */}
          <div className="relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-default-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-default-200/70 dark:border-default-100/30 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredChats.length === 0 ? (
            <div className="text-center py-10 px-4 text-xs text-default-400">
              <ChatBubbleLeftRightIcon className="w-8 h-8 mx-auto mb-2 text-default-300 dark:text-default-600" />
              <span>No past conversations found.</span>
            </div>
          ) : (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => handleSelectChat(chat.id)}
                className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer text-xs transition-all duration-200 border ${
                  activeChatId === chat.id
                    ? "bg-primary/10 border-primary/40 text-primary font-semibold shadow-sm"
                    : "border-transparent hover:bg-default-100/70 dark:hover:bg-default-50/30 text-default-600 dark:text-default-300"
                }`}
              >
                <div className="flex items-center gap-2 truncate pr-2">
                  <ChatBubbleLeftRightIcon className="w-4 h-4 shrink-0 text-default-400 group-hover:text-primary" />
                  <span className="truncate">{chat.title}</span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={(e) => handleDeleteChat(e, chat.id)}
                    className="p-1 text-default-400 hover:text-danger rounded hover:bg-danger-50 dark:hover:bg-danger-950/30 transition-colors"
                    title="Delete chat"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Sidebar Footer Info */}
        <div className="p-3 border-t border-default-200/50 dark:border-default-100/30 bg-default-100/30 flex items-center justify-between text-[11px] text-default-400">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-success-500" />
            <span>pgvector Connected</span>
          </div>
          <span className="font-mono">OpenRouter Free</span>
        </div>
      </aside>

      {/* 2. Main Chat Area */}
      <main className="flex-1 flex flex-col rounded-2xl border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl shadow-2xl overflow-hidden relative">
        {/* Chat Window Top Bar */}
        <header className="h-14 px-5 border-b border-default-200/60 dark:border-default-100/30 flex items-center justify-between bg-default-100/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
              <SparklesIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xs sm:text-sm font-bold text-foreground truncate max-w-[200px] sm:max-w-md">
                {activeChatId
                  ? chats.find((c) => c.id === activeChatId)?.title || "Active Discussion"
                  : "Knowledge Assistant"}
              </h2>
              <p className="text-[10px] text-default-400 font-medium">
                Grounded via PostgreSQL cosine similarity
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Chip size="sm" variant="soft" color="accent" className="text-[10px] font-mono hidden sm:flex">
              <CpuChipIcon className="w-3 h-3 inline mr-1 text-primary" />
              mistral-7b-instruct:free
            </Chip>
            <Button
              size="sm"
              variant="ghost"
              className="text-xs text-default-500 h-8"
              onPress={handleNewChat}
            >
              Clear
            </Button>
          </div>
        </header>

        {/* Messages Stream Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {messages.length === 0 ? (
            /* Empty State Hero */
            <div className="flex flex-col items-center justify-center h-full text-center max-w-lg mx-auto space-y-6 py-8">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-xl shadow-indigo-500/30">
                <SparklesIcon className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
                  How can I help you today?
                </h3>
                <p className="text-xs sm:text-sm text-default-500 mt-1.5 leading-relaxed">
                  Ask any question about your indexed documents. Answers are strictly grounded with real-time cosine similarity citations.
                </p>
              </div>

              {/* Starter Prompts Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full pt-2">
                {STARTER_PROMPTS.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(prompt)}
                    className="p-3 rounded-xl border border-default-200/60 dark:border-default-100/30 bg-default-100/40 dark:bg-default-50/10 hover:border-primary/50 text-left transition-all duration-200 group text-xs text-default-600 dark:text-default-300 hover:text-foreground"
                  >
                    <div className="flex items-start gap-2">
                      <SparklesIcon className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                      <span className="leading-snug">{prompt}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Message Bubbles */
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${
                  msg.role === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                {msg.role === "ASSISTANT" && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs shrink-0 shadow-sm mt-1">
                    <SparklesIcon className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                    msg.role === "USER"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-tr-sm shadow-md shadow-indigo-500/20 font-medium"
                      : "bg-default-100/80 dark:bg-default-100/30 rounded-tl-sm border border-default-200/60 dark:border-white/10 text-default-800 dark:text-default-100 space-y-3"
                  }`}
                >
                  {/* Message Content */}
                  <div className="whitespace-pre-wrap">
                    {msg.content || (
                      <span className="inline-flex items-center gap-1.5 text-default-400">
                        <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                        <span>Searching pgvector knowledge base & generating answer...</span>
                      </span>
                    )}
                  </div>

                  {/* Grounded Citation Chips */}
                  {msg.sources && msg.sources.length > 0 && (
                    <div className="pt-2 border-t border-default-200/50 dark:border-default-100/30 space-y-2">
                      <div className="text-[11px] font-semibold text-default-400 flex items-center gap-1">
                        <CheckBadgeIcon className="w-3.5 h-3.5 text-success-500" />
                        <span>Verified Citations ({msg.sources.length}):</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {msg.sources.map((src, sIdx) => {
                          const percentMatch = Math.round((1 - src.similarity) * 100);
                          return (
                            <button
                              key={sIdx}
                              type="button"
                              onClick={() => handleInspectCitation(src)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-primary/25 bg-primary/10 hover:bg-primary/20 text-primary text-[11px] font-medium transition-colors"
                            >
                              <DocumentTextIcon className="w-3.5 h-3.5" />
                              <span className="truncate max-w-[140px]">{src.documentTitle}</span>
                              <span className="bg-primary/20 px-1 rounded text-[10px] font-mono">
                                {percentMatch > 0 ? `${percentMatch}%` : "Match"}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* 3. Bottom Prompt Input Dock */}
        <div className="p-4 border-t border-default-200/60 dark:border-default-100/30 bg-default-100/30">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask anything about your knowledge base..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              disabled={isStreaming}
              className="flex-1 px-4 py-3 text-xs sm:text-sm rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background/90 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
            />
            <Button
              type="submit"
              variant="primary"
              size="lg"
              isDisabled={!inputMessage.trim() || isStreaming}
              className="font-bold px-6 h-11 shadow-md shadow-primary/20 flex items-center gap-2 rounded-xl text-xs sm:text-sm"
            >
              <PaperAirplaneIcon className="w-4 h-4" />
              <span>{isStreaming ? "Thinking..." : "Send"}</span>
            </Button>
          </form>
          <div className="flex justify-between items-center text-[10px] text-default-400 mt-2 px-1">
            <span>Press <strong>Enter</strong> to send • Answers are grounded via pgvector cosine retrieval</span>
            <span>$0.00 / query</span>
          </div>
        </div>
      </main>

      {/* 4. Slide-over Citation Inspector Modal */}
      {isCitationOpen && selectedSource && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border border-default-200/60 dark:border-white/10 shadow-2xl bg-background rounded-2xl overflow-hidden">
            <CardHeader className="flex justify-between items-center p-4 border-b border-default-200/60 dark:border-default-100/30">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                  <DocumentTextIcon className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold truncate max-w-sm">
                    {selectedSource.documentTitle}
                  </h3>
                  <p className="text-[11px] text-default-400">
                    Source Chunk ID: <code className="font-mono text-primary">{selectedSource.chunkId}</code>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCitationOpen(false)}
                className="text-default-400 hover:text-foreground p-1"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="p-5 space-y-4">
              <div className="flex items-center justify-between text-xs p-3 rounded-xl bg-default-100/50 dark:bg-default-50/20 border border-default-200/40 dark:border-default-100/30">
                <div className="space-y-0.5">
                  <span className="text-default-400">Similarity Metric:</span>
                  <div className="font-mono font-bold text-foreground">
                    Cosine Distance ({selectedSource.similarity.toFixed(4)})
                  </div>
                </div>
                <Chip size="sm" color="success" variant="soft" className="font-semibold">
                  Match Confidence: {Math.round((1 - selectedSource.similarity) * 100)}%
                </Chip>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-semibold text-default-600">
                    Extracted Semantic Chunk:
                  </span>
                  <button
                    type="button"
                    onClick={() => copySnippet(selectedSource.snippet, selectedSource.chunkId)}
                    className="text-[11px] text-primary hover:underline flex items-center gap-1"
                  >
                    {copiedSnippetId === selectedSource.chunkId ? (
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
                <div className="p-3.5 bg-default-900 text-default-100 rounded-xl font-mono text-xs max-h-72 overflow-y-auto leading-relaxed border border-default-800">
                  {selectedSource.snippet}
                </div>
              </div>
            </CardContent>

            <CardFooter className="justify-end p-4 border-t border-default-200/60 dark:border-default-100/30">
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
