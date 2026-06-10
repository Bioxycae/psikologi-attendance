import { NextResponse } from "next/server";
import type { UserRole } from "@/types/auth.type";
import type { NextRequest } from "next/server";

type LoginMiddlewareProps = {
   request: NextRequest;
   isLoggedIn: boolean;
   role?: UserRole;
};

export const loginMiddleware = ({
   request,
   isLoggedIn,
   role,
}: LoginMiddlewareProps) => {
   const pathname = request.nextUrl.pathname;

   if (isLoggedIn && pathname === "/login") {
      const proto = request.headers.get("x-forwarded-proto") || "http";
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost";
      
      if (role === "admin") {
         return NextResponse.redirect(
            new URL("/admin/dashboard", `${proto}://${host}`)
         );
      }

      return NextResponse.redirect(
         new URL("/dashboard", `${proto}://${host}`)
      );
   }

   return null;
};