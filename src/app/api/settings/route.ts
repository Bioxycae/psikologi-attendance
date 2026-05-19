import { apiResponse } from "@/lib/api-response";

import { getAppSettings, updateAppSettings } from "@/services/settings.service";

import { updateSettingsSchema } from "@/schemas/settings.schema";

export async function GET() {
   try {
      const settings =
         await getAppSettings();

      return apiResponse({
         data: settings,
      });
   } catch {
      return apiResponse({
         message:
            "Gagal mengambil pengaturan aplikasi",

         status: 500,
      });
   }
}

export async function PUT(
   request: Request
) {
   try {
      const body =
         await request.json();

      const validatedFields =
         updateSettingsSchema.safeParse(
            body
         );

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

      const settings =
         await updateAppSettings(
            validatedFields.data
         );

      return apiResponse({
         message:
            "Pengaturan berhasil diperbarui",

         data: settings,
      });
   } catch {
      return apiResponse({
         message:
            "Gagal memperbarui pengaturan",

         status: 500,
      });
   }
}