import { isWithinRadius } from "@/lib/geolocation";

import { getAppSettings } from "./settings.service";

type ValidateLocationPayload = {
   latitude: number;
   longitude: number;
};

export const validateLocation =
   async ({
      latitude,
      longitude,
   }: ValidateLocationPayload) => {
      const settings =
         await getAppSettings();

      if (!settings) {
         throw new Error(
            "Pengaturan aplikasi tidak ditemukan"
         );
      }

      const isValidLocation =
         isWithinRadius({
            userLocation: {
               latitude,
               longitude,
            },

            targetLocation: {
               latitude:
                  settings.latitude,

               longitude:
                  settings.longitude,
            },

            radius:
               settings.radius,
         });

      return {
         isValidLocation,
         settings,
      };
   };