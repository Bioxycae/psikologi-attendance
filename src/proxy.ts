import { NextRequest, NextResponse } from "next/server";

import { authMiddleware } from "@/middlewares/auth.middleware";
import { loginMiddleware } from "@/middlewares/login.middleware";
import { roleMiddleware } from "@/middlewares/role.middleware";
import { verifySession } from "./lib/auth";

export async function proxy(request: NextRequest) {
   const response = NextResponse.next();

   const token =
      request.cookies.get("session")?.value;

   let session = null;
   if (token) {
      session = await verifySession(token);
   }

   const isLoggedIn =
      !!session;

   const role =
      session?.role;

   const authResponse = authMiddleware(request, isLoggedIn);

   if (authResponse) {
      return authResponse;
   }

   const loginResponse = loginMiddleware({
      request,
      isLoggedIn,
      role,
   });

   if (loginResponse) {
      return loginResponse;
   }

   const roleResponse = roleMiddleware({
      request,
      role,
   });

   if (roleResponse) {
      return roleResponse;
   }

   return response;
}

export const config = {
   matcher: [
      "/dashboard/:path*",
      "/history/:path*",
      "/validate/:path*",
      "/admin/:path*",
      "/login",
      "/api/:path*",
   ],
};