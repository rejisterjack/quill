"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
  Button,
  Chip,
} from "@heroui/react";
import {
  PlusIcon,
  DocumentTextIcon,
  GlobeAltIcon,
  TrashIcon,
  XMarkIcon,
  Squares2X2Icon,
  EyeIcon,
  MagnifyingGlassIcon,
  ArrowUpTrayIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  DocumentDuplicateIcon,
  ClipboardDocumentCheckIcon,
  ClipboardDocumentIcon,
} from "@heroicons/react/24/outline";

interface DocumentItem {
  id: string;
  name: string;
  contentType: string;
  size: number;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  chunkCount: number;
  sourceUrl?: string;
  createdAt: string;
}

interface ChunkItem {
  id: string;
  index: number;
  content: string;
  page?: number;
  section?: string;
}

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadTab, setUploadTab] = useState<"file" | "url" | "text">("file");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [urlInput, setUrlInput] = useState("");
  const [pastedTitle, setPastedTitle] = useState("");
  const [pastedText, setPastedText] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Chunk Inspector modal state
  const [isChunksOpen, setIsChunksOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentItem | null>(null);
  const [docChunks, setDocChunks] = useState<ChunkItem[]>([]);
  const [loadingChunks, setLoadingChunks] = useState(false);
  const [copiedChunkId, setCopiedChunkId] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/documents");
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents || []);
      }
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const handleInspectChunks = async (doc: DocumentItem) => {
    setSelectedDoc(doc);
    setLoadingChunks(true);
    setIsChunksOpen(true);

    try {
      const res = await fetch(`/api/documents/${doc.id}/chunks`);
      if (res.ok) {
        const data = await res.json();
        setDocChunks(data.chunks || []);
      }
    } catch (err) {
      console.error("Failed to fetch chunks:", err);
    } finally {
      setLoadingChunks(false);
    }
  };

  const handleDeleteDocument = async (id: string) => {
    if (!confirm("Are you sure you want to delete this document and its pgvector chunks?")) {
      return;
    }

    try {
      const res = await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };

  const handleUpload = async () => {
    setUploadError(null);
    setUploading(true);

    try {
      let res: Response;

      if (uploadTab === "file") {
        if (!selectedFile) throw new Error("Please select a file to upload");
        const formData = new FormData();
        formData.append("file", selectedFile);
        res = await fetch("/api/documents/upload", {
          method: "POST",
          body: formData,
        });
      } else if (uploadTab === "url") {
        if (!urlInput.trim()) throw new Error("Please enter a valid URL");
        res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: urlInput.trim() }),
        });
      } else {
        if (!pastedText.trim()) throw new Error("Please enter text content");
        res = await fetch("/api/documents/upload", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: pastedTitle.trim() || "Pasted Document",
            text: pastedText.trim(),
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Upload failed");
      }

      // Reset form & reload
      setSelectedFile(null);
      setUrlInput("");
      setPastedTitle("");
      setPastedText("");
      setIsUploadOpen(false);
      fetchDocuments();
    } catch (err: unknown) {
      setUploadError(err instanceof Error ? err.message : "Failed to process upload");
    } finally {
      setUploading(false);
    }
  };

  const copyChunkContent = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedChunkId(id);
    setTimeout(() => setCopiedChunkId(null), 2000);
  };

  const filteredDocs = documents.filter((doc) =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFormatBadge = (doc: DocumentItem) => {
    if (doc.sourceUrl) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded-md border border-cyan-500/20">
          <GlobeAltIcon className="w-3 h-3" />
          URL
        </span>
      );
    }
    if (doc.name.endsWith(".pdf") || doc.contentType.includes("pdf")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md border border-red-500/20">
          <DocumentTextIcon className="w-3 h-3" />
          PDF
        </span>
      );
    }
    if (doc.name.endsWith(".docx") || doc.contentType.includes("word")) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 dark:text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded-md border border-blue-500/20">
          <DocumentTextIcon className="w-3 h-3" />
          DOCX
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
        <DocumentTextIcon className="w-3 h-3" />
        TEXT
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Bar with Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Knowledge Base Documents
            </h1>
            <Chip size="sm" variant="soft" color="accent" className="font-mono text-xs">
              {documents.length} Files
            </Chip>
          </div>
          <p className="text-xs sm:text-sm text-default-500 mt-1">
            Uploaded content is automatically split into semantic chunks and indexed via pgvector.
          </p>
        </div>

        <Button
          variant="primary"
          className="font-bold text-xs h-10 px-4 shadow-md shadow-primary/25 rounded-xl flex items-center gap-2 shrink-0"
          onPress={() => setIsUploadOpen(true)}
        >
          <ArrowUpTrayIcon className="w-4 h-4" />
          <span>Add Document</span>
        </Button>
      </div>

      {/* 2. Documents Table Card */}
      <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-5">
        <div className="mb-4 max-w-sm relative">
          <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-default-400" />
          <input
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-default-200/70 dark:border-default-100/30 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-default-200/60 dark:border-default-100/30 text-[11px] font-semibold text-default-400 uppercase tracking-wider">
                <th className="py-3 px-3">DOCUMENT</th>
                <th className="py-3 px-3">TYPE</th>
                <th className="py-3 px-3">STATUS</th>
                <th className="py-3 px-3">CHUNKS</th>
                <th className="py-3 px-3">DATE</th>
                <th className="py-3 px-3 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100 dark:divide-default-200/20">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-default-400">
                    <ArrowPathIcon className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
                    <span>Loading knowledge documents...</span>
                  </td>
                </tr>
              ) : filteredDocs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-default-400">
                    <DocumentDuplicateIcon className="w-8 h-8 mx-auto mb-2 text-default-300 dark:text-default-600" />
                    <p className="font-semibold text-foreground">No documents found</p>
                    <p className="text-[11px] mt-0.5">Click "Add Document" to index your first file or web URL.</p>
                  </td>
                </tr>
              ) : (
                filteredDocs.map((doc) => (
                  <tr
                    key={doc.id}
                    className="hover:bg-default-100/50 dark:hover:bg-default-50/20 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <div className="font-semibold text-foreground truncate max-w-[200px] sm:max-w-xs">
                        {doc.name}
                      </div>
                      {doc.sourceUrl && (
                        <div className="text-[10px] text-default-400 font-mono truncate max-w-xs">
                          {doc.sourceUrl}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      {getFormatBadge(doc)}
                    </td>
                    <td className="py-3 px-3">
                      <Chip
                        size="sm"
                        variant="soft"
                        color={
                          doc.status === "COMPLETED"
                            ? "success"
                            : doc.status === "PROCESSING"
                            ? "warning"
                            : "danger"
                        }
                        className="text-[10px] font-bold"
                      >
                        {doc.status}
                      </Chip>
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-default-100 dark:bg-default-50/20 border border-default-200/40 dark:border-default-100/20">
                        {doc.chunkCount || 0} chunks
                      </span>
                    </td>
                    <td className="py-3 px-3 text-xs text-default-400">
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="flex justify-end gap-1.5">
                        <Button
                          size="sm"
                          variant="secondary"
                          className="text-xs h-7 px-2.5 rounded-lg flex items-center gap-1 border border-default-200/60 dark:border-default-100/30"
                          onPress={() => handleInspectChunks(doc)}
                        >
                          <EyeIcon className="w-3.5 h-3.5 text-primary" />
                          <span>Inspect</span>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-xs h-7 px-2 text-danger hover:bg-danger-50 dark:hover:bg-danger-950/30 rounded-lg flex items-center"
                          onPress={() => handleDeleteDocument(doc.id)}
                        >
                          <TrashIcon className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 3. Add Document Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-2xl border border-default-200/60 dark:border-white/10 shadow-2xl bg-background rounded-2xl overflow-hidden">
            <CardHeader className="flex justify-between items-center p-4 sm:p-5 border-b border-default-200/60 dark:border-default-100/30">
              <div>
                <h3 className="text-base sm:text-lg font-bold">Add to Knowledge Base</h3>
                <p className="text-xs text-default-400 mt-0.5">
                  Uploaded content is automatically parsed, split into sliding-window chunks, and embedded into pgvector.
                </p>
              </div>
              <button
                type="button"
                className="text-default-400 hover:text-foreground p-1"
                onClick={() => setIsUploadOpen(false)}
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-4">
              {uploadError && (
                <div className="p-3 bg-danger-500/10 border border-danger-500/20 rounded-xl text-xs text-danger-600 dark:text-danger-400 flex items-start gap-2">
                  <ExclamationCircleIcon className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {/* Tab Selector */}
              <div className="flex w-full p-1 bg-default-100/80 dark:bg-default-50/30 rounded-xl gap-1 border border-default-200/40 dark:border-default-100/30">
                <button
                  type="button"
                  onClick={() => setUploadTab("file")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    uploadTab === "file"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-default-500 hover:text-foreground"
                  }`}
                >
                  <ArrowUpTrayIcon className="w-3.5 h-3.5" />
                  File Upload
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab("url")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    uploadTab === "url"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-default-500 hover:text-foreground"
                  }`}
                >
                  <GlobeAltIcon className="w-3.5 h-3.5" />
                  Crawl Web URL
                </button>
                <button
                  type="button"
                  onClick={() => setUploadTab("text")}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                    uploadTab === "text"
                      ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                      : "text-default-500 hover:text-foreground"
                  }`}
                >
                  <DocumentTextIcon className="w-3.5 h-3.5" />
                  Paste Text
                </button>
              </div>

              {/* Tab 1: File Dropzone */}
              {uploadTab === "file" && (
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center border-2 border-dashed border-default-300 dark:border-default-100/50 hover:border-primary/60 rounded-2xl p-8 cursor-pointer bg-default-50/50 dark:bg-default-50/10 transition-colors">
                    <ArrowUpTrayIcon className="w-8 h-8 text-primary mb-2" />
                    <span className="text-xs font-bold text-foreground">
                      {selectedFile ? selectedFile.name : "Click to select a file"}
                    </span>
                    <span className="text-[11px] text-default-400 mt-1">
                      Supports PDF, Word DOCX, Markdown (.md), and Text (.txt) up to 25MB
                    </span>
                    <input
                      type="file"
                      accept=".pdf,.docx,.txt,.md"
                      className="hidden"
                      onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                    />
                  </label>
                  {selectedFile && (
                    <div className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary">
                      <span className="truncate">{selectedFile.name}</span>
                      <span className="font-mono text-[10px]">
                        {(selectedFile.size / 1024).toFixed(1)} KB
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: URL Crawler */}
              {uploadTab === "url" && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-default-700 dark:text-default-300">
                    Web Page URL to Scrape
                  </label>
                  <input
                    type="url"
                    placeholder="https://example.com/documentation"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                  <p className="text-[11px] text-default-400">
                    The HTML content will be cleaned with Cheerio and indexed into semantic chunks.
                  </p>
                </div>
              )}

              {/* Tab 3: Paste Text */}
              {uploadTab === "text" && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-default-700 dark:text-default-300">
                      Document Title
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Company Policy v2"
                      value={pastedTitle}
                      onChange={(e) => setPastedTitle(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-default-700 dark:text-default-300">
                      Document Content (Markdown or Raw Text)
                    </label>
                    <textarea
                      rows={6}
                      placeholder="Paste your text or markdown here..."
                      value={pastedText}
                      onChange={(e) => setPastedText(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs rounded-xl border border-default-300/70 dark:border-default-100/40 bg-background focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                    />
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="justify-end gap-2 p-4 border-t border-default-200/60 dark:border-default-100/30">
              <Button
                variant="ghost"
                onPress={() => setIsUploadOpen(false)}
                isDisabled={uploading}
                className="text-xs rounded-xl"
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onPress={handleUpload}
                isDisabled={uploading}
                className="font-bold text-xs shadow-md shadow-primary/20 rounded-xl flex items-center gap-2"
              >
                {uploading ? (
                  <>
                    <ArrowPathIcon className="w-3.5 h-3.5 animate-spin" />
                    <span>Chunking & Embedding...</span>
                  </>
                ) : (
                  <span>Process & Index</span>
                )}
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}

      {/* 4. Chunk Inspector Modal */}
      {isChunksOpen && selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <Card className="w-full max-w-3xl border border-default-200/60 dark:border-white/10 shadow-2xl bg-background rounded-2xl overflow-hidden flex flex-col max-h-[85vh]">
            <CardHeader className="flex justify-between items-center p-4 sm:p-5 border-b border-default-200/60 dark:border-default-100/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                  <Squares2X2Icon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-bold truncate max-w-sm sm:max-w-md">
                    {selectedDoc.name} — Semantic Chunks
                  </h3>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[11px] text-default-400">
                      Total: <strong className="text-foreground">{docChunks.length} chunks</strong>
                    </span>
                    <span className="text-default-300">•</span>
                    <span className="text-[11px] font-mono text-primary">1024-dimension pgvector</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsChunksOpen(false)}
                className="text-default-400 hover:text-foreground p-1"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 overflow-y-auto space-y-3 flex-1">
              {loadingChunks ? (
                <div className="py-12 text-center text-xs text-default-400">
                  <ArrowPathIcon className="w-6 h-6 mx-auto mb-2 animate-spin text-primary" />
                  <span>Loading semantic chunks and vector metadata...</span>
                </div>
              ) : docChunks.length === 0 ? (
                <div className="py-12 text-center text-xs text-default-400">
                  No chunks generated for this document yet.
                </div>
              ) : (
                docChunks.map((chunk) => (
                  <div
                    key={chunk.id}
                    className="p-3.5 rounded-xl border border-default-200/60 dark:border-default-100/30 bg-default-100/30 dark:bg-default-50/10 space-y-2 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded font-mono font-bold text-[10px] bg-primary/15 text-primary">
                          Chunk #{chunk.index}
                        </span>
                        <span className="text-[11px] font-mono text-default-400">
                          {chunk.content.length} characters
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyChunkContent(chunk.content, chunk.id)}
                        className="text-[11px] text-default-400 hover:text-primary flex items-center gap-1 transition-colors"
                      >
                        {copiedChunkId === chunk.id ? (
                          <ClipboardDocumentCheckIcon className="w-3.5 h-3.5 text-success-500" />
                        ) : (
                          <ClipboardDocumentIcon className="w-3.5 h-3.5" />
                        )}
                        <span>{copiedChunkId === chunk.id ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    <div className="p-3 bg-default-900 text-default-100 rounded-lg font-mono text-xs overflow-x-auto leading-relaxed border border-default-800">
                      {chunk.content}
                    </div>
                  </div>
                ))
              )}
            </CardContent>

            <CardFooter className="justify-end p-4 border-t border-default-200/60 dark:border-default-100/30">
              <Button
                size="sm"
                variant="secondary"
                onPress={() => setIsChunksOpen(false)}
                className="text-xs rounded-xl"
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
