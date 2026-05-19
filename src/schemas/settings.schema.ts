import z from "zod";

export const updateSettingsSchema =
   z.object({
      latitude: z.number({
         error:
            "Latitude wajib diisi",
      }),

      longitude: z.number({
         error:
            "Longitude wajib diisi",
      }),

      radius: z
         .number({
            error:
               "Radius wajib diisi",
         })
         .min(
            1,
            "Radius minimal 1 meter"
         ),

      checkpoint_start_hour: z
         .number({
            error:
               "Jam mulai checkpoint wajib diisi",
         })
         .min(
            0,
            "Jam harus 0-23"
         )
         .max(
            23,
            "Jam harus 0-23"
         ),

      checkpoint_end_hour: z
         .number({
            error:
               "Jam akhir checkpoint wajib diisi",
         })
         .min(
            0,
            "Jam harus 0-23"
         )
         .max(
            23,
            "Jam harus 0-23"
         ),

      attendance_time_hour: z
         .number({
            error:
               "Jam attendance wajib diisi",
         })
         .min(
            0,
            "Jam harus 0-23"
         )
         .max(
            23,
            "Jam harus 0-23"
         ),

      attendance_time_minute: z
         .number({
            error:
               "Menit attendance wajib diisi",
         })
         .min(
            0,
            "Menit harus 0-59"
         )
         .max(
            59,
            "Menit harus 0-59"
         ),

      checkout_time_hour: z
         .number({
            error:
               "Jam checkout wajib diisi",
         })
         .min(
            0,
            "Jam harus 0-23"
         )
         .max(
            23,
            "Jam harus 0-23"
         ),

      checkout_time_minute: z
         .number({
            error:
               "Menit checkout wajib diisi",
         })
         .min(
            0,
            "Menit harus 0-59"
         )
         .max(
            59,
            "Menit harus 0-59"
         ),
   });

export type UpdateSettingsSchema =
   z.infer<
      typeof updateSettingsSchema
   >;