import { cn } from "@/utils/cn";

export type AttendanceSession = {
   id: string;
   user_name: string;
   attendance_time: string;
   checkpoint_time: string | null;
   checkout_time: string | null;
};

type SessionCardProps = {
   session: AttendanceSession;
   onClick: () => void;
   className?: string;
   variant?: "default" | "history";
};

export const SessionCard = ({
   session,
   onClick,
   className,
   variant = "default",
 }: SessionCardProps) => {
   const getSessionStatus =
      () => {
         if (
            session.checkout_time !== null &&
            session.checkpoint_time !== null
         ) {
            return {
               label: "Completed",
               className:
                  "bg-green-100 text-green-700",
            };
         }

         if (
            session.checkout_time !== null &&
            session.checkpoint_time === null
         ) {
            return {
               label: "Incomplete",
               className:
                  "bg-yellow-100 text-yellow-700",
            };
         }

         return {
            label: "Missed Checkout",
            className:
               "bg-red-100 text-red-700",
         };
      };

   const sessionStatus =
      getSessionStatus();

   const attendanceDate =
      new Date(
         session.attendance_time
      );

   return (
      <div
         onClick={
            onClick
         }
         className={cn(
            "cursor-pointer rounded-md border border-(--pertama) bg-(--kesembilan) p-4 transition-all duration-200 hover:opacity-90",
            className
         )}
      >
         <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-(--keenam)">
               PL-
               {
                  session.id
               }
            </p>

            <div
               className={`rounded-sm px-2 py-1 text-xs font-medium leading-none ${sessionStatus.className}`}
            >
               {
                  sessionStatus.label
               }
            </div>
         </div>

         <div className="mt-4 rounded-md bg-(--pertama) p-3">
            <div className="space-y-4 text-base text-(--kedua)">
               <div className="flex items-center justify-between gap-3">
                  <p>
                     Participant :
                  </p>

                  <p className="font-medium">
                     {
                        session.user_name
                     }
                  </p>
               </div>

               <div className="flex items-center justify-between gap-3">
                  <p>
                     Date :
                  </p>

                  <p className="font-medium">
                     {attendanceDate.toLocaleDateString(
                        "en-GB",
                        {
                           timeZone: "Asia/Jakarta",
                        }
                     )}
                  </p>
               </div>

               <div className="flex items-center justify-between gap-3">
                  <p>
                     Time in :
                  </p>

                  <p className="font-medium">
                     {attendanceDate.toLocaleTimeString(
                        "en-GB",
                        {
                           hour:
                              "2-digit",
                           minute:
                              "2-digit",
                           timeZone: "Asia/Jakarta",
                        }
                     )}
                  </p>
               </div>

               <div className="flex items-center justify-between gap-3">
                  <p>
                     Time out :
                  </p>

                  <p className="font-medium">
                     {session.checkout_time
                        ? new Date(
                           session.checkout_time
                        ).toLocaleTimeString(
                           "en-GB",
                           {
                              hour:
                                 "2-digit",
                              minute:
                                 "2-digit",
                              timeZone: "Asia/Jakarta",
                           }
                        )
                        : "-"}
                  </p>
               </div>
            </div>
         </div>
      </div>
   );
};
