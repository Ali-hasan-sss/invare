/**
 * Middleware for Admin Panel Protection
 *
 * This middleware protects admin routes by checking authentication
 * and admin role from localStorage (via cookies for SSR).
 *
 * To activate: Rename this file to middleware.ts
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith("/admin")) {
    // Get user data from cookies (set by client-side)
    const userCookie = request.cookies.get("user");
    const accessToken = request.cookies.get("accessToken");

    // Check if user is authenticated
    if (!accessToken) {
      // Redirect to login page if not authenticated
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }

    // Check if user has admin role
    if (userCookie) {
      try {
        const userData = JSON.parse(userCookie.value);

        // Check if user is admin
        if (!userData.isAdmin) {
          // Redirect to home page if not admin
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch (error) {
        // If parsing fails, redirect to login
        return NextResponse.redirect(new URL("/auth/login", request.url));
      }
    } else {
      // If no user cookie, redirect to login
      return NextResponse.redirect(new URL("/auth/login", request.url));
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    "/admin/:path*",
    // Add other protected routes here
  ],
};
