type AdminAttendanceSession = {
   id: string;
   user_name: string;
   attendance_time: string;
   checkout_time: string | null;
   checkpoint_time: string | null;
   location_name?: string;
};

type SessionActivityCardProps = {
   session: AdminAttendanceSession;
   onClick: () => void;
};

export const SessionActivityCard = ({
   session,
   onClick,
}: SessionActivityCardProps) => {
   const getSessionStatus = () => {
      if (
         session.checkout_time !== null &&
         session.checkpoint_time !== null
      ) {
         return {
            label: "Completed",
            className: "bg-green-100 text-green-700",
         };
      }

      if (
         session.checkout_time !== null &&
         session.checkpoint_time === null
      ) {
         return {
            label: "Incomplete",
            className: "bg-yellow-100 text-yellow-700",
         };
      }

      return {
         label: "Missed Checkout",
         className: "bg-red-100 text-red-700",
      };
   };

   const status = getSessionStatus();

   const attendanceTime = new Date(
      session.attendance_time
   ).toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Jakarta",
   });

   return (
      <button
         type="button"
         onClick={onClick}
         className="cursor-pointer rounded-md border border-(--pertama) bg-(--kesembilan) p-4 text-left transition-all hover:opacity-90"
      >
         <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-(--keenam)">
               PL-{session.id}
            </p>

            <div
               className={`rounded-sm px-2 py-1 text-xs font-medium leading-none ${status.className}`}
            >
               {status.label}
            </div>
         </div>

         <div className="mt-4 rounded-md bg-(--pertama) p-3">
            <div className="space-y-4 text-base text-(--kedua)">
               <div className="flex items-center justify-between gap-3">
                  <p>Participant :</p>
                  <p className="font-medium">{session.user_name}</p>
               </div>

               <div className="flex items-center justify-between gap-3">
                  <p>Time</p>
                  <p className="font-medium">{attendanceTime}</p>
               </div>
            </div>
         </div>
      </button>
   );
};
