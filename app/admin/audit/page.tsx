"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  Chip,
  Button,
} from "@heroui/react";
import {
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  InformationCircleIcon,
  ExclamationTriangleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

interface AuditLogItem {
  id: string;
  event: string;
  severity: "INFO" | "WARNING" | "ERROR" | "CRITICAL";
  ipAddress?: string;
  createdAt: string;
  user?: {
    email: string;
    name?: string;
  };
}

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");

  useEffect(() => {
    async function loadLogs() {
      try {
        const res = await fetch("/api/admin/audit");
        if (res.ok) {
          const data = await res.json();
          setLogs(data.logs || []);
        }
      } catch (err) {
        console.error("Failed to load audit logs:", err);
      } finally {
        setLoading(false);
      }
    }
    loadLogs();
  }, []);

  const filteredLogs = logs.filter((l) => {
    const matchesSearch =
      l.event.toLowerCase().includes(search.toLowerCase()) ||
      (l.user?.email && l.user.email.toLowerCase().includes(search.toLowerCase()));
    const matchesSeverity =
      severityFilter === "ALL" || l.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              <ShieldCheckIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Security & Audit Logs
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-default-500 mt-1">
            Tamper-evident activity trail of logins, document modifications, and chat operations.
          </p>
        </div>

        <Chip size="sm" variant="soft" color="accent" className="font-mono text-xs">
          {filteredLogs.length} Events Logged
        </Chip>
      </div>

      <Card className="border border-default-200/60 dark:border-white/10 bg-default-50/70 dark:bg-default-50/20 backdrop-blur-xl rounded-2xl shadow-xl p-4 sm:p-5 space-y-4">
        {/* Search & Severity Filters */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="w-full sm:max-w-sm relative">
            <MagnifyingGlassIcon className="w-4 h-4 absolute left-3 top-2.5 text-default-400" />
            <input
              type="text"
              placeholder="Search by event or user email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-default-200/70 dark:border-default-100/30 bg-background/80 focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex items-center gap-1.5">
            {["ALL", "INFO", "WARNING", "ERROR"].map((sev) => (
              <button
                key={sev}
                type="button"
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  severityFilter === sev
                    ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                    : "text-default-500 hover:text-foreground bg-default-100/50 dark:bg-default-50/20"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead>
              <tr className="border-b border-default-200/60 dark:border-default-100/30 text-[11px] font-semibold text-default-400 uppercase tracking-wider">
                <th className="py-3 px-3">EVENT</th>
                <th className="py-3 px-3">USER / ACTOR</th>
                <th className="py-3 px-3">SEVERITY</th>
                <th className="py-3 px-3">IP ADDRESS</th>
                <th className="py-3 px-3 text-right">TIMESTAMP</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-default-100 dark:divide-default-200/20">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-default-400">
                    <ArrowPathIcon className="w-5 h-5 mx-auto mb-2 animate-spin text-primary" />
                    <span>Loading tamper-evident security audit logs...</span>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-xs text-default-400">
                    No matching audit log entries found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-default-100/50 dark:hover:bg-default-50/20 transition-colors"
                  >
                    <td className="py-3 px-3">
                      <span className="font-mono text-xs font-semibold text-primary px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20">
                        {log.event}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {(log.user?.email || "SYS").substring(0, 2).toUpperCase()}
                        </div>
                        <span className="text-xs text-foreground truncate max-w-[150px]">
                          {log.user?.email || "System Daemon"}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <Chip
                        size="sm"
                        variant="soft"
                        color={
                          log.severity === "INFO"
                            ? "accent"
                            : log.severity === "WARNING"
                            ? "warning"
                            : "danger"
                        }
                        className="text-[10px] font-bold"
                      >
                        {log.severity === "INFO" && (
                          <InformationCircleIcon className="w-3 h-3 inline mr-1" />
                        )}
                        {log.severity === "WARNING" && (
                          <ExclamationTriangleIcon className="w-3 h-3 inline mr-1" />
                        )}
                        {(log.severity === "ERROR" || log.severity === "CRITICAL") && (
                          <ExclamationCircleIcon className="w-3 h-3 inline mr-1" />
                        )}
                        {log.severity}
                      </Chip>
                    </td>
                    <td className="py-3 px-3 font-mono text-xs text-default-400">
                      {log.ipAddress || "127.0.0.1"}
                    </td>
                    <td className="py-3 px-3 text-xs text-default-400 text-right">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
