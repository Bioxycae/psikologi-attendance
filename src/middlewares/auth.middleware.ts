import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const authMiddleware = (
   request: NextRequest,
   isLoggedIn: boolean
) => {
   const pathname = request.nextUrl.pathname;
   const isAuthPage = pathname === "/login" || pathname === "/api/login" || pathname === "/api/logout" || pathname === "/api/settings"; // allow settings for login page logo

   if (!isLoggedIn && !isAuthPage) {
      if (pathname.startsWith("/api/")) {
         return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
      }

      const proto = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost";
      return NextResponse.redirect(
         new URL("/login", `${proto}://${host}`)
      );
   }

   return null;
};