import { SESSION_COOKIE } from "@/constants/auth.constant";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
   const cookieStore = await cookies();
   const token = cookieStore.get(SESSION_COOKIE)?.value;

   if (token) {
      const supabase = createServerSupabase();
      await supabase.from("user_sessions").delete().eq("token", token);
   }

   const response =
      NextResponse.json({
         success: true,
      });

   const isHttps =
      request.url.startsWith("https://") ||
      request.headers.get("x-forwarded-proto") === "https";

   response.cookies.set(
      SESSION_COOKIE,
      "",
      {
         httpOnly: true,
         secure: isHttps,
         sameSite: "lax",
         expires: new Date(0),
         path: "/",
      }
   );

   return response;
}