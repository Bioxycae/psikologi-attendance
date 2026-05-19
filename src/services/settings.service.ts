import { createServerSupabase } from "@/lib/supabase/server";

import type { AppSettings } from "@/types/database.type";

export const getAppSettings =
   async (): Promise<AppSettings | null> => {
      const supabase =
         createServerSupabase();

      const { data, error } =
         await supabase
            .from("app_settings")
            .select("*")
            .single();

      if (error) {
         return null;
      }

      return data;
   };

type UpdateAppSettingsPayload =
   Pick<
      AppSettings,
      | "latitude"
      | "longitude"
      | "radius"
      | "checkpoint_start_hour"
      | "checkpoint_end_hour"
      | "attendance_time_hour"
      | "attendance_time_minute"
      | "checkout_time_hour"
      | "checkout_time_minute"
   >;

export const updateAppSettings =
   async ({
      latitude,
      longitude,
      radius,
      checkpoint_start_hour,
      checkpoint_end_hour,
      attendance_time_hour,
      attendance_time_minute,
      checkout_time_hour,
      checkout_time_minute,
   }: UpdateAppSettingsPayload): Promise<AppSettings> => {
      const supabase =
         createServerSupabase();

      const existingSettings =
         await getAppSettings();

      if (!existingSettings) {
         throw new Error(
            "Pengaturan aplikasi tidak ditemukan"
         );
      }

      const { data, error } =
         await supabase
            .from("app_settings")
            .update({
               latitude,
               longitude,
               radius,
               checkpoint_start_hour,
               checkpoint_end_hour,
               attendance_time_hour,
               attendance_time_minute,
               checkout_time_hour,
               checkout_time_minute,
            })
            .eq(
               "id",
               existingSettings.id
            )
            .select()
            .single();

      if (error) {
         throw new Error(
            error.message
         );
      }

      return data;
   };