/**
 * Next.js Middleware for route protection
 * Protects all routes except public paths
 * Injects tenant context for API routes
 */

import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

export default auth((req) => {
  const { nextUrl, auth: session } = req;
  const { pathname } = nextUrl;

  // Public paths that don't require authentication
  const publicPaths = ["/login", "/api/auth", "/api/health"];
  const isPublicPath = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`)
  );

  // Static files and assets
  const isStaticAsset =
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.endsWith(".ico") ||
    pathname.endsWith(".png") ||
    pathname.endsWith(".jpg") ||
    pathname.endsWith(".svg");

  // Allow public paths and static assets
  if (isPublicPath || isStaticAsset) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!session?.user) {
    // Redirect to login for browser requests
    if (!pathname.startsWith("/api/")) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Return 401 for API requests
    return NextResponse.json(
      { error: "Non authentifié" },
      { status: 401 }
    );
  }

  // Clone request headers to add tenant context
  const requestHeaders = new Headers(req.headers);
  
  // Inject tenant and user info for API routes
  if (session.user.tenantId) {
    requestHeaders.set("x-tenant-id", session.user.tenantId);
    requestHeaders.set("x-user-id", session.user.id);
    requestHeaders.set("x-user-role", session.user.role);
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
});

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
