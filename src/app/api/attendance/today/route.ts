import { NextRequest, NextResponse } from "next/server";
import { getTodayAttendance } from "@/services/attendance.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
   try {
      const userId = request.nextUrl.searchParams.get("user_id");

      if (!userId) {
         return NextResponse.json(
            {
               success: false,
               message: "User id required",
            },
            {
               status: 400,
               headers: {
                  "Cache-Control": "no-store, max-age=0, must-revalidate",
               },
            }
         );
      }

      const attendance = await getTodayAttendance(userId);

      return NextResponse.json(
         {
            success: true,
            data: attendance,
         },
         {
            status: 200,
            headers: {
               "Cache-Control": "no-store, max-age=0, must-revalidate",
            },
         }
      );
   } catch {
      return NextResponse.json(
         {
            success: false,
            message: "Failed load attendance",
         },
         {
            status: 500,
            headers: {
               "Cache-Control": "no-store, max-age=0, must-revalidate",
            },
         }
      );
   }
}