import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "rag_session";
const secretKey =
  process.env.AUTH_SECRET ||
  process.env.NEXTAUTH_SECRET ||
  "super-secret-rag-starter-kit-key-1234";
const JWT_SECRET = new TextEncoder().encode(secretKey);

interface UserSessionPayload {
  id: string;
  email: string;
  role: "USER" | "ADMIN";
  name?: string;
  activeWorkspaceId?: string;
}

async function verifyToken(token: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return {
      id: payload.id as string,
      email: payload.email as string,
      role: (payload.role as "USER" | "ADMIN") || "USER",
      name: payload.name as string | undefined,
      activeWorkspaceId: payload.activeWorkspaceId as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // 1. Skip static assets, Next.js internal files, and public auth endpoints
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/auth/login") ||
    pathname.startsWith("/api/auth/register") ||
    pathname.startsWith("/api/auth/logout") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(png|jpg|jpeg|svg|gif|webp|ico|css|js|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  const user = token ? await verifyToken(token) : null;

  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin");
  const isChatRoute = pathname.startsWith("/chat");
  const isProtectedApiRoute =
    pathname.startsWith("/api/documents") ||
    pathname.startsWith("/api/chats") ||
    pathname === "/api/chat";
  const isAuthRoute = pathname === "/login" || pathname === "/register";

  // CASE 1: Unauthenticated request to protected routes
  if (!user) {
    // If accessing protected API, return 401 Unauthorized JSON immediately
    if (pathname.startsWith("/api/")) {
      if (isAdminRoute || isProtectedApiRoute) {
        return NextResponse.json(
          { error: "Unauthorized: Please sign in to access this resource." },
          { status: 401 }
        );
      }
      return NextResponse.next();
    }

    // If accessing protected Page route (/admin, /chat), redirect to /login with return target
    if (isAdminRoute || isChatRoute) {
      const redirectTarget = pathname + (search || "");
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", redirectTarget);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // CASE 2: Authenticated user attempting to access Admin-only routes
  if (isAdminRoute && user.role !== "ADMIN") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "Forbidden: Administrator privileges required." },
        { status: 403 }
      );
    }
    // For admin UI page routes, redirect non-admin users to chat with error query
    const chatUrl = new URL("/chat", request.url);
    chatUrl.searchParams.set("error", "admin_required");
    return NextResponse.redirect(chatUrl);
  }

  // CASE 3: Authenticated user visiting /login or /register -> redirect to target or home
  if (isAuthRoute) {
    const redirectUrl = request.nextUrl.searchParams.get("redirect");
    if (redirectUrl && redirectUrl.startsWith("/")) {
      // Don't redirect non-admin to admin route
      if (redirectUrl.startsWith("/admin") && user.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/chat", request.url));
      }
      return NextResponse.redirect(new URL(redirectUrl, request.url));
    }
    return NextResponse.redirect(
      new URL(user.role === "ADMIN" ? "/admin" : "/chat", request.url)
    );
  }

  // Inject verified user metadata into headers for downstream consumers
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-user-id", user.id);
  requestHeaders.set("x-user-role", user.role);
  requestHeaders.set("x-user-email", user.email);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export default proxy;

export const config = {
  matcher: [
    "/admin/:path*",
    "/chat/:path*",
    "/api/admin/:path*",
    "/api/documents/:path*",
    "/api/chats/:path*",
    "/api/chat",
    "/login",
    "/register",
  ],
};
