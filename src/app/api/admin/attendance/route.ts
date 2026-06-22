import { apiResponse } from "@/lib/api-response";
import { createServerSupabase } from "@/lib/supabase/server";
import { getAttendanceHistory } from "@/services/attendance.service";
import { z } from "zod";

const updateSchema = z.object({
   status: z.string(),
   checkpoint_verified: z.boolean(),
   checkout_verified: z.boolean(),
   attendance_time: z.string(),
   checkpoint_time: z.string().nullable().optional(),
   checkout_time: z.string().nullable().optional(),
});

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url);
      const userId = searchParams.get("userId");
      const limitStr = searchParams.get("limit");
      const offsetStr = searchParams.get("offset");

      if (!userId) {
         return apiResponse({ message: "User ID is required", status: 400 });
      }

      const limit = limitStr ? parseInt(limitStr, 10) : 8;
      const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

      const result = await getAttendanceHistory(userId, limit, offset);

      return apiResponse({
         data: result.data,
         hasMore: result.hasMore,
         total: result.total,
      });
   } catch (error: any) {
      console.error(error);
      return apiResponse({
         message: "Gagal mengambil riwayat absen",
         status: 500,
      });
   }
}

export async function PUT(request: Request) {
   try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
         return apiResponse({ message: "ID is required", status: 400 });
      }

      const body = await request.json();
      const parsed = updateSchema.safeParse(body);

      if (!parsed.success) {
         return apiResponse({
            message: "Data tidak valid",
            status: 400,
         });
      }

      const supabase = createServerSupabase();

      const { data, error } = await supabase
         .from("attendance")
         .update({
            ...parsed.data,
            updated_at: new Date().toISOString(),
         })
         .eq("id", id)
         .select()
         .single();

      if (error) {
         throw new Error(error.message);
      }

      return apiResponse({
         message: "Data absen berhasil diperbarui",
         data,
      });
   } catch (error: any) {
      console.error(error);
      return apiResponse({
         message: "Gagal memperbarui data absen",
         status: 500,
      });
   }
}

export async function DELETE(request: Request) {
   try {
      const { searchParams } = new URL(request.url);
      const id = searchParams.get("id");

      if (!id) {
         return apiResponse({ message: "ID is required", status: 400 });
      }

      const supabase = createServerSupabase();

      const { error } = await supabase
         .from("attendance")
         .delete()
         .eq("id", id);

      if (error) {
         throw new Error(error.message);
      }

      return apiResponse({
         message: "Data absen berhasil dihapus",
      });
   } catch (error: any) {
      console.error(error);
      return apiResponse({
         message: "Gagal menghapus data absen",
         status: 500,
      });
   }
}
