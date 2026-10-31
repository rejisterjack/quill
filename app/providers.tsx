"use client";

import type { ThemeProviderProps } from "next-themes";
import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { AuthProvider } from "@/lib/auth-context";
import posthog from "posthog-js";

export interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    if (key) {
      posthog.init(key, { api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com" });
    }
  }, []);

  return (
    <NextThemesProvider {...themeProps}>
      <SessionProvider>
        <AuthProvider>{children}</AuthProvider>
      </SessionProvider>
    </NextThemesProvider>
  );
}
