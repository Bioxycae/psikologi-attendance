import {
   createAttendance,
   getTodayAttendance,
} from "@/services/attendance.service";

import { getAppSettings } from "@/services/settings.service";

import { NextResponse } from "next/server";

export const POST = async (
   request: Request
) => {
   try {
      const body =
         await request.json();

      const {
         user_id,
         user_name,
         latitude,
         longitude,
         location_name,
         face_verified,
         liveness_verified,
      } = body;

      const settings =
         await getAppSettings();

      const now = new Date();

      const formatter = new Intl.DateTimeFormat("en-US", {
         timeZone: "Asia/Jakarta",
         hour: "numeric",
         minute: "numeric",
         hour12: false
      });
      const parts = formatter.formatToParts(now);
      const currentHour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
      const currentMinute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

      const attendanceHour =
         settings?.attendance_time_hour ?? 7;

      const attendanceMinute =
         settings?.attendance_time_minute ?? 30;

      const checkoutHour =
         settings?.checkout_time_hour ?? 16;

      const checkoutMinute =
         settings?.checkout_time_minute ?? 30;

      const currentTotalMinutes =
         currentHour * 60 + currentMinute;

      const attendanceTotalMinutes =
         attendanceHour * 60 + attendanceMinute;

      const checkoutTotalMinutes =
         checkoutHour * 60 + checkoutMinute;

      if (
         currentTotalMinutes < attendanceTotalMinutes ||
         currentTotalMinutes > checkoutTotalMinutes
      ) {
         return NextResponse.json(
            {
               success: false,
               message: `Attendance is only allowed between ${String(attendanceHour).padStart(2, "0")}:${String(attendanceMinute).padStart(2, "0")} - ${String(checkoutHour).padStart(2, "0")}:${String(checkoutMinute).padStart(2, "0")}`,
            },
            {
               status: 400,
            }
         );
      }

      const todayAttendance =
         await getTodayAttendance(
            user_id
         );

      if (todayAttendance) {
         return NextResponse.json(
            {
               success: false,
               message:
                  "Already checked in for today",
            },
            {
               status: 400,
            }
         );
      }

      const attendance =
         await createAttendance({
            user_id,
            user_name,
            latitude,
            longitude,
            location_name,
            face_verified,
            liveness_verified,
         });

      return NextResponse.json({
         success: true,
         data: attendance,
      });
   } catch (error) {
      console.error(error);

      return NextResponse.json(
         {
            success: false,
            message:
               "Failed to create attendance",
         },
         {
            status: 500,
         }
      );
   }
};