import { createServerSupabase } from "@/lib/supabase/server";
import { getAppSettings } from "./settings.service";

type CreateAttendancePayload = {
   user_id: string;
   user_name: string;
   latitude: number;
   longitude: number;
   location_name: string;
   face_verified: boolean;
   liveness_verified: boolean;
   status: string;
};

type UpdateCheckpointPayload = {
   attendance_id: number;
   latitude: number;
   longitude: number;
   location_name: string;
};

type CheckoutAttendancePayload = {
   attendance_id: number;
   latitude: number;
   longitude: number;
   location_name: string;
};

const normalizeCheckInTime =
   (
      minimumHour: number = 7,
      minimumMinute: number = 30
   ) => {
      const now =
         new Date();

      const jakartaTime =
         new Date(
            now.toLocaleString(
               "en-US",
               {
                  timeZone:
                     "Asia/Jakarta",
               }
            )
         );

      if (
         jakartaTime.getHours() <
         minimumHour ||
         (
            jakartaTime.getHours() ===
            minimumHour &&
            jakartaTime.getMinutes() <
            minimumMinute
         )
      ) {
         jakartaTime.setHours(
            minimumHour
         );

         jakartaTime.setMinutes(
            minimumMinute
         );

         jakartaTime.setSeconds(
            0
         );
      }

      return jakartaTime.toISOString();
   };

const normalizeCheckoutTime =
   (
      maximumHour: number = 16,
      maximumMinute: number = 30
   ) => {
      const now =
         new Date();

      const jakartaTime =
         new Date(
            now.toLocaleString(
               "en-US",
               {
                  timeZone:
                     "Asia/Jakarta",
               }
            )
         );

      if (
         jakartaTime.getHours() >
         maximumHour ||
         (
            jakartaTime.getHours() ===
            maximumHour &&
            jakartaTime.getMinutes() >
            maximumMinute
         )
      ) {
         jakartaTime.setHours(
            maximumHour
         );

         jakartaTime.setMinutes(
            maximumMinute
         );

         jakartaTime.setSeconds(
            0
         );
      }

      return jakartaTime.toISOString();
   };

export const getTodayAttendance =
   async (
      userId: string
   ) => {
      const supabase =
         createServerSupabase();

      const now = new Date();
      const formatter = new Intl.DateTimeFormat("en-US", {
         timeZone: "Asia/Jakarta",
         year: "numeric",
         month: "2-digit",
         day: "2-digit"
      });
      const parts = formatter.formatToParts(now);
      const month = parts.find(p => p.type === "month")?.value;
      const day = parts.find(p => p.type === "day")?.value;
      const year = parts.find(p => p.type === "year")?.value;

      const startOfDayISO = `${year}-${month}-${day}T00:00:00.000+07:00`;
      const endOfDayISO = `${year}-${month}-${day}T23:59:59.999+07:00`;

      const {
         data,
         error,
      } = await supabase
         .from(
            "attendance"
         )
         .select("*")
         .eq(
            "user_id",
            userId
         )
         .gte(
            "attendance_time",
            startOfDayISO
         )
         .lte(
            "attendance_time",
            endOfDayISO
         )
         .order(
            "attendance_time",
            {
               ascending:
                  false,
            }
         )
         .limit(1)
         .maybeSingle();

      if (error) {
         console.error(
            error
         );

         return null;
      }

      return data;
   };

