import { apiResponse } from "@/lib/api-response";

import {
   deleteUser,
   updateUser,
} from "@/services/user.service";

import {
   updateUserSchema,
} from "@/schemas/user.schema";
import { getSession } from "@/lib/auth";

type Params = {
   params: Promise<{
      id: string;
   }>;
};

export async function PUT(
   request: Request,
   { params }: Params
) {
   try {
      const session = await getSession();

      if (!session || session.role !== "admin") {
         return apiResponse({
            message: "Unauthorized",
            status: 401,
         });
      }

      const { id } =
         await params;

      const formData =
         await request.formData();

      const image =
         formData.get(
            "image"
         ) as File | null;

      const validatedFields =
         updateUserSchema.safeParse({
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
               ) || "",

            role:
               formData.get(
                  "role"
               ),

            image,

            face_embedding:
               formData.get(
                  "face_embedding"
               ),
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
         await updateUser({
            id,
            ...validatedFields.data,
         });

      return apiResponse({
         message:
            "User berhasil diupdate",

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
            "Gagal mengupdate user",

         status: 500,
      });
   }
}

export async function DELETE(
   request: Request,
   { params }: Params
) {
   try {
      const session = await getSession();

      if (!session || session.role !== "admin") {
         return apiResponse({
            message: "Unauthorized",
            status: 401,
         });
      }

      const { id } =
         await params;

      await deleteUser(id);

      return apiResponse({
         message:
            "User berhasil dihapus",
      });
   } catch (
      error
   ) {
      console.error(
         error
      );

      return apiResponse({
         message:
            "Gagal menghapus user",

         status: 500,
      });
   }
}