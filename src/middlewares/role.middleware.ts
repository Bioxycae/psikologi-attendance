import { UserRole } from "@/types/auth.type";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

type RoleMiddlewareProps = {
   request: NextRequest;
   role?: UserRole;
};

export const roleMiddleware = ({
   request,
   role,
}: RoleMiddlewareProps) => {
   const pathname = request.nextUrl.pathname;

   const isAdminRoute = pathname.startsWith("/admin");
   const isUserRoute =
      pathname.startsWith("/dashboard") ||
      pathname.startsWith("/history") ||
      pathname.startsWith("/validate");

   const proto = request.headers.get("x-forwarded-proto") || "http";
   const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "localhost";

   if (role === "admin" && isUserRoute) {
      return NextResponse.redirect(
         new URL("/admin/dashboard", `${proto}://${host}`)
      );
   }

   if (role === "user" && isAdminRoute) {
      return NextResponse.redirect(
         new URL("/dashboard", `${proto}://${host}`)
      );
   }

   return null;
};