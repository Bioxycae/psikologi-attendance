"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
   ShieldCheck, 
   XCircle, 
   ArrowLeft, 
   Clock, 
   CheckCircle2, 
   MapPin, 
   UserCheck 
} from "lucide-react";
import { formatAttendanceDate } from "@/utils/formatDate";
import { Button } from "@/components/ui/Button";

type AttendanceSession = {
   id: number;
   user_name: string;
   attendance_time: string;
   checkpoint_time: string | null;
   checkout_time: string | null;
   location_name: string;
   face_verified: boolean;
   liveness_verified: boolean;
};

type ApiResponse = {
   success: boolean;
   data?: AttendanceSession;
   message?: string;
 };

const VerifyPage = () => {
   const params = useParams();
   const router = useRouter();
   const [loading, setLoading] = useState(true);
   const [session, setSession] = useState<AttendanceSession | null>(null);
   const [error, setError] = useState<string | null>(null);

   const id = params.id as string;

   useEffect(() => {
      const fetchSession = async () => {
         try {
            const response = await fetch(`/api/attendance/${id}`);
            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
               setError("Failed to verify attendance session");
               return;
            }
            const result = await response.json() as ApiResponse;

            if (result.success && result.data) {
               setSession(result.data);
            } else {
               setError(result.message || "Attendance session not found");
            }
         } catch {
            setError("Failed to verify attendance session");
         } finally {
            setLoading(false);
         }
      };

      if (id) {
         void fetchSession();
      }
   }, [id]);

   if (loading) {
      return (
         <div className="flex h-screen w-screen flex-col items-center justify-center bg-(--pertama) text-white p-6">
            <div className="flex flex-col items-center gap-4">
               <div className="relative flex items-center justify-center">
                  <div className="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
                  <ShieldCheck size={28} className="absolute text-white animate-pulse" />
               </div>
               <h2 className="text-xl font-medium tracking-wide text-slate-200 animate-pulse">
                  Verifying Session PL-{id}...
               </h2>
            </div>
         </div>
      );
   }

   return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-(--kedua) p-6">
         <div className="w-full max-w-lg rounded-2xl border border-(--pertama) bg-(--kesembilan) p-8 shadow-xl transition-all duration-300">
            {error ? (
               <div className="flex flex-col items-center text-center">
                  <XCircle size={72} className="text-red-500" />

                  <h1 className="mt-6 text-2xl font-bold text-(--pertama)">
                     Verification Failed
                  </h1>

                  <p className="mt-3 text-sm text-(--keenam) leading-relaxed max-w-md">
                     Sesi absensi ini tidak valid atau tidak terdaftar di database resmi Laboratorium Psikologi. Harap pastikan QR Code absensi berasal dari sistem resmi PsychoLab.
                  </p>

                  <div className="mt-8 w-full border-t border-(--ketiga) pt-6">
                     <Button
                        onClick={() => router.replace("/")}
                        className="w-full h-12 flex items-center justify-center gap-2 text-base font-semibold"
                     >
                        <ArrowLeft size={18} />
                        Back to Home
                     </Button>
                  </div>
               </div>
            ) : (
               session && (
                  <div className="flex flex-col">
                     <div className="flex flex-col items-center text-center">
                        <CheckCircle2 size={72} className="text-(--ketujuh)" />

                        <div className="mt-6 inline-flex overflow-hidden rounded-lg text-xs font-semibold shadow-sm border border-(--ketiga)">
                           <span className="bg-(--pertama) px-3 py-2 text-(--kedua) flex items-center justify-center">
                              Verified Attendance
                           </span>

                           <span className="bg-(--ketujuh)/80 px-3 py-2 text-(--kedua) flex items-center justify-center">
                              Database Recorded
                           </span>
                        </div>
                     </div>

                     <div className="mt-6 space-y-4 rounded-xl bg-(--pertama) p-6 text-sm text-(--kedua) shadow-inner">
                        <div className="flex items-center justify-between border-b border-(--kedua)/10 pb-3">
                           <span className="font-medium text-(--kedua)/70">Session Code</span>
                           <span className="font-bold text-lg">PL-{session.id}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-(--kedua)/10 pb-3">
                           <span className="flex items-center gap-2 font-medium text-(--kedua)/70">
                              <UserCheck size={16} />
                              Participant
                           </span>
                           <span className="font-semibold text-right">{session.user_name}</span>
                        </div>

                        <div className="flex items-center justify-between border-b border-(--kedua)/10 pb-3">
                           <span className="flex items-center gap-2 font-medium text-(--kedua)/70">
                              <Clock size={16} />
                              Check-In Time
                           </span>
                           <span className="font-semibold text-right">
                              {formatAttendanceDate(session.attendance_time)}
                           </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-(--kedua)/10 pb-3">
                           <span className="flex items-center gap-2 font-medium text-(--kedua)/70">
                              <Clock size={16} />
                              Check-Out Time
                           </span>
                           <span className="font-semibold text-right">
                              {session.checkout_time
                                 ? formatAttendanceDate(session.checkout_time)
                                 : "In Progress"}
                           </span>
                        </div>

                        <div className="flex items-center justify-between border-b border-(--kedua)/10 pb-3">
                           <span className="font-medium text-(--kedua)/70">Checkpoint Status</span>
                           <span
                              className={`text-sm font-semibold ${
                                 session.checkpoint_time !== null ? "text-emerald-600" : "text-amber-600"
                              }`}
                           >
                              {session.checkpoint_time !== null ? "Completed" : "Missed"}
                           </span>
                        </div>

                        <div className="flex items-center justify-between pt-1">
                           <span className="flex items-center gap-2 font-medium text-(--kedua)/70">
                              <MapPin size={16} />
                              Location
                           </span>
                           <span className="font-semibold text-right max-w-[200px] truncate">
                              {session.location_name}
                           </span>
                        </div>
                     </div>

                     <div className="mt-8 flex flex-col gap-3">
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col items-center justify-center rounded-lg border border-(--pertama) bg-(--kesembilan) p-3 text-center">
                              <span className="text-xs text-(--keenam)">Face Verified</span>
                              <span className="mt-1 text-sm font-bold text-(--pertama)">
                                 {session.face_verified ? "YES" : "NO"}
                              </span>
                           </div>

                           <div className="flex flex-col items-center justify-center rounded-lg border border-(--pertama) bg-(--kesembilan) p-3 text-center">
                              <span className="text-xs text-(--keenam)">Liveness Detection</span>
                              <span className="mt-1 text-sm font-bold text-(--pertama)">
                                 {session.liveness_verified ? "YES" : "NO"}
                              </span>
                           </div>
                        </div>

                        <Button
                           onClick={() => router.replace("/")}
                           className="mt-3 w-full h-12 flex items-center justify-center gap-2 text-base font-semibold"
                        >
                           <ArrowLeft size={18} />
                           Back to Home
                        </Button>
                     </div>
                  </div>
               )
            )}
         </div>
      </div>
   );
};

export default VerifyPage;
