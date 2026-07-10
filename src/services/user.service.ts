import bcrypt from "bcryptjs";

import { createServerSupabase } from "@/lib/supabase/server";

import {
   deleteImage,
   uploadImage,
} from "@/lib/upload";

import type {
   CreateUserSchema,
   UpdateUserSchema,
} from "@/schemas/user.schema";

import type {
   User,
} from "@/types/database.type";

export const getUsers =
   async (
      limit: number = 6,
      offset: number = 0
   ): Promise<{
      data: User[];
      count: number;
   }> => {
      const supabase =
         createServerSupabase();

      const {
         data,
         error,
         count,
      } = await supabase
         .from("users")
         .select("*", { count: "exact" })
         .order(
            "created_at",
            {
               ascending:
                  false,
            }
         )
         .range(offset, offset + limit - 1);

      if (error) {
         throw new Error(
            error.message
         );
      }

      return {
         data,
         count: count || 0,
      };
   };

export const createUser =
   async ({
      name,
      email,
      password,
      role,
      image,
      face_embedding,
   }: CreateUserSchema): Promise<User> => {
      const supabase =
         createServerSupabase();

      const hashedPassword =
         await bcrypt.hash(
            password,
            12
         );

      let imageUrl:
         | string
         | null = null;

      let imagePublicId:
         | string
         | null = null;

      if (image) {
         const uploadedImage =
            await uploadImage(
               image
            );

         imageUrl =
            uploadedImage.secure_url;

         imagePublicId =
            uploadedImage.public_id;
      }

      const {
         data,
         error,
      } = await supabase
         .from("users")
         .insert({
            name,
            email,
            password:
               hashedPassword,
            role,
            image_url:
               imageUrl,
            image_public_id:
               imagePublicId,
            face_embedding:
               face_embedding ? face_embedding : null,
         })
         .select()
         .single();

      if (error) {
         throw new Error(
            error.message
         );
      }

      return data;
   };

export const updateUser =
   async ({
      id,
      name,
      email,
      password,
      role,
      image,
      face_embedding,
   }: UpdateUserSchema & {
      id: string;
   }): Promise<User> => {
      const supabase =
         createServerSupabase();

      const {
         data: existingUser,
      } = await supabase
         .from("users")
         .select("*")
         .eq("id", id)
         .single();

      let imageUrl =
         existingUser.image_url;

      let imagePublicId =
         existingUser.image_public_id;

      if (image) {
         if (
            existingUser.image_public_id
         ) {
            await deleteImage(
               existingUser.image_public_id
            );
         }

         const uploadedImage =
            await uploadImage(
               image
            );

         imageUrl =
            uploadedImage.secure_url;

         imagePublicId =
            uploadedImage.public_id;
      }

      const updatePayload: any = {
         name,
         email,
         role,
         image_url:
            imageUrl,
         image_public_id:
            imagePublicId,
      };

      if (face_embedding) {
         updatePayload.face_embedding = face_embedding;
      }

      if (password && password.trim() !== "") {
         updatePayload.password = await bcrypt.hash(password, 12);
      }

      const {
         data,
         error,
      } = await supabase
         .from("users")
         .update(updatePayload)
         .eq("id", id)
         .select()
         .single();

      if (error) {
         throw new Error(
            error.message
         );
      }

      return data;
   };

export const deleteUser =
   async (
      id: string
   ) => {
      const supabase =
         createServerSupabase();

      const {
         data: existingUser,
      } = await supabase
         .from("users")
         .select("*")
         .eq("id", id)
         .single();

      if (
         existingUser?.image_public_id
      ) {
         await deleteImage(
            existingUser.image_public_id
         );
      }

      const { error } =
         await supabase
            .from("users")
            .delete()
            .eq("id", id);

      if (error) {
         throw new Error(
            error.message
         );
      }
   };