import { CheckSquare, Loader2 } from "lucide-react";

type ValidationStatusProps = {
   mode: string;
   detectedFaceName: string | null;
   isLocationPassed: boolean;
   isLocationProcessing: boolean;
   onVerifyLocation: () => void;
   isFaceVerified: boolean;
   isFaceProcessing: boolean;
   onVerifyFace: () => void;
   currentChallenge: string | null;
   completedChallenges: string[];
   isLivenessVerified: boolean;
   isLivenessProcessing: boolean;
   onVerifyLiveness: () => void;
   isAttendanceReady: boolean;
   isSubmittingAttendance: boolean;
   onAttendance: () => void;
};

const PassBadge = ({
   children,
}: {
   children: string;
}) => (
   <div className="flex h-10 min-w-0 items-center justify-center gap-0 sm:gap-2 rounded-md bg-teal-100 px-4 text-sm font-semibold text-(--ketujuh) xl:bg-white">
      <CheckSquare size={18} className="hidden sm:block" />
      {children}
   </div>
);

const PendingBadge = ({
   children,
}: {
   children: string;
}) => (
   <div className="flex h-10 min-w-0 items-center justify-center rounded-md bg-(--ketiga) px-4 text-sm font-semibold text-(--pertama) xl:bg-white/15 xl:text-white">
      {children}
   </div>
);

export const ValidationStatus = ({
   mode,
   detectedFaceName,
   isFaceVerified,
   isFaceProcessing,
   onVerifyFace,
   currentChallenge,
   completedChallenges,
   isLivenessVerified,
   isLivenessProcessing,
   onVerifyLiveness,
   isAttendanceReady,
   isSubmittingAttendance,
   onAttendance,
}: ValidationStatusProps) => {
   const attendanceButtonLabel =
      mode === "attendance"
         ? "Attendance Now"
         : mode === "checkpoint"
            ? "Midday Checkpoint"
            : "Check Out";

   const mobileButtonLabel =
      !isFaceVerified
         ? isFaceProcessing
            ? "Processing Biometric..."
            : "Verify Biometric"
         : mode === "attendance" &&
              !isLivenessVerified
            ? isLivenessProcessing
               ? "Processing Liveness..."
               : "Verify Liveness"
            : isSubmittingAttendance
               ? "Processing..."
               : attendanceButtonLabel;

   const handleMobileAction =
      () => {
         if (
            !isFaceVerified
         ) {
            onVerifyFace();
            return;
         }

         if (
            mode === "attendance" &&
            !isLivenessVerified
         ) {
            onVerifyLiveness();
            return;
         }

         onAttendance();
      };

   const isMobileButtonDisabled =
      isFaceProcessing ||
      isLivenessProcessing ||
      isSubmittingAttendance ||
      (
         isFaceVerified &&
         (
            mode !== "attendance" ||
            isLivenessVerified
         ) &&
         !isAttendanceReady
      );

   return (
      <div className="flex h-full flex-col gap-3 xl:gap-5">
         <div className="flex flex-col gap-3 rounded-xl border border-(--pertama) p-4 xl:flex-1 xl:border-0 xl:bg-(--pertama) xl:p-6">
            {isAttendanceReady && (
               <div className="flex h-10 items-center justify-center gap-3 rounded-md bg-teal-100 text-base font-semibold text-(--ketujuh)">
                  <CheckSquare size={20} />
                  All Check Pass
               </div>
            )}

            <div className="space-y-3 xl:space-y-5">
               <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                     <p className="text-base font-semibold text-(--pertama) xl:text-white">
                        Biometric Match :
                     </p>

                     {isFaceVerified ? (
                        <PassBadge>
                           Pass
                        </PassBadge>
                     ) : (
                        <PendingBadge>
                           {isFaceProcessing
                              ? "Processing"
                              : "Pending"}
                        </PendingBadge>
                     )}
                  </div>

                  {detectedFaceName && (
                     <div className="rounded-md bg-(--pertama)/10 p-3 xl:bg-white/10">
                        <p className="text-xs text-(--keenam) xl:text-white/70">
                           Detected Face
                        </p>

                        <p className="mt-1 text-lg font-semibold text-(--pertama) xl:text-white">
                           {
                              detectedFaceName
                           }
                        </p>
                     </div>
                  )}
               </div>

               {mode === "attendance" && (
                  <div className="space-y-3">
                     <div className="flex items-center justify-between gap-4">
                        <p className="text-base font-semibold text-(--pertama) xl:text-white">
                           Liveness Check :
                        </p>

                        {isLivenessVerified ? (
                           <PassBadge>
                              Pass
                           </PassBadge>
                        ) : (
                           <PendingBadge>
                              {isLivenessProcessing
                                 ? "Processing"
                                 : "Pending"}
                           </PendingBadge>
                        )}
                     </div>

                     {currentChallenge && (
                        <div className="rounded-md border border-(--pertama) bg-(--kedua) p-4 xl:border-white/20 xl:bg-white">
                           <p className="text-sm text-(--pertama) xl:text-(--pertama)">
                              Expression :
                           </p>

                           <p className="mt-1 text-lg font-semibold capitalize text-(--pertama)">
                              {
                                 currentChallenge
                              }
                           </p>

                           <p className="mt-2 text-xs text-(--keenam)">
                              {
                                 completedChallenges.length
                              }
                              /2 completed
                           </p>
                        </div>
                     )}
                  </div>
               )}
            </div>
         </div>

         <button
            type="button"
            onClick={handleMobileAction}

            disabled={isMobileButtonDisabled}

            className="hidden h-26 cursor-pointer items-center justify-center gap-4 rounded-md bg-(--pertama) px-6 text-2xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 xl:flex"
         >
            {isFaceProcessing || isLivenessProcessing || isSubmittingAttendance ? (
               <Loader2 size={28} className="animate-spin" />
            ) : (
               <CheckSquare size={28} />
            )}

            {mobileButtonLabel}
         </button>

         <button
            type="button"
            onClick={handleMobileAction}
            disabled={isMobileButtonDisabled}
            className="flex h-16 cursor-pointer items-center justify-center gap-4 rounded-md bg-(--pertama) px-6 text-lg font-semibold text-white shadow-md disabled:cursor-not-allowed disabled:opacity-50 xl:hidden"
         >
            {isFaceProcessing || isLivenessProcessing || isSubmittingAttendance ? (
               <Loader2 size={26} className="animate-spin" />
            ) : (
               <CheckSquare size={26} />
            )}
            {mobileButtonLabel}
         </button>
      </div>
   );
};
