import { UserRole } from "@/types/auth.type";
import { NextResponse } from "next/server";

import type {
   NextRequest,
} from "next/server";

type RoleMiddlewareProps = {
   request: NextRequest;
   role?: UserRole;
};

export const roleMiddleware = ({
   request,
   role,
}: RoleMiddlewareProps) => {
   const pathname =
      request.nextUrl.pathname;

   const isAdminRoute =
      pathname.startsWith("/admin");

   const isUserRoute =
      pathname.startsWith(
         "/dashboard"
      ) ||
      pathname.startsWith(
         "/history"
      ) ||
      pathname.startsWith(
         "/validate"
      );

   if (
      role === "admin" &&
      isUserRoute
   ) {
      return NextResponse.redirect(
         new URL(
            "/admin/dashboard",
            request.url
         )
      );
   }

   if (
      role === "user" &&
      isAdminRoute
   ) {
      return NextResponse.redirect(
         new URL(
            "/dashboard",
            request.url
         )
      );
   }

   return null;
};