export const createAttendance =
   async ({
      user_id,
      user_name,
      latitude,
      longitude,
      location_name,
      face_verified,
      liveness_verified,
      status,
   }: CreateAttendancePayload) => {
      const supabase =
         createServerSupabase();

      const settings =
         await getAppSettings();

      const {
         data,
         error,
      } = await supabase
         .from(
            "attendance"
         )
         .insert({
            user_id,
            user_name,
            latitude,
            longitude,
            location_name,
            face_verified,
            liveness_verified,
            status,
            attendance_time:
               normalizeCheckInTime(
                  settings?.attendance_time_hour ?? 7,
                  settings?.attendance_time_minute ?? 30
               ),
            updated_at:
               new Date().toISOString(),
            checkpoint_verified:
               false,
            checkout_verified:
               false,
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

export const updateCheckpoint =
   async ({
      attendance_id,
      latitude,
      longitude,
      location_name,
   }: UpdateCheckpointPayload) => {
      const supabase =
         createServerSupabase();

      const {
         data,
         error,
      } = await supabase
         .from(
            "attendance"
         )
         .update({
            latitude,
            longitude,
            location_name,
            checkpoint_time:
               new Date().toISOString(),
            checkpoint_verified:
               true,
            updated_at:
               new Date().toISOString(),
         })
         .eq(
            "id",
            attendance_id
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

export const checkoutAttendance =
   async ({
      attendance_id,
      latitude,
      longitude,
      location_name,
   }: CheckoutAttendancePayload) => {
      const supabase =
         createServerSupabase();

      const settings =
         await getAppSettings();

      const {
         data,
         error,
      } = await supabase
         .from(
            "attendance"
         )
         .update({
            latitude,
            longitude,
            location_name,
            checkout_time:
               normalizeCheckoutTime(
                  settings?.checkout_time_hour ?? 16,
                  settings?.checkout_time_minute ?? 30
               ),
            checkout_verified:
               true,
            updated_at:
               new Date().toISOString(),
         })
         .eq(
            "id",
            attendance_id
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

export const getAttendanceHistory =
   async (
      userId: string,
      limit = 8,
      offset = 0
   ) => {
      const supabase =
         createServerSupabase();

      const {
         data,
         error,
         count,
      } = await supabase
         .from(
            "attendance"
         )
         .select(
            "*",
            {
               count:
                  "exact",
            }
         )
         .eq(
            "user_id",
            userId
         )
         .order(
            "attendance_time",
            {
               ascending:
                  false,
            }
         )
         .range(
            offset,
            offset +
            limit -
            1
         );

      if (error) {
         throw new Error(
            error.message
         );
      }

      return {
         data:
            data || [],
         total:
            count || 0,
         hasMore:
            (
               offset +
               limit
            ) <
            (
               count || 0
            ),
      };
   };

export const getAdminDashboardOverview =
   async () => {
      const supabase =
         createServerSupabase();

      const now =
         new Date();

      const jakartaDate =
         new Date(
            now.toLocaleString(
               "en-US",
               {
                  timeZone:
                     "Asia/Jakarta",
               }
            )
         );

      const startOfDay =
         new Date(
            jakartaDate.getFullYear(),
            jakartaDate.getMonth(),
            jakartaDate.getDate(),
            0,
            0,
            0
         );

      const endOfDay =
         new Date(
            jakartaDate.getFullYear(),
            jakartaDate.getMonth(),
            jakartaDate.getDate(),
            23,
            59,
            59
         );

      const {
         count: totalAssistants,
         error: usersError,
      } = await supabase
         .from(
            "users"
         )
         .select(
            "*",
            {
               count:
                  "exact",
               head:
                  true,
            }
         )
         .eq(
            "role",
            "user"
         );

      if (usersError) {
         throw new Error(
            usersError.message
         );
      }

      const {
         data: todayAttendance,
         error: todayError,
      } = await supabase
         .from(
            "attendance"
         )
         .select("*")
         .gte(
            "attendance_time",
            startOfDay.toISOString()
         )
         .lte(
            "attendance_time",
            endOfDay.toISOString()
         )
         .order(
            "attendance_time",
            {
               ascending:
                  false,
            }
         );

      if (todayError) {
         throw new Error(
            todayError.message
         );
      }

      const {
         data: recentAttendance,
         error: recentError,
      } = await supabase
         .from(
            "attendance"
         )
         .select("*")
         .order(
            "attendance_time",
            {
               ascending:
                  false,
            }
         )
         .limit(24);

      if (recentError) {
         throw new Error(
            recentError.message
         );
      }

      const sessions =
         todayAttendance || [];

      const completedToday =
         sessions.filter(
            session =>
               session.checkout_verified
         ).length;

      const inProgressToday =
         sessions.filter(
            session =>
               !session.checkout_verified
         ).length;

      return {
         totalAssistants:
            totalAssistants || 0,
         presentToday:
            sessions.length,
         inProgressToday,
         completedToday,
         recentAttendance:
            recentAttendance || [],
      };
   };

export const getAttendanceById =
   async (
      id: number
   ) => {
      const supabase =
         createServerSupabase();

      const {
         data,
         error,
      } = await supabase
         .from(
            "attendance"
         )
         .select("*")
         .eq(
            "id",
            id
         )
         .maybeSingle();

      if (error) {
         console.error(
            error
         );

         return null;
      }

      return data;
   };
