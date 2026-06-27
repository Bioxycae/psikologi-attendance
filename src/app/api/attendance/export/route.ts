import { apiResponse } from "@/lib/api-response";
import { createServerSupabase } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
   try {
      const { searchParams } = new URL(request.url);

      const startDate = searchParams.get("startDate");
      const endDate = searchParams.get("endDate");

      const supabase = createServerSupabase();

      let query = supabase.from("attendance").select("*");

      if (startDate && endDate) {
         query = query.gte("attendance_time", startDate).lte("attendance_time", endDate);
      }

      const { data, error } = await query.order("attendance_time", {
         ascending: false,
      });

      if (error) {
         return apiResponse({
            message: "Gagal mengambil data attendance",
            status: 500,
         });
      }

      const csvHeader = [
         "No",
         "Nama User",
         "Waktu Attendance",
         "Waktu Checkout",
         "Checkpoint Verified",
         "Checkout Verified",
         "Face Verified",
         "Liveness Verified",
         "Latitude",
         "Longitude",
         "Lokasi",
         "Status",
      ].join(",");

      const csvRows = (data || []).map((record, index) => {
         const formatDate = (date: string | null) => {
            if (!date) {
               return "-";
            }

            const d = new Date(date);

            return d.toLocaleString("id-ID", {
               timeZone: "Asia/Jakarta",
            });
         };

         const getSessionStatus = () => {
            if (record.checkout_time !== null && record.checkpoint_time !== null) {
               return "Completed";
            }
            if (record.checkout_time !== null && record.checkpoint_time === null) {
               return "Incomplete";
            }
            return "Missed Checkout";
         };

         return [
            index + 1,
            `"${record.user_name || ""}"`,
            formatDate(record.attendance_time),
            formatDate(record.checkout_time),
            record.checkpoint_time ? "Ya" : "Tidak",
            record.checkout_time ? "Ya" : "Tidak",
            record.face_verified ? "Ya" : "Tidak",
            record.liveness_verified ? "Ya" : "Tidak",
            record.latitude || "-",
            record.longitude || "-",
            `"${record.location_name || ""}"`,
            getSessionStatus(),
         ].join(",");
      });

      const csvContent = [csvHeader, ...csvRows].join("\n");

      return new Response(csvContent, {
         headers: {
            "Content-Type": "text/csv;charset=utf-8",
            "Content-Disposition": `attachment; filename="attendance_${Date.now()}.csv"`,
            "Cache-Control": "no-store, max-age=0, must-revalidate",
         },
      });
   } catch (error) {
      console.error(error);

      return apiResponse({
         message: "Gagal export attendance",
         status: 500,
      });
   }
}
