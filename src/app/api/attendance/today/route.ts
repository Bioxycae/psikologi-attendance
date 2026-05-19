import { NextRequest, NextResponse } from "next/server";

import { getTodayAttendance } from "@/services/attendance.service";

export async function GET(
   request: NextRequest
) {
   try {
      const userId =
         request.nextUrl.searchParams.get(
            "user_id"
         );

      if (!userId) {
         return NextResponse.json(
            {
               success: false,
               message:
                  "User id required",
            },
            {
               status: 400,
            }
         );
      }

      const attendance =
         await getTodayAttendance(
            userId
         );

      return NextResponse.json({
         success: true,
         data: attendance,
      });
   } catch {
      return NextResponse.json(
         {
            success: false,
            message:
               "Failed load attendance",
         },
         {
            status: 500,
         }
      );
   }
}