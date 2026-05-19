import type { ApiResponse } from "@/types/api.type";
import { NextResponse } from "next/server";


type ApiResponseProps<T> =
   ApiResponse<T> & {
      status?: number;
   };

export const apiResponse = <T>({
   data,
   message,
   hasMore,
   status = 200,
}: ApiResponseProps<T>) => {
   return NextResponse.json(
      {
         success:
            status >= 200 &&
            status < 300,

         message,
         data,
         hasMore,
      },
      {
         status,
      }
   );
};