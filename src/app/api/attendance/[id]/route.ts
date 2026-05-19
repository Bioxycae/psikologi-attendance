import { getAttendanceById } from "@/services/attendance.service";
import { NextResponse } from "next/server";

export const GET = async (
   request: Request,
   { params }: { params: Promise<{ id: string }> }
) => {
   try {
      const { id } = await params;
      const attendanceId = parseInt(id, 10);

      if (isNaN(attendanceId)) {
         return NextResponse.json(
            {
               success: false,
               message: "Invalid attendance ID",
            },
            {
               status: 400,
            }
         );
      }

      const attendance = await getAttendanceById(attendanceId);

      if (!attendance) {
         return NextResponse.json(
            {
               success: false,
               message: "Attendance session not found",
            },
            {
               status: 404,
            }
         );
      }

      return NextResponse.json({
         success: true,
         data: attendance,
      });
   } catch (error) {
      console.error(error);
      return NextResponse.json(
         {
            success: false,
            message: "Internal server error",
         },
         {
            status: 500,
         }
      );
   }
};
