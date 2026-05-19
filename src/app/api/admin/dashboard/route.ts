import { NextResponse } from "next/server";

import {
   getAdminDashboardOverview,
} from "@/services/attendance.service";

export const GET =
   async () => {
      try {
         const overview =
            await getAdminDashboardOverview();

         return NextResponse.json({
            success: true,
            data:
               overview,
         });
      } catch (
      error
      ) {
         console.error(
            error
         );

         return NextResponse.json(
            {
               success: false,
               message:
                  "Gagal mengambil admin dashboard",
            },
            {
               status: 500,
            }
         );
      }
   };
