import z from "zod";

import { USER_ROLE } from "@/constants/auth.constant";

export const createUserSchema =
   z.object({
      name: z
         .string()
         .min(
            1,
            "Nama wajib diisi"
         ),

      email: z.email(
         "Email tidak valid"
      ),

      password: z
         .string()
         .min(
            6,
            "Password minimal 6 karakter"
         ),

      role: z.enum([
         USER_ROLE.ADMIN,
         USER_ROLE.USER,
      ]),

      image: z
         .instanceof(File)
         .nullable()
         .optional(),

      face_embedding: z
         .string()
         .nullable()
         .optional(),
   });

export const updateUserSchema =
   z.object({
      name: z
         .string()
         .min(
            1,
            "Nama wajib diisi"
         ),

      email: z.email(
         "Email tidak valid"
      ),

      password: z
         .string()
         .min(
            6,
            "Password minimal 6 karakter"
         )
         .optional()
         .or(z.literal("")),

      role: z.enum([
         USER_ROLE.ADMIN,
         USER_ROLE.USER,
      ]),

      image: z
         .instanceof(File)
         .nullable()
         .optional(),

      face_embedding: z
         .string()
         .nullable()
         .optional(),
   });

export type CreateUserSchema =
   z.infer<
      typeof createUserSchema
   >;

export type UpdateUserSchema =
   z.infer<
      typeof updateUserSchema
   >;