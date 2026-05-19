import {
   checkoutAttendance,
} from "@/services/attendance.service";

import { NextResponse } from "next/server";

export const POST = async (
   request: Request
) => {
   try {
      const body =
         await request.json();

      const {
         attendance_id,
         latitude,
         longitude,
         location_name,
      } = body;

      const attendance =
         await checkoutAttendance({
            attendance_id,
            latitude,
            longitude,
            location_name,
         });

      return NextResponse.json({
         success: true,
         data: attendance,
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
               "Gagal checkout attendance",
         },
         {
            status: 500,
         }
      );
   }
};