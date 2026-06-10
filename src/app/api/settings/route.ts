import { apiResponse } from "@/lib/api-response";
import { getAppSettings, updateAppSettings } from "@/services/settings.service";
import { updateSettingsSchema } from "@/schemas/settings.schema";
import { getSession } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
   try {
      const settings = await getAppSettings();

      return apiResponse({
         data: settings,
      });
   } catch {
      return apiResponse({
         message: "Gagal mengambil pengaturan aplikasi",
         status: 500,
      });
   }
}

export async function PUT(request: Request) {
   try {
      const session = await getSession();

      if (!session || session.role !== "admin") {
         return apiResponse({
            message: "Unauthorized",
            status: 401,
         });
      }

      const body = await request.json();

      const validatedFields = updateSettingsSchema.safeParse(body);

      if (!validatedFields.success) {
         return apiResponse({
            message: validatedFields.error.issues[0]?.message || "Data tidak valid",
            status: 400,
         });
      }

      const settings = await updateAppSettings(validatedFields.data);

      return apiResponse({
         message: "Pengaturan berhasil diperbarui",
         data: settings,
      });
   } catch {
      return apiResponse({
         message: "Gagal memperbarui pengaturan",
         status: 500,
      });
   }
}