import { NextResponse } from "next/server";

import { getSession } from "@/lib/auth";

export const GET =
   async () => {
      try {
         const session =
            await getSession();

         if (!session) {
            return NextResponse.json(
               {
                  success: false,
                  message:
                     "Unauthorized",
               },
               {
                  status: 401,
               }
            );
         }

         return NextResponse.json({
            success: true,

            data: {
               id: session.id,
               name:
                  session.name,
               email:
                  session.email,
               role:
                  session.role,
            },
         });
      } catch {
         return NextResponse.json(
            {
               success: false,
               message:
                  "Internal server error",
            },
            {
               status: 500,
            }
         );
      }
   };