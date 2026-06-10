import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export const GET = async () => {
   try {
      const session = await getSession();

      if (!session) {
         return NextResponse.json(
            {
               success: false,
               message: "Unauthorized",
            },
            {
               status: 401,
               headers: {
                  "Cache-Control": "no-store, max-age=0, must-revalidate",
               },
            }
         );
      }

      return NextResponse.json(
         {
            success: true,
            data: {
               id: session.id,
               name: session.name,
               email: session.email,
               role: session.role,
            },
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
            message: "Internal server error",
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