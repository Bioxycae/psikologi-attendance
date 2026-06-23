"use client";

import {
   useEffect,
   useMemo,
   useState,
} from "react";

import {
   Clock3,
   FileSearch,
   ScanFace,
   ShieldCheck,
   Loader2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { SessionDetailDialog } from "@/components/dialogs/SessionDetailDialog";
import {
   AttendanceSession,
   SessionCard,
} from "@/components/layouts/SessionCard";
import { useAttendance } from "@/hooks/useAttendance";
import { preloadUserFaceDescriptor } from "@/lib/faceDescriptorCache";

type DashboardUser = {
   id: string;
   name: string;
};

type AttendanceHistoryResponse = {
   success: boolean;
   data: AttendanceSession[];
   hasMore: boolean;
};

type UserResponse = {
   success: boolean;
   data: DashboardUser;
};

const DashboardPage = () => {
   const router = useRouter();
   const { todayAttendance, getAttendanceMode } = useAttendance();
   const [isNavigating, setIsNavigating] = useState(false);
   const attendanceMode = getAttendanceMode(todayAttendance);

   const [
      attendanceData,
      setAttendanceData,
   ] = useState<AttendanceSession[]>([]);

   const [
      currentUser,
      setCurrentUser,
   ] = useState<DashboardUser | null>(null);

   const [
      isLoading,
      setIsLoading,
   ] = useState(true);

   const [
      selectedSession,
      setSelectedSession,
   ] = useState<AttendanceSession | null>(null);

   const [
      currentOffset,
      setCurrentOffset,
   ] = useState(0);

   const [
      hasMore,
      setHasMore,
   ] = useState(false);

   const LIMIT = 8;

   const loadAttendanceHistory =
      async (
         userId: string,
         offset = 0,
         append = false
      ) => {
         const response =
            await fetch(
               `/api/attendance/history?user_id=${userId}&limit=${LIMIT}&offset=${offset}`,
               { cache: "no-store" }
            );

         const contentType = response.headers.get("content-type");
         if (!contentType || !contentType.includes("application/json")) {
            return;
         }

         const result =
            await response.json() as AttendanceHistoryResponse;

         if (
            !result.success
         ) {
            return;
         }

         setAttendanceData(
            previous =>
               append
                  ? [
                     ...previous,
                     ...result.data,
                  ]
                  : result.data
         );

         setHasMore(
            result.hasMore
         );
      };

   useEffect(() => {
      const loadDashboard =
         async () => {
            try {
               const userResponse =
                  await fetch(
                     "/api/users/me",
                     { cache: "no-store" }
                  );

               const contentType = userResponse.headers.get("content-type");
               if (!contentType || !contentType.includes("application/json")) {
                  return;
               }

               const userResult =
                  await userResponse.json() as UserResponse;

               if (
                  !userResult.success
               ) {
                  return;
               }

               setCurrentUser(
                  userResult.data
               );

               await loadAttendanceHistory(
                  userResult.data.id
               );

               // Background load face descriptor cache
               preloadUserFaceDescriptor();
            } catch (
            error
            ) {
               console.error(
                  error
               );
            } finally {
               setIsLoading(
                  false
               );
            }
         };

      void loadDashboard();
   }, []);

   const totalSessions =
      attendanceData.length;

   const totalHours =
      useMemo(() => {
         return attendanceData.reduce(
            (
               total,
               session
            ) => {
               if (
                  !session.checkout_time
               ) {
                  return total;
               }

               const attendanceTime =
                  new Date(
                     session.attendance_time
                  ).getTime();

               const checkoutTime =
                  new Date(
                     session.checkout_time
                  ).getTime();

               const hours =
                  (
                     checkoutTime -
                     attendanceTime
                  ) /
                  (
                     1000 *
                     60 *
                     60
                  );

               return (
                  total +
                  hours
               );
            },
            0
         );
      }, [
         attendanceData,
      ]);

   const pendingValidation =
      attendanceData.filter(
         session =>
            !session.checkout_verified
      ).length;

   const handleLoadMore =
      async () => {
         if (
            !currentUser
         ) {
            return;
         }

         const nextOffset =
            currentOffset +
            LIMIT;

         await loadAttendanceHistory(
            currentUser.id,
            nextOffset,
            true
         );

         setCurrentOffset(
            nextOffset
         );
      };

   const getButtonText = () => {
      switch (attendanceMode) {
         case "attendance":
            return "Start Attendance";
         case "checkpoint":
            return "Checkpoint";
         case "checkout":
         case "checkpoint_locked":
            return "Check-Out";
         case "completed":
            return "Completed";
         default:
            return "Start Attendance";
      }
   };

   if (isLoading) {
      return (
         <div className="flex min-h-100 flex-1 flex-col items-center justify-center rounded-xl border border-(--pertama) bg-(--kesembilan) p-12">
            <div className="flex flex-col items-center gap-4">
               <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-(--ketiga) border-t-(--pertama)"></div>
                  <ShieldCheck size={28} className="absolute text-(--pertama) animate-pulse" />
               </div>
               <p className="text-sm font-medium tracking-wide text-(--keenam) animate-pulse">
                  Loading dashboard...
               </p>
            </div>
         </div>
      );
   }

   return (
      <div className="flex flex-col gap-12 lg:gap-16">
         <div className="rounded-lg border border-(--pertama) px-4 py-6 lg:px-8 bg-(--kesembilan)">
            <div className="flex items-center justify-between gap-6">
               <div>
                  <h1 className="text-2xl font-semibold text-(--pertama) lg:text-3xl lg:text-(--pertama)">
                     Welcome back,{" "}
                     {
                        currentUser?.name ||
                        "Assistant"
                     }
                  </h1>

                  <p className="mt-2 max-w-2xl text-sm leading-6 text-(--keenam) lg:text-(--pertama)">
                     Here is an overview of today&apos;s laboratory sessions and validation tasks.
                  </p>
               </div>

                 {attendanceMode === "completed" ? (
                     <button
                        disabled
                        className="hidden h-26 w-full max-w-sm cursor-not-allowed flex-col items-center justify-center gap-3 rounded-lg bg-slate-500 px-6 text-base font-semibold text-(--kedua) opacity-90 lg:flex"
                     >
                       <ScanFace size={28} />
                       {getButtonText()}
                    </button>
                 ) : (
                     <button
                        onClick={() => {
                           setIsNavigating(true);
                           router.push("/validate");
                        }}
                        disabled={isNavigating}
                        className="hidden h-26 w-full max-w-sm cursor-pointer flex-col items-center justify-center gap-3 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-300 px-6 text-base font-semibold text-white shadow-md lg:flex disabled:opacity-70 disabled:cursor-not-allowed"
                     >
                       {isNavigating ? <Loader2 size={28} className="animate-spin" /> : <ScanFace size={28} />}
                       {isNavigating ? "Loading..." : getButtonText()}
                    </button>
                 )}
            </div>
         </div>

         <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 lg:grid lg:grid-cols-3 lg:gap-3 lg:overflow-visible">
            <div className="min-h-34 min-w-75 shrink-0 snap-center rounded-lg border border-(--pertama) bg-(--kesembilan) p-6 lg:min-w-0 lg:w-auto lg:p-8">
               <div className="flex items-start justify-between gap-4">
                  <div>
                     <p className="text-base font-medium text-(--keenam)">
                        Total Sessions
                     </p>

                     <h2 className="mt-5 text-4xl font-semibold text-(--pertama)">
                        {
                           totalSessions
                        }
                     </h2>
                  </div>

                  <ShieldCheck
                     size={24}
                     className="text-(--pertama)"
                  />
               </div>
            </div>

            <div className="min-h-34 min-w-75 shrink-0 snap-center rounded-lg border border-(--pertama) bg-(--kesembilan) p-6 lg:min-w-0 lg:w-auto lg:p-8">
               <div className="flex items-start justify-between gap-4">
                  <div>
                     <p className="text-base font-medium text-(--keenam)">
                        Hours Logged
                     </p>

                     <h2 className="mt-5 text-4xl font-semibold text-(--pertama)">
                        {
                           Math.round(
                              totalHours
                           )
                        }
                     </h2>
                  </div>

                  <Clock3
                     size={24}
                     className="text-(--pertama)"
                  />
               </div>
            </div>

            <div className="min-h-34 min-w-75 shrink-0 snap-center rounded-lg border border-(--pertama) bg-(--kesembilan) p-6 lg:min-w-0 lg:w-auto lg:p-8">
               <div className="flex items-start justify-between gap-4">
                  <div>
                     <p className="text-base font-medium text-(--keenam)">
                        Pending Validation
                     </p>

                     <h2 className="mt-5 text-4xl font-semibold text-(--pertama)">
                        {
                           pendingValidation
                        }
                     </h2>
                  </div>

                  <FileSearch
                     size={24}
                     className="text-(--pertama)"
                  />
               </div>
            </div>
         </div>

         <div>
            <h2 className="text-center text-2xl font-semibold text-(--pertama) lg:text-left lg:text-3xl lg:text-(--pertama)">
               Recent Activity
            </h2>

            <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-2 lg:gap-3 2xl:grid-cols-4">
               {attendanceData.length ===
                  0 ? (
                  <div className="w-full rounded-lg border border-(--pertama) p-6 lg:col-span-4 bg-(--kesembilan)">
                     <p className="text-sm text-(--keenam)">
                        No attendance history available.
                     </p>
                  </div>
               ) : (
                  attendanceData.map(
                     session => (
                        <SessionCard
                           key={
                              session.id
                           }
                           className="w-full"
                           session={
                              session
                           }
                           onClick={() =>
                              setSelectedSession(
                                 session
                              )
                           }
                        />
                     )
                  )
               )}
            </div>
         </div>

         {hasMore && (
            <div className="mt-5 flex justify-center">
               <button
                  onClick={
                     handleLoadMore
                  }
                  className="cursor-pointer rounded-lg bg-(--pertama) px-6 py-3 text-sm font-semibold text-(--kedua)"
               >
                  Load More
               </button>
            </div>
         )}

         {attendanceMode === "completed" ? (
             <button
                disabled
                className="fixed bottom-20 left-1/2 z-40 flex h-12 w-11/12 -translate-x-1/2 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-500 px-4 text-sm font-semibold text-(--kedua) shadow-lg whitespace-nowrap opacity-90 lg:hidden"
             >
               {getButtonText()}
               <ScanFace size={20} />
            </button>
         ) : (
             <button
                onClick={() => {
                   setIsNavigating(true);
                   router.push("/validate");
                }}
                disabled={isNavigating}
                className="fixed bottom-20 left-1/2 z-40 flex h-12 w-11/12 -translate-x-1/2 cursor-pointer items-center justify-center gap-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition-colors duration-300 px-4 text-sm font-semibold text-white shadow-lg whitespace-nowrap lg:hidden disabled:opacity-70 disabled:cursor-not-allowed"
             >
               {isNavigating ? "Loading..." : getButtonText()}
               {isNavigating ? <Loader2 size={20} className="animate-spin" /> : <ScanFace size={20} />}
            </button>
         )}

         {selectedSession && (
            <SessionDetailDialog
               session={
                  selectedSession
               }
               onClose={() =>
                  setSelectedSession(
                     null
                  )
               }
            />
         )}

      </div>
   );
};

export default DashboardPage;
