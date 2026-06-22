import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";

import { formatAttendanceDate } from "@/utils/formatDate";

type SessionDetailDialogProps = {
   session: any;
   onClose: () => void;
};

export const SessionDetailDialog = ({
   session,
   onClose,
 }: SessionDetailDialogProps) => {
   const [qrUrl, setQrUrl] = useState("");

   useEffect(() => {
      setQrUrl(`${window.location.origin}/verify/${session.id}`);
   }, [session.id]);

   return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs">
         <div className="w-full max-w-2xl md:max-w-5xl rounded-2xl border border-(--pertama) bg-(--kesembilan) p-8 shadow-2xl transition-all duration-300">
            <div className="flex items-start justify-between gap-4">
               <div>
                  <h2 className="text-2xl font-bold text-(--pertama)">
                     Session Detail
                  </h2>

                  <p className="mt-1 text-sm text-(--keenam) font-semibold">
                     PL-{session.id}
                  </p>
               </div>

               <button
                  onClick={onClose}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pertama) text-(--kedua) hover:opacity-90 transition-opacity cursor-pointer text-lg font-bold"
               >
                  ×
               </button>
            </div>

            <div className="mt-4 flex justify-start">
               <div className="inline-flex overflow-hidden rounded-lg text-xs font-semibold shadow-sm border border-(--ketiga)">
                  <span className="bg-(--pertama) px-3 py-1.5 text-(--kedua) flex items-center justify-center">
                     Verified Attendance
                  </span>

                  <span className="bg-(--ketujuh)/80 px-3 py-1.5 text-(--kedua) flex items-center justify-center">
                     Database Recorded
                  </span>
               </div>
            </div>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6 items-stretch">
               <div className="flex items-center justify-center rounded-xl border border-(--pertama) bg-white p-6 w-full">
                  <QRCodeSVG
                     value={qrUrl}
                     className="w-full h-full max-w-[200px] aspect-square"
                     bgColor="#FBF8FB"
                     fgColor="#1B2B48"
                  />
               </div>

               <div className="flex flex-col rounded-xl bg-(--pertama) p-8 text-sm text-(--kedua) w-full shadow-inner">
                  <div className="flex items-center justify-between border-b border-(--kedua)/10 pb-3.5">
                     <span className="font-medium text-(--kedua)/70 min-w-[140px]">Session Code</span>
                     <span className="font-bold text-base text-right flex-1">PL-{session.id}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-(--kedua)/10 py-3.5">
                     <span className="font-medium text-(--kedua)/70 min-w-[140px]">Participant</span>
                     <span className="font-bold text-right flex-1">{session.user_name}</span>
                  </div>

                  <div className="flex items-center justify-between border-b border-(--kedua)/10 py-3.5">
                     <span className="font-medium text-(--kedua)/70 min-w-[140px]">Check-In Time</span>
                     <span className="font-bold text-right flex-1">
                        {formatAttendanceDate(session.attendance_time)}
                     </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-(--kedua)/10 py-3.5">
                     <span className="font-medium text-(--kedua)/70 min-w-[140px]">Check-Out Time</span>
                     <span className="font-bold text-right flex-1">
                        {session.checkout_time
                           ? formatAttendanceDate(session.checkout_time)
                           : "In Progress"}
                     </span>
                  </div>

                  <div className="flex items-center justify-between border-b border-(--kedua)/10 py-3.5">
                     <span className="font-medium text-(--kedua)/70 min-w-[140px]">Checkpoint Status</span>
                     <span className="font-bold text-right flex-1">
                        {session.checkpoint_verified ? "Completed" : "Incomplete"}
                     </span>
                  </div>

                  <div className="flex items-center justify-between pt-3.5">
                     <span className="font-medium text-(--kedua)/70 min-w-[140px]">Location</span>
                     <span className="text-right font-bold flex-1">
                        {session.location_name || "-"}
                     </span>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};