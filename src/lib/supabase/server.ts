import { createClient } from "@supabase/supabase-js";

export const createServerSupabase =
   () => {
      return createClient(
         process.env
            .NEXT_PUBLIC_SUPABASE_URL!,
         process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,

         {
            auth: {
               persistSession: false,
               autoRefreshToken: false,
               detectSessionInUrl: false,
            },
            global: {
               fetch: (url, options) => {
                  return fetch(url, { ...options, cache: "no-store" });
               },
            },
         }
      );
   };