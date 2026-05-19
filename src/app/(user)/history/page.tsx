"use client";

import {
    useEffect,
    useMemo,
    useState,
} from "react";

import {
    Download,
    Search,
    ShieldCheck,
    SlidersHorizontal,
} from "lucide-react";

import {
    AttendanceSession,
    SessionCard,
} from "@/components/layouts/SessionCard";

import { HistoryFilterDialog } from "@/components/dialogs/HistoryFilterDialog";
import { SessionDetailDialog } from "@/components/dialogs/SessionDetailDialog";

const LIMIT = 8;

type HistoryUser = {
   id: string;
};

type UserResponse = {
   success: boolean;
   data: HistoryUser;
};

type AttendanceHistoryResponse = {
   success: boolean;
   data: AttendanceSession[];
   hasMore: boolean;
};

const HistoryPage =
   () => {
      const [
         attendanceData,
         setAttendanceData,
      ] = useState<AttendanceSession[]>([]);

      const [
         currentUser,
         setCurrentUser,
      ] = useState<HistoryUser | null>(null);

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

      const [
         isLoading,
         setIsLoading,
      ] = useState(true);

      const [
         search,
         setSearch,
      ] = useState("");

      const [
         selectedFilter,
         setSelectedFilter,
      ] = useState("all");

      const [
         startDate,
         setStartDate,
      ] = useState("");

      const [
         endDate,
         setEndDate,
      ] = useState("");

      const [
         isFilterOpen,
         setIsFilterOpen,
      ] = useState(false);

      const loadAttendanceHistory =
         async (
            userId: string,
            offset = 0,
            append = false
         ) => {
            const response =
               await fetch(
                  `/api/attendance/history?user_id=${userId}&limit=${LIMIT}&offset=${offset}`
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
         const loadHistory =
            async () => {
               try {
                  const userResponse =
                     await fetch(
                        "/api/users/me"
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

         loadHistory();
      }, []);

      const filteredData =
         useMemo(() => {
         let result =
            attendanceData;

         if (
            selectedFilter !==
            "all"
         ) {
            result =
               result.filter(
                  session => {
                     if (
                        selectedFilter ===
                        "completed"
                     ) {
                        return (
                           session.checkout_verified &&
                           session.checkpoint_verified
                        );
                     }

                     if (
                        selectedFilter ===
                        "checkpoint_missed"
                     ) {
                        return (
                           session.checkout_verified &&
                           !session.checkpoint_verified
                        );
                     }

                     if (
                        selectedFilter ===
                        "in_progress"
                     ) {
                        return !session.checkout_verified;
                     }

                     return true;
                  }
               );
         }

         if (search) {
            result =
               result.filter(
                  session => {
                      const formattedDate =
                         new Date(
                            session.attendance_time
                         ).toLocaleDateString(
                            "id-ID",
                            {
                               timeZone: "Asia/Jakarta",
                            }
                         );

                      const formattedTime =
                         new Date(
                            session.attendance_time
                         ).toLocaleTimeString(
                            "en-GB",
                            {
                               hour:
                                  "2-digit",
                               minute:
                                  "2-digit",
                               timeZone: "Asia/Jakarta",
                            }
                         );

                     const searchValue =
                        search.toLowerCase();

                     return (
                        session.user_name
                           .toLowerCase()
                           .includes(
                              searchValue
                           ) ||

                        formattedDate
                           .toLowerCase()
                           .includes(
                              searchValue
                           ) ||

                        formattedTime
                           .toLowerCase()
                           .includes(
                              searchValue
                           )
                     );
                  }
               );
         }

         if (
            startDate &&
            endDate
         ) {
            result =
               result.filter(
                  session => {
                     const attendanceDate =
                        new Date(
                           session.attendance_time
                        );

                     const start =
                        new Date(
                           startDate
                        );

                     const end =
                        new Date(
                           endDate
                        );

                     end.setHours(
                        23,
                        59,
                        59,
                        999
                     );

                     return (
                        attendanceDate >=
                        start &&
                        attendanceDate <=
                        end
                     );
                  }
               );
         }

         return result;
      }, [
            attendanceData,
            selectedFilter,
            search,
            startDate,
            endDate,
         ]);

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

      const totalRecords =
         useMemo(
            () =>
               filteredData.length,
            [
               filteredData,
            ]
         );

      const getSessionStatus =
         (
            session: AttendanceSession
         ) => {
            if (
               session.checkout_verified &&
               session.checkpoint_verified
            ) {
               return "Present";
            }

            if (
               session.checkout_verified &&
               !session.checkpoint_verified
            ) {
               return "Absent";
            }

            return "Late";
         };

      const formatTime =
         (
            value: string | null
         ) => {
            if (!value) {
               return "-";
            }

            return new Date(
               value
            ).toLocaleTimeString(
               "en-GB",
               {
                  hour:
                     "2-digit",
                  minute:
                     "2-digit",
                  timeZone: "Asia/Jakarta",
               }
            );
         };

      const escapeCsvValue =
         (
            value: string
         ) =>
            `"${value.replace(
               /"/g,
               '""'
            )}"`;

      const handleExport =
         () => {
            const rows = [
               [
                  "Session ID",
                  "Participant",
                  "Date",
                  "Time In",
                  "Time Out",
                  "Status",
               ],
               ...filteredData.map(
                  session => {
                     const attendanceDate =
                        new Date(
                           session.attendance_time
                        );

                     return [
                        `PL-${session.id}`,
                        session.user_name,
                         attendanceDate.toLocaleDateString(
                            "en-GB",
                            {
                               timeZone: "Asia/Jakarta",
                            }
                         ),
                        formatTime(
                           session.attendance_time
                        ),
                        formatTime(
                           session.checkout_time
                        ),
                        getSessionStatus(
                           session
                        ),
                     ];
                  }
               ),
            ];

            const csv =
               rows
                  .map(
                     row =>
                        row
                           .map(
                              value =>
                                 escapeCsvValue(
                                    value
                                 )
                           )
                           .join(
                              ","
                           )
                  )
                  .join(
                     "\n"
                  );

            const blob =
               new Blob(
                  [
                     csv,
                  ],
                  {
                     type:
                        "text/csv;charset=utf-8;",
                  }
               );

            const url =
               URL.createObjectURL(
                  blob
               );

            const link =
               document.createElement(
                  "a"
               );

            link.href =
               url;

            link.download =
               "attendance-history.csv";

            link.click();

            URL.revokeObjectURL(
               url
            );
         };

      if (isLoading) {
         return (
            <div className="flex min-h-[400px] flex-1 flex-col items-center justify-center rounded-xl border border-(--pertama) bg-(--kesembilan) p-12">
               <div className="flex flex-col items-center gap-4">
                  <div className="relative flex items-center justify-center">
                     <div className="h-16 w-16 animate-spin rounded-full border-4 border-(--ketiga) border-t-(--pertama)"></div>
                     <ShieldCheck size={28} className="absolute text-(--pertama) animate-pulse" />
                  </div>
                  <p className="text-sm font-medium tracking-wide text-(--keenam) animate-pulse">
                     Loading history...
                  </p>
               </div>
            </div>
         );
      }

      return (
         <div className="flex flex-col gap-10 lg:gap-12">
            <div className="rounded-xl border border-(--pertama) bg-(--kesembilan) p-4 lg:px-8 lg:py-4">
               <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                     <h1 className="text-2xl font-semibold text-(--pertama) lg:text-3xl lg:text-(--pertama)">
                        Attendance History
                     </h1>

                     <p className="mt-5 text-sm leading-6 text-(--keenam) lg:mt-1 lg:text-(--pertama)">
                        Showing{" "}
                        {
                           totalRecords
                        }{" "}
                        records for currently active filters.
                     </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
                     <button
                        type="button"
                        onClick={handleExport}
                        className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-md bg-(--pertama) px-5 text-base font-semibold text-(--kedua) lg:h-26 lg:min-w-23 lg:flex-col"
                     >
                        <Download size={22} />
                        Export
                     </button>

                     <button
                        type="button"
                        onClick={() =>
                           setIsFilterOpen(
                              true
                           )
                        }
                        className="flex h-14 cursor-pointer items-center justify-center gap-3 rounded-md bg-(--pertama) px-5 text-base font-semibold text-(--kedua) lg:h-26 lg:min-w-23 lg:flex-col"
                     >
                        <SlidersHorizontal size={22} />
                        Filter
                     </button>
                  </div>
               </div>

               <div className="mt-5">
                  <div className="relative">
                        <Search
                           size={
                              18
                           }
                           className="absolute top-1/2 left-4 -translate-y-1/2 text-(--keenam)"
                        />

                        <input
                           type="text"
                           value={
                              search
                           }
                           onChange={
                              event =>
                                 setSearch(
                                    event
                                       .target
                                       .value
                                 )
                           }
                           placeholder="Search date, time, or participant"
                           className="h-12 w-full rounded-md border border-(--pertama) bg-transparent pr-4 pl-11 text-sm outline-none"
                        />
                  </div>
               </div>
            </div>

            <div>
               <h2 className="text-center text-2xl font-semibold text-(--pertama) lg:text-left lg:text-3xl lg:text-(--pertama)">
                  Recent Activity
               </h2>

               <div className="flex snap-x snap-mandatory gap-5 overflow-x-auto pb-4 mt-5 lg:grid lg:grid-cols-2 lg:gap-3 lg:overflow-visible lg:pb-0 2xl:grid-cols-4">
                  {filteredData.length ===
                     0 ? (
                     <div className="w-full rounded-md border border-(--pertama) bg-(--kesembilan) p-6 lg:col-span-4">
                        <p className="text-sm text-(--keenam)">
                           No attendance history found.
                        </p>
                     </div>
                  ) : (
                     filteredData.map(
                        session => (
                           <SessionCard
                              key={
                                 session.id
                              }
                              session={
                                 session
                              }
                              variant="history"
                              className="min-w-[300px] shrink-0 snap-center lg:w-auto lg:min-w-0"
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

               {hasMore && (
                  <div className="mt-5 flex justify-center">
                     <button
                        onClick={
                           handleLoadMore
                        }
                        className="cursor-pointer rounded-md bg-(--pertama) px-6 py-3 text-sm font-semibold text-(--kedua)"
                     >
                        Load More
                     </button>
                  </div>
               )}
            </div>

            {isFilterOpen && (
               <HistoryFilterDialog
                  selectedFilter={
                     selectedFilter
                  }
                  setSelectedFilter={
                     setSelectedFilter
                  }
                  startDate={
                     startDate
                  }
                  setStartDate={
                     setStartDate
                  }
                  endDate={
                     endDate
                  }
                  setEndDate={
                     setEndDate
                  }
                  onClose={() =>
                     setIsFilterOpen(
                        false
                     )
                  }
               />
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

export default HistoryPage;
