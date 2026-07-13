import { CheckSquare, Loader2 } from "lucide-react";

type ValidationStatusProps = {
   mode: string;

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
   <div className="flex min-h-10 w-auto min-w-0 max-w-full items-center justify-center gap-1 sm:gap-2 rounded-md bg-teal-100 px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-(--ketujuh) xl:bg-white">
      <CheckSquare size={16} className="hidden sm:block shrink-0" />
      <span className="break-words text-center">{children}</span>
   </div>
);

const PendingBadge = ({
   children,
}: {
   children: React.ReactNode;
}) => (
   <div className="flex min-h-10 w-auto min-w-0 max-w-full items-center justify-center rounded-md bg-(--ketiga) px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold text-(--pertama) xl:bg-white/15 xl:text-white">
      <span className="break-words text-center">{children}</span>
   </div>
);

const ChallengeBadge = ({
   children,
}: {
   children: React.ReactNode;
}) => (
   <div className="flex min-h-10 w-auto min-w-0 max-w-full items-center justify-center rounded-md bg-orange-100 px-3 py-2 sm:px-4 text-xs sm:text-sm font-semibold capitalize text-orange-700 xl:bg-orange-500/20 xl:text-orange-300">
      <span className="break-words text-center">{children}</span>
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
               : !isLivenessVerified
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
         !isLivenessVerified
      ) ||
      (
         isFaceVerified &&
         isLivenessVerified &&
         !isAttendanceReady
      );

   const isVerificationRunning = isAutoVerifying || isLivenessProcessing;

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
                  <div className="flex flex-row flex-wrap items-center justify-between gap-2 xl:gap-3">
                     <p className="min-w-0 text-sm sm:text-base font-semibold text-(--pertama) xl:text-white">
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

               <div className="space-y-3">
                     <div className="flex flex-row flex-wrap items-center justify-between gap-2 xl:gap-3">
                        <p className="min-w-0 text-sm sm:text-base font-semibold text-(--pertama) xl:text-white">
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
               </div>
         </div>

         <div className="fixed bottom-0 left-0 right-0 z-40 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] md:static md:z-auto md:w-full md:p-0 md:pb-0 pointer-events-none">
            <div className="mx-auto w-full max-w-lg md:max-w-none pointer-events-auto flex flex-col gap-3">
               {isVerificationRunning ? (
                  <button
                     type="button"
                     onClick={onStopVerification}
                     className="flex w-full min-h-14 md:h-auto xl:h-[82px] cursor-pointer items-center justify-center gap-2 rounded-md bg-red-100 px-4 py-3 text-center text-sm sm:text-base font-semibold text-red-600 hover:bg-red-200 transition-colors shadow-lg md:shadow-none whitespace-nowrap"
                  >
                     <Loader2 size={22} className="animate-spin shrink-0" />
                     Stop Verification
                  </button>
               ) : (
                  <button
                     type="button"
                     onClick={handleMobileAction}
                     disabled={isMobileButtonDisabled}
                     className="flex w-full min-h-14 md:h-auto xl:h-[82px] cursor-pointer items-center justify-center gap-2 rounded-md bg-(--pertama) px-4 py-3 text-center text-sm sm:text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 shadow-lg md:shadow-none whitespace-nowrap"
                  >
                     {isFaceProcessing || isAutoVerifying || isLivenessProcessing || isSubmittingAttendance ? (
                        <Loader2 size={22} className="animate-spin shrink-0" />
                     ) : (
                        <CheckSquare size={22} className="shrink-0" />
                     )}
                     {mobileButtonLabel}
                  </button>
               )}
            </div>
         </div>


      </div>
   );
};
