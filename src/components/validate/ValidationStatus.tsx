import { CheckSquare, Loader2, RefreshCcw } from "lucide-react";

type ValidationStatusProps = {
   mode: string;
   onSwitchCamera: () => void;
   detectedFaceName: string | null;
   isLocationPassed: boolean;
   isLocationProcessing: boolean;
   onVerifyLocation: () => void;
   isFaceVerified: boolean;
   isFaceProcessing: boolean;
   isAutoVerifying: boolean;
   onStartVerification: () => void;
   onStopVerification: () => void;
   currentChallenge: string | null;
   completedChallenges: string[];
   isLivenessVerified: boolean;
   isLivenessProcessing: boolean;
   isAttendanceReady: boolean;
   isSubmittingAttendance: boolean;
   onAttendance: () => void;
};

const PassBadge = ({
   children,
}: {
   children: React.ReactNode;
}) => (
   <div className="flex h-10 w-32 sm:w-40 min-w-0 shrink-0 items-center justify-center gap-1 sm:gap-2 rounded-md bg-teal-100 px-2 sm:px-4 text-xs sm:text-sm font-semibold text-(--ketujuh) xl:bg-white">
      <CheckSquare size={16} className="hidden sm:block shrink-0" />
      <span className="truncate">{children}</span>
   </div>
);

const PendingBadge = ({
   children,
}: {
   children: React.ReactNode;
}) => (
   <div className="flex h-10 w-32 sm:w-40 min-w-0 shrink-0 items-center justify-center rounded-md bg-(--ketiga) px-2 sm:px-4 text-xs sm:text-sm font-semibold text-(--pertama) xl:bg-white/15 xl:text-white">
      <span className="truncate">{children}</span>
   </div>
);

const ChallengeBadge = ({
   children,
}: {
   children: React.ReactNode;
}) => (
   <div className="flex h-10 w-32 sm:w-40 min-w-0 shrink-0 items-center justify-center rounded-md bg-orange-100 px-2 sm:px-4 text-xs sm:text-sm font-semibold capitalize text-orange-700 xl:bg-orange-500/20 xl:text-orange-300">
      <span className="truncate">{children}</span>
   </div>
);

