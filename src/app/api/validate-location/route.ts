import { apiResponse } from "@/lib/api-response";
import { validateLocation } from "@/services/validation.service";

export async function POST(
   request: Request
) {
   try {
      const body =
         await request.json();

      const {
         latitude,
         longitude,
      } = body;

      if (
         typeof latitude !==
            "number" ||
         typeof longitude !==
            "number"
      ) {
         return apiResponse({
            message:
               "Invalid coordinates",

            status: 400,
         });
      }

      const result =
         await validateLocation({
            latitude,
            longitude,
         });

      if (
         !result.isValidLocation
      ) {
         return apiResponse({
            message:
               "You are outside the attendance radius",
            success: false,
            status: 200,
         });
      }

      return apiResponse({
         message:
            "Location successfully verified",

         data: result,
      });
   } catch {
      return apiResponse({
         message:
            "Failed to validate location",

         status: 500,
      });
   }
}