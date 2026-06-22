import type { ApiResponse } from "@/types/api.type";
import { NextResponse } from "next/server";

type ApiResponseProps<T> = ApiResponse<T> & {
   status?: number;
   success?: boolean;
};

export const apiResponse = <T>({
   data,
   message,
   hasMore,
   total,
   status = 200,
   success,
}: ApiResponseProps<T>) => {
   return NextResponse.json(
      {
         success: success !== undefined ? success : (status >= 200 && status < 300),
         message,
         data,
         hasMore,
         total,
      },
      {
         status,
         headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
         },
      }
   );
};