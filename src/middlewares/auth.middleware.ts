import { NextResponse } from "next/server";

import type {
   NextRequest,
} from "next/server";

export const authMiddleware = (
   request: NextRequest,
   isLoggedIn: boolean
) => {
   const pathname =
      request.nextUrl.pathname;

   const isAuthPage =
      pathname === "/login";

   if (
      !isLoggedIn &&
      !isAuthPage
   ) {
      return NextResponse.redirect(
         new URL(
            "/login",
            request.url
         )
      );
   }

   return null;
};