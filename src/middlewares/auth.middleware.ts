import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const authMiddleware = (
   request: NextRequest,
   isLoggedIn: boolean
) => {
   const pathname = request.nextUrl.pathname;
   const isAuthPage = pathname === "/login";

   if (!isLoggedIn && !isAuthPage) {
      const proto = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost";
      return NextResponse.redirect(
         new URL("/login", `${proto}://${host}`)
      );
   }

   return null;
};