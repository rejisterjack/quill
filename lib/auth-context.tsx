"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: "USER" | "ADMIN";
  image?: string | null;
  activeWorkspaceId?: string | null;
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  role: "OWNER" | "ADMIN" | "MEMBER" | "VIEWER";
}

interface AuthContextType {
  user: User | null;
  workspaces: Workspace[];
  activeWorkspace: Workspace | null;
  loading: boolean;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
  switchWorkspace: (workspaceId: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  workspaces: [],
  activeWorkspace: null,
  loading: true,
  refresh: async () => {},
  logout: async () => {},
  switchWorkspace: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setWorkspaces(data.workspaces || []);
      } else {
        setUser(null);
        setWorkspaces([]);
      }
    } catch {
      setUser(null);
      setWorkspaces([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const logout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      setUser(null);
      setWorkspaces([]);
      window.location.href = "/login";
    }
  }, []);

  const switchWorkspace = useCallback(async (workspaceId: string) => {
    await fetch(`/api/workspaces/${workspaceId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ switch: true }),
    });
    await refresh();
  }, [refresh]);

  const activeWorkspace =
    workspaces.find((w) => w.id === user?.activeWorkspaceId) || workspaces[0] || null;

  return (
    <AuthContext.Provider
      value={{
        user,
        workspaces,
        activeWorkspace,
        loading,
        refresh,
        logout,
        switchWorkspace,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
