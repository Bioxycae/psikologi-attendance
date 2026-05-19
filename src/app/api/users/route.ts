import { apiResponse } from "@/lib/api-response";

import { createUser, getUsers } from "@/services/user.service";

import {
   createUserSchema,
} from "@/schemas/user.schema";

export async function GET(
   request: Request
) {
   try {
      const {
         searchParams,
      } = new URL(
         request.url
      );

      const limit =
         Number(
            searchParams.get(
               "limit"
            ) || 6
         );

      const offset =
         Number(
            searchParams.get(
               "offset"
            ) || 0
         );

      const {
         data,
         count,
      } = await getUsers(
         limit,
         offset
      );

      const hasMore =
         offset + limit < count;

      return apiResponse({
         data,
         hasMore,
      });
   } catch {
      return apiResponse({
         message:
            "Gagal mengambil data user",

         status: 500,
      });
   }
}

export async function POST(
   request: Request
) {
   try {
      const formData =
         await request.formData();

      const image =
         formData.get(
            "image"
         ) as File | null;

      const validatedFields =
         createUserSchema.safeParse({
            name:
               formData.get(
                  "name"
               ),

            email:
               formData.get(
                  "email"
               ),

            password:
               formData.get(
                  "password"
               ),

            role:
               formData.get(
                  "role"
               ),

            image,
         });

      if (
         !validatedFields.success
      ) {
         return apiResponse({
            message:
               validatedFields
                  .error
                  .issues[0]
                  ?.message ||
               "Data tidak valid",

            status: 400,
         });
      }

      const user =
         await createUser(
            validatedFields.data
         );

      return apiResponse({
         message:
            "User berhasil dibuat",

         data: user,
      });
   } catch (
      error
   ) {
      console.error(
         error
      );

      return apiResponse({
         message:
            "Gagal membuat user",

         status: 500,
      });
   }
}