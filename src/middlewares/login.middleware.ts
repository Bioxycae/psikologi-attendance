import { NextResponse } from "next/server";
import type { UserRole } from "@/types/auth.type";

import type {
   NextRequest,
} from "next/server";

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
   const pathname =
      request.nextUrl.pathname;

   if (
      isLoggedIn &&
      pathname === "/login"
   ) {
      if (role === "admin") {
         return NextResponse.redirect(
            new URL(
               "/admin/dashboard",
               request.url
            )
         );
      }

      return NextResponse.redirect(
         new URL(
            "/dashboard",
            request.url
         )
      );
   }

   return null;
};