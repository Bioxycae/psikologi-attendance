
import { SESSION_COOKIE, SESSION_DURATION } from "@/constants/auth.constant";
import { apiResponse } from "@/lib/api-response";
import { comparePassword, createSession } from "@/lib/auth";
import { createServerSupabase } from "@/lib/supabase/server";
import { loginSchema } from "@/schemas/auth.schema";

export async function POST(request: Request) {

   try {
      const body =
         await request.json();

      const validatedFields =
         loginSchema.safeParse(body);

      if (!validatedFields.success) {
         return apiResponse({
            message:
               validatedFields
                  .error
                  .issues[0]
                  ?.message ||
               "Data login tidak valid",

            status: 400,
         });
      }

      const {
         email,
         password,
      } = validatedFields.data;

      const supabase =
         createServerSupabase();

      const { data: user, error } =
         await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single();

      if (error || !user) {
         return apiResponse({
            message:
               "Email atau password salah",

            status: 401,
         });
      }

      const isValidPassword =
         await comparePassword(
            password,
            user.password
         );

      if (!isValidPassword) {
         return apiResponse({
            message:
               "Email atau password salah",

            status: 401,
         });
      }

      const token =
         await createSession({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
         });

      const ipAddress = (request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()) || request.headers.get("x-real-ip") || "127.0.0.1";
      const userAgent = request.headers.get("user-agent") || "Unknown Device";

      await supabase
         .from("user_sessions")
         .delete()
         .eq("user_id", user.id)
         .eq("device_info", userAgent);

      const { error: sessionError } = await supabase
         .from("user_sessions")
         .insert({
            user_id: user.id,
            token: token,
            ip_address: ipAddress,
            device_info: userAgent,
         });

      if (sessionError) {
         return apiResponse({
            message: "Gagal membuat sesi di server",
            status: 500,
         });
      }

      const response =
         apiResponse({
            data: {
               role: user.role,
            },
         });

      const isHttps =
         request.url.startsWith("https://") ||
         request.headers.get("x-forwarded-proto") === "https";

      response.cookies.set(
         SESSION_COOKIE,
         token,
         {
            httpOnly: true,
            secure: isHttps,
            sameSite: "lax",
            path: "/",
            maxAge:
               SESSION_DURATION,
         }
      );

      return response;
   } catch {
      return apiResponse({
         message:
            "Terjadi kesalahan server",

         status: 500,
      });
   }
}