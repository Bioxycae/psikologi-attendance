import { getSession } from "@/lib/auth";
import { apiResponse } from "@/lib/api-response";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
   const session = await getSession();

   if (!session || session.role !== "admin") {
      return apiResponse({
         message: "Unauthorized",
         status: 401,
      });
   }

   const supabase = createServerSupabase();

   const { data, error } = await supabase
      .from("user_sessions")
      .select(`
         id,
         user_id,
         ip_address,
         device_info,
         created_at,
         last_active,
         users (
            name,
            email,
            image_url
         )
      `)
      .order("created_at", { ascending: false });

   if (error) {
      return apiResponse({
         message: "Gagal mengambil data sesi",
         status: 500,
      });
   }

   return apiResponse({
      data,
   });
}

export async function DELETE(request: Request) {
   const session = await getSession();

   if (!session || session.role !== "admin") {
      return apiResponse({
         message: "Unauthorized",
         status: 401,
      });
   }

   const { searchParams } = new URL(request.url);
   const id = searchParams.get("id");

   if (!id) {
      return apiResponse({
         message: "ID sesi tidak ditemukan",
         status: 400,
      });
   }

   const supabase = createServerSupabase();

   const { error } = await supabase
      .from("user_sessions")
      .delete()
      .eq("id", id);

   if (error) {
      return apiResponse({
         message: "Gagal menghapus sesi",
         status: 500,
      });
   }

   return apiResponse({
      message: "Sesi berhasil dihapus",
   });
}
