import { SESSION_COOKIE } from "@/constants/auth.constant";
import { createServerSupabase } from "@/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
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