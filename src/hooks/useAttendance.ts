"use client";

import {
   useEffect,
   useState,
} from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type AttendancePayload = {
   matchedUser: string | null;
   coordinates: {
      latitude: number;
      longitude: number;
   } | null;
   locationName: string;
   isFaceVerified: boolean;
   isLivenessVerified: boolean;
   resetVerification: () => void;
};

export const useAttendance =
   () => {
      const [
         isSubmittingAttendance,
         setIsSubmittingAttendance,
      ] = useState(false);

      const [
         todayAttendance,
         setTodayAttendance,
      ] = useState<any>(null);

      const [
         checkpointStartHour,
         setCheckpointStartHour,
      ] = useState(11);

      const [
         checkpointEndHour,
         setCheckpointEndHour,
      ] = useState(14);

      const router =
         useRouter();

      const loadTodayAttendance =
         async (
            userId: string
         ) => {
            try {
               const response =
                  await fetch(
                     `/api/attendance/today?user_id=${userId}`,
                     { cache: "no-store" }
                  );

               const result =
                  await response.json();

               if (
                  result.success &&
                  result.data
               ) {
                  return result.data;
               }

               return null;
            } catch (
            error
            ) {
               console.error(
                  error
               );

               return null;
            }
         };

      const loadSettings =
         async () => {
            try {
               const response =
                  await fetch(
                     "/api/settings",
                     { cache: "no-store" }
                  );

               const result =
                  await response.json();

               if (
                  result.success &&
                  result.data
               ) {
                  setCheckpointStartHour(
                     result.data.checkpoint_start_hour ?? 11
                  );

                  setCheckpointEndHour(
                     result.data.checkpoint_end_hour ?? 14
                  );
               }
            } catch (
            error
            ) {
               console.error(
                  error
               );
            }
         };

      useEffect(() => {
         const loadAttendance =
            async () => {
               try {
                  const userResponse =
                     await fetch(
                        "/api/users/me",
                        { cache: "no-store" }
                     );

                  const userResult =
                     await userResponse.json();

                  if (
                     !userResult.success
                  ) {
                     return;
                  }

                  const attendance =
                     await loadTodayAttendance(
                        userResult.data.id
                     );

                  if (
                     attendance
                  ) {
                     setTodayAttendance(
                        attendance
                     );
                  }
               } catch (
               error
               ) {
                  console.error(
                     error
                  );
               }
            };

         loadAttendance();
         loadSettings();
      }, []);

      const CHECKPOINT_START_HOUR =
         checkpointStartHour;

      const CHECKPOINT_END_HOUR =
         checkpointEndHour;

      const getCheckpointStatus =
         () => {
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

            const currentHour =
               jakartaTime.getHours();

            if (
               currentHour <
               CHECKPOINT_START_HOUR
            ) {
               return "locked";
            }

            if (
               currentHour >=
               CHECKPOINT_END_HOUR
            ) {
               return "expired";
            }

            return "available";
         };

      const getAttendanceMode =
         (
            attendance: any
         ) => {
            if (!attendance) {
               return "attendance";
            }

            if (attendance.checkout_verified) {
               return "completed";
            }

            if (!attendance.checkpoint_verified) {
               const checkpointStatus =
                  getCheckpointStatus();

               if (checkpointStatus === "locked") {
                  return "checkpoint_locked";
               }

               if (checkpointStatus === "expired") {
                  return "checkout";
               }

               return "checkpoint";
            }

            return "checkout";
         };

      const handleAttendance =
         async ({
            matchedUser,
            coordinates,
            locationName,
            isFaceVerified,
            isLivenessVerified,
            resetVerification,
         }: AttendancePayload) => {
            if (
               isSubmittingAttendance
            ) {
               return;
            }

            try {
               setIsSubmittingAttendance(
                  true
               );

               const loadingToast =
                  toast.loading(
                     "Processing attendance..."
                  );

               if (
                  !matchedUser
               ) {
                  toast.dismiss(
                     loadingToast
                  );

                  toast.error(
                     "User tidak ditemukan"
                  );

                  return;
               }

               const usersResponse =
                  await fetch(
                     "/api/users/faces",
                     { cache: "no-store" }
                  );

               const usersResult =
                  await usersResponse.json();

               const users =
                  usersResult.data ||
                  [];

               const currentUser =
                  users.find(
                     (
                        user: {
                           id: string;
                           name: string;
                        }
                     ) =>
                        user.name ===
                        matchedUser
                  );

               if (
                  !currentUser
               ) {
                  toast.dismiss(
                     loadingToast
                  );

                  toast.error(
                     "User tidak valid"
                  );

                  return;
               }

               const existingAttendance =
                  await loadTodayAttendance(
                     currentUser.id
                  );

               const attendanceMode =
                  getAttendanceMode(
                     existingAttendance
                  );

               if (
                  attendanceMode ===
                  "completed"

               ) {
                  toast.dismiss(
                     loadingToast
                  );

                  toast.error(
                     "Session hari ini sudah selesai"
                  );

                  return;
               }

               let endpoint =
                  "/api/attendance";

               if (
                  attendanceMode ===
                  "checkpoint"
               ) {
                  endpoint =
                     "/api/attendance/checkpoint";
               }

               if (
                  attendanceMode ===
                  "checkout" ||
                  attendanceMode ===
                  "checkpoint_locked"
               ) {
                  endpoint =
                     "/api/attendance/checkout";
               }

               const response =
                  await fetch(
                     endpoint,
                     {
                        method:
                           "POST",

                        headers: {
                           "Content-Type":
                              "application/json",
                        },

                        body: JSON.stringify({
                           attendance_id:
                              existingAttendance?.id,

                           user_id:
                              currentUser.id,

                           user_name:
                              currentUser.name,

                           latitude:
                              coordinates?.latitude ||
                              0,

                           longitude:
                              coordinates?.longitude ||
                              0,

                           location_name:
                              locationName,

                           face_verified:
                              isFaceVerified,

                           liveness_verified:
                              isLivenessVerified,
                        }),
                     }
                  );

               const result =
                  await response.json();

               toast.dismiss(
                  loadingToast
               );

               if (
                  !result.success
               ) {
                  toast.error(
                     result.message
                  );

                  return;
               }

               if (
                  attendanceMode ===
                  "attendance"
               ) {
                  toast.success(
                     "Attendance submitted"
                  );
               }

               if (
                  attendanceMode ===
                  "checkpoint"
               ) {
                  toast.success(
                     "Checkpoint verified"
                  );
               }

               if (
                  attendanceMode ===
                  "checkout" ||
                  attendanceMode ===
                  "checkpoint_locked"
               ) {
                  toast.success(
                     "Checkout completed"
                  );
               }

               resetVerification();

               setTimeout(() => {
                  router.push(
                     "/dashboard"
                  );
               }, 1000);
            } catch (
            error
            ) {
               console.error(
                  error
               );

               toast.error(
                  "Gagal memproses attendance"
               );
            } finally {
               setIsSubmittingAttendance(
                  false
               );
            }
         };

      return {
         todayAttendance,
         isSubmittingAttendance,
         loadTodayAttendance,
         handleAttendance,
         getAttendanceMode,
      };
   };