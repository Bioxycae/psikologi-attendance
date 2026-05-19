import { NextResponse } from "next/server";

import { getAttendanceHistory } from "@/services/attendance.service";

export const GET =
   async (
      request: Request
   ) => {
      try {
         const {
            searchParams,
         } = new URL(
            request.url
         );

         const userId =
            searchParams.get(
               "user_id"
            );

         const limit =
            Number(
               searchParams.get(
                  "limit"
               ) || 8
            );

         const offset =
            Number(
               searchParams.get(
                  "offset"
               ) || 0
            );

         if (!userId) {
            return NextResponse.json(
               {
                  success: false,
                  message:
                     "User ID is required",
               },
               {
                  status: 400,
               }
            );
         }

         const history =
            await getAttendanceHistory(
               userId,
               limit,
               offset
            );

         return NextResponse.json({
            success: true,
            data: history.data,
            total:
               history.total,
            hasMore:
               history.hasMore,
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
                  "Gagal mengambil attendance history",
            },
            {
               status: 500,
            }
         );
      }
   };