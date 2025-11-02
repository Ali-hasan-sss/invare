import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Check if the path starts with /admin
  if (path.startsWith("/admin")) {
    // Get user data and token from cookies
    const accessToken = request.cookies.get("accessToken")?.value;
    const userCookie = request.cookies.get("user")?.value;

    // Check if user is authenticated (has token)
    if (!accessToken) {
      // Redirect to login page if not authenticated
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }

    // Check if user has admin role
    if (userCookie) {
      try {
        // Decode URI component if it's encoded
        const decodedCookie = decodeURIComponent(userCookie);
        const userData = JSON.parse(decodedCookie);

        // Strictly check if user is admin (must be exactly true boolean)
        // Explicitly check for false, undefined, null, or any other value
        const isAdmin = userData.isAdmin === true;

        // If isAdmin is not explicitly true, deny access
        if (isAdmin !== true) {
          // Redirect to home page if not admin
          console.log("Access denied - User is not admin:", {
            userId: userData.id,
            email: userData.email,
            isAdmin: userData.isAdmin,
            isAdminType: typeof userData.isAdmin,
          });
          return NextResponse.redirect(new URL("/", request.url));
        }
      } catch (error) {
        // If parsing fails, redirect to login
        console.error("Error parsing user cookie in middleware:", error);
        const loginUrl = new URL("/auth/login", request.url);
        loginUrl.searchParams.set("redirect", path);
        return NextResponse.redirect(loginUrl);
      }
    } else {
      // If no user cookie, redirect to login
      const loginUrl = new URL("/auth/login", request.url);
      loginUrl.searchParams.set("redirect", path);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

// Configure which paths the middleware should run on
export const config = {
  matcher: ["/admin/:path*"],
};