export const ValidationStatus = ({
   mode,
   detectedFaceName,
   isFaceVerified,
   isFaceProcessing,
   isAutoVerifying,
   onStartVerification,
   onStopVerification,
   currentChallenge,
   completedChallenges,
   isLivenessVerified,
   isLivenessProcessing,
   isAttendanceReady,
   isSubmittingAttendance,
   onAttendance,
   onSwitchCamera,
}: ValidationStatusProps) => {
   const attendanceButtonLabel =
      mode === "attendance"
         ? "Attendance Now"
         : mode === "checkpoint"
            ? "Midday Checkpoint"
            : "Check Out";

   const mobileButtonLabel =
      isSubmittingAttendance
         ? "Processing..."
         : isAttendanceReady
            ? attendanceButtonLabel
            : !isFaceVerified
               ? isAutoVerifying
                  ? "Scanning Face..."
                  : isFaceProcessing
                     ? "Processing Biometric..."
                     : "Start Verification"
               : mode === "attendance" && !isLivenessVerified
                  ? isLivenessProcessing
                     ? currentChallenge ? `Please ${currentChallenge}...` : "Processing Liveness..."
                     : "Starting Liveness..."
                  : attendanceButtonLabel;

   const handleMobileAction =
      () => {
         if (isAttendanceReady) {
            onAttendance();
            return;
         }

         if (!isFaceVerified && !isAutoVerifying) {
            onStartVerification();
         }
      };

   const isMobileButtonDisabled =
      isFaceProcessing ||
      isAutoVerifying ||
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

   const isVerificationRunning = isAutoVerifying || isLivenessProcessing;

   return (
      <div className="flex h-full flex-col gap-3 xl:gap-5">
         <div className="flex flex-col gap-3 rounded-xl border border-(--pertama) p-4 xl:flex-1 xl:border-0 xl:bg-(--pertama) xl:p-6">
            {isAttendanceReady && (
               <div className="hidden xl:flex h-10 items-center justify-center gap-3 rounded-md bg-teal-100 text-base font-semibold text-(--ketujuh)">
                  <CheckSquare size={20} />
                  All Check Pass
               </div>
            )}

            <div className="space-y-3 xl:space-y-5">
               <div className="space-y-2">
                  <div className="flex items-center justify-between gap-3">
                     <p className="text-sm sm:text-base font-semibold text-(--pertama) xl:text-white">
                        Biometric Match :
                     </p>

                     {isFaceVerified ? (
                        <PassBadge>
                           {detectedFaceName || "Pass"}
                        </PassBadge>
                     ) : (
                        <PendingBadge>
                           {isFaceProcessing
                              ? "Processing"
                              : isAutoVerifying
                                 ? "Scanning..."
                                 : "Pending"}
                        </PendingBadge>
                     )}
                  </div>
               </div>

               {mode === "attendance" && (
                  <div className="space-y-3">
                     <div className="flex items-center justify-between gap-4">
                        <p className="text-sm sm:text-base font-semibold text-(--pertama) xl:text-white">
                           Liveness Check :
                        </p>

                        {isLivenessVerified ? (
                           <PassBadge>
                              Verified
                           </PassBadge>
                        ) : currentChallenge ? (
                           <ChallengeBadge>
                              {currentChallenge} {completedChallenges.length}/2
                           </ChallengeBadge>
                        ) : (
                           <PendingBadge>
                              {isLivenessProcessing
                                 ? "Processing"
                                 : "Pending"}
                           </PendingBadge>
                        )}
                     </div>

                     {currentChallenge && (
                        <div className="hidden rounded-md border border-(--pertama) bg-(--kedua) p-4 xl:block xl:border-white/20 xl:bg-white">
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

         <div className="hidden xl:flex flex-col gap-3">
            <button
               type="button"
               onClick={handleMobileAction}
               disabled={isMobileButtonDisabled}
               className="flex h-26 cursor-pointer items-center justify-center gap-4 rounded-md bg-(--pertama) px-6 text-2xl font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
               {isFaceProcessing || isAutoVerifying || isLivenessProcessing || isSubmittingAttendance ? (
                  <Loader2 size={28} className="animate-spin" />
               ) : (
                  <CheckSquare size={28} />
               )}
               {mobileButtonLabel}
            </button>
            {isVerificationRunning && (
               <button
                  type="button"
                  onClick={onStopVerification}
                  className="flex h-14 cursor-pointer items-center justify-center gap-2 rounded-md bg-red-100 text-red-600 font-semibold hover:bg-red-200 transition-colors"
               >
                  Stop Verification
               </button>
            )}
         </div>

         <div className="fixed bottom-6 left-1/2 z-40 flex w-11/12 -translate-x-1/2 flex-col gap-3 xl:static xl:w-auto xl:translate-x-0 xl:hidden">
            <div className="flex gap-3">
               <button
                  type="button"
                  onClick={onSwitchCamera}
                  className="flex h-14 w-14 sm:h-16 sm:w-16 shrink-0 cursor-pointer items-center justify-center rounded-md bg-(--pertama) text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-colors hover:bg-slate-700 active:scale-95"
               >
                  <RefreshCcw size={24} className="sm:w-[26px] sm:h-[26px]" />
               </button>
               <button
                  type="button"
                  onClick={handleMobileAction}
                  disabled={isMobileButtonDisabled}
                  className="flex h-14 sm:h-16 min-w-0 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md bg-(--pertama) px-2 sm:px-6 text-sm sm:text-lg font-semibold whitespace-nowrap text-white shadow-[0_4px_14px_rgba(0,0,0,0.25)] transition-colors hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50 active:scale-95"
               >
                  {isFaceProcessing || isAutoVerifying || isLivenessProcessing || isSubmittingAttendance ? (
                     <Loader2 size={22} className="animate-spin shrink-0" />
                  ) : (
                     <CheckSquare size={22} className="shrink-0" />
                  )}
                  <span className="truncate">{mobileButtonLabel}</span>
               </button>
            </div>
            {isVerificationRunning && (
               <button
                  type="button"
                  onClick={onStopVerification}
                  className="flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-md bg-red-100 text-red-600 font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:bg-red-200 transition-colors"
               >
                  Stop Verification
               </button>
            )}
         </div>
      </div>
   );
};
