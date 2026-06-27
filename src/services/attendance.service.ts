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

const normalizeCheckInTime = (
   minimumHour: number = 7,
   minimumMinute: number = 30
) => {
   const now = new Date();
   const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",
      hour12: false
   });
   const parts = formatter.formatToParts(now);
   const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
   const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

   if (hour < minimumHour || (hour === minimumHour && minute < minimumMinute)) {
      const year = parts.find(p => p.type === "year")?.value;
      const monthStr = parts.find(p => p.type === "month")?.value || "0";
      const dayStr = parts.find(p => p.type === "day")?.value || "0";
      const month = monthStr.padStart(2, '0');
      const day = dayStr.padStart(2, '0');
      const minHrStr = String(minimumHour).padStart(2, '0');
      const minMinStr = String(minimumMinute).padStart(2, '0');
      
      const jakartaISO = `${year}-${month}-${day}T${minHrStr}:${minMinStr}:00.000+07:00`;
      return new Date(jakartaISO).toISOString();
   }

   return now.toISOString();
};

const normalizeCheckoutTime = (
   maximumHour: number = 16,
   maximumMinute: number = 30
) => {
   const now = new Date();
   const formatter = new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Jakarta",
      year: "numeric", month: "numeric", day: "numeric",
      hour: "numeric", minute: "numeric", second: "numeric",
      hour12: false
   });
   const parts = formatter.formatToParts(now);
   const hour = parseInt(parts.find(p => p.type === "hour")?.value || "0");
   const minute = parseInt(parts.find(p => p.type === "minute")?.value || "0");

   if (hour > maximumHour || (hour === maximumHour && minute > maximumMinute)) {
      const year = parts.find(p => p.type === "year")?.value;
      const monthStr = parts.find(p => p.type === "month")?.value || "0";
      const dayStr = parts.find(p => p.type === "day")?.value || "0";
      const month = monthStr.padStart(2, '0');
      const day = dayStr.padStart(2, '0');
      const maxHrStr = String(maximumHour).padStart(2, '0');
      const maxMinStr = String(maximumMinute).padStart(2, '0');
      
      const jakartaISO = `${year}-${month}-${day}T${maxHrStr}:${maxMinStr}:00.000+07:00`;
      return new Date(jakartaISO).toISOString();
   }

   return now.toISOString();
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
            attendance_time:
               normalizeCheckInTime(
                  settings?.attendance_time_hour ?? 7,
                  settings?.attendance_time_minute ?? 30
               ),
            updated_at:
               new Date().toISOString(),
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
               session.checkout_time !== null
         ).length;

      const inProgressToday =
         sessions.filter(
            session =>
               session.checkout_time === null
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
