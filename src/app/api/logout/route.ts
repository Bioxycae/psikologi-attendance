import { SESSION_COOKIE } from "@/constants/auth.constant";
import { NextResponse } from "next/server";

export async function POST() {
   const response =
      NextResponse.json({
         success: true,
      });

   response.cookies.set(
      SESSION_COOKIE,
      "",
      {
         httpOnly: true,
         secure:
            process.env
               .NODE_ENV ===
            "production",
         sameSite: "lax",
         expires: new Date(0),
         path: "/",
      }
   );

   return response;
}