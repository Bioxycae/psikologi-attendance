import { apiResponse } from "@/lib/api-response";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const supabase = createServerSupabase();

      const { data, error } = await supabase
         .from("users")
         .select(`
            id,
            name,
            image_url,
            face_embedding
         `)
         .not("face_embedding", "is", null);

      if (error) {
         return apiResponse({
            message: error.message,
            status: 500,
         });
      }

      return apiResponse({
         data,
      });
   } catch {
      return apiResponse({
         message: "Gagal mengambil data wajah",
         status: 500,
      });
   }
}