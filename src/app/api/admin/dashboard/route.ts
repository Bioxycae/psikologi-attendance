import { apiResponse } from "@/lib/api-response";
import { getSession } from "@/lib/auth";
import { NextResponse } from "next/server";
import { getAdminDashboardOverview } from "@/services/attendance.service";

export const dynamic = "force-dynamic";

export const GET = async () => {
   try {
      const session = await getSession();

      if (!session || session.role !== "admin") {
         return apiResponse({
            message: "Unauthorized",
            status: 401,
         });
      }

      const overview = await getAdminDashboardOverview();

      return NextResponse.json(
         {
            success: true,
            data: overview,
         },
         {
            status: 200,
            headers: {
               "Cache-Control": "no-store, max-age=0, must-revalidate",
            },
         }
      );
   } catch (error) {
      console.error(error);

      return NextResponse.json(
         {
            success: false,
            message: "Gagal mengambil admin dashboard",
         },
         {
            status: 500,
            headers: {
               "Cache-Control": "no-store, max-age=0, must-revalidate",
            },
         }
      );
   }
};
