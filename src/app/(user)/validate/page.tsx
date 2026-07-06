"use client";

import { useEffect } from "react";
import {
   CheckSquare,
   MapPinCheck,
   ScanFace,
   Loader2,
   RefreshCcw,
   CheckCircle,
   XCircle,
   Clock,
} from "lucide-react";

import { toast } from "sonner";

import { formatAttendanceDate } from "@/utils/formatDate";

import { CameraSection } from "@/components/validate/CameraSection";
import { ValidationStatus } from "@/components/validate/ValidationStatus";

import { useAttendance } from "@/hooks/useAttendance";
import { useCamera } from "@/hooks/useCamera";
import { useFaceVerification } from "@/hooks/useFaceVerification";
import { useLivenessVerification } from "@/hooks/useLivenessVerification";
import { useLocationVerification } from "@/hooks/useLocationVerification";
import { useFaceModelStatus } from "@/hooks/useFaceModelStatus";

const ValidatePage = () => {
   const isModelLoaded = useFaceModelStatus();

   const camera =
      useCamera();

   const location =
      useLocationVerification();

   const face =
      useFaceVerification(
         camera.videoRef
      );

   const attendance =
      useAttendance();

   const attendanceMode =
      attendance.getAttendanceMode(
         attendance.todayAttendance
      );

   const isAttendanceMode =
      attendanceMode ===
      "attendance";

   const handleStopVerification = () => {
      face.stopAutoVerification();
      face.resetFaceVerification();
      liveness.stopLivenessVerification();
   };

   const liveness =
      useLivenessVerification(
         camera.videoRef,
         camera.isCameraOpened,
         face.isFaceVerified,
         handleStopVerification
      );

   const isAttendanceReady =
      location.isLocationPassed &&
      face.isFaceVerified &&
      (
         isAttendanceMode
            ? liveness.isLivenessVerified
            : true
      );

   useEffect(() => {
      if (
         location.isLocationPassed && 
         !attendance.isInitialLoading &&
         attendanceMode !== "completed" &&
         !camera.isCameraOpened && 
         !camera.isCameraLoading
      ) {
         camera.handleOpenCamera();
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [location.isLocationPassed, attendance.isInitialLoading, attendanceMode]);

   useEffect(() => {
      if (face.isFaceVerified && isAttendanceMode && !liveness.isLivenessProcessing && !liveness.isLivenessVerified) {
         liveness.handleVerifyLiveness();
      }
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [face.isFaceVerified, isAttendanceMode]);

   const handleStartVerification =
      async () => {
         if (
            !location.isLocationPassed
         ) {
            toast.error(
               "Verify location first"
            );

            return;
         }

         if (
            !camera.isCameraOpened
         ) {
            toast.error(
               "Open camera first"
            );

            return;
         }

         if (!isModelLoaded) {
            toast.error(
               "AI Models are loading, please wait..."
            );

            return;
         }

         await face.startAutoVerification();
      };

   const handleSwitchCamera = () => {
      if (camera.cameraDevices.length <= 1) return;
      const currentIndex = camera.cameraDevices.findIndex(d => d.deviceId === camera.selectedCamera);
      const nextIndex = (currentIndex + 1) % camera.cameraDevices.length;
      camera.setSelectedCamera(camera.cameraDevices[nextIndex].deviceId);
   };

   if (attendance.isInitialLoading) {
      return (
         <div className="flex h-full min-h-[400px] items-center justify-center rounded-xl border border-(--pertama)">
            <Loader2 size={32} className="animate-spin text-(--pertama)" />
         </div>
      );
   }

   return (
      <div className="flex min-h-full flex-col gap-5 pb-32 lg:h-full lg:gap-6 lg:pb-0">
         <div className={`shrink-0 rounded-xl border border-(--pertama) ${location.isLocationPassed ? "p-4 lg:px-6 lg:py-3" : "p-4 lg:px-8 lg:py-4"}`}>
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
               <div className={location.isLocationPassed ? "hidden lg:block" : "block"}>
                  <h1 className={`${location.isLocationPassed ? "text-xl" : "text-3xl"} font-semibold text-(--pertama)`}>
                     Validate
                  </h1>

                  {!location.isLocationPassed && (
                     <p className="mt-5 max-w-72 text-base leading-6 text-(--keenam) lg:mt-1 lg:max-w-none lg:text-sm">
                        Verify yourself and ensure your location is accurate.
                     </p>
                  )}
               </div>

               <div className={`flex w-full ${location.isLocationPassed || attendanceMode === "completed" ? "flex-row items-center justify-between lg:w-auto lg:justify-end lg:gap-3" : "flex-col gap-3 lg:w-auto lg:flex-row lg:items-center"}`}>
                  {attendanceMode === "completed" ? (
                     <button
                        type="button"
                        disabled
                        className="flex h-14 w-full sm:h-22 lg:w-auto min-w-0 flex-col items-center justify-center gap-1 sm:gap-2 rounded-md bg-(--pertama) px-2 sm:px-4 text-[13px] sm:text-base font-semibold whitespace-nowrap text-white cursor-not-allowed opacity-50 lg:h-26 lg:min-w-45"
                     >
                        <CheckSquare size={24} className="hidden sm:block shrink-0" />
                        <span className="truncate">Location Completed</span>
                     </button>
                  ) : location.isLocationPassed ? (
                     <>
                        <div className="flex h-10 items-center justify-center gap-2 rounded-md bg-teal-100 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-(--ketujuh) lg:h-11">
                           <CheckSquare size={16} />
                           Location Pass
                        </div>

                        <button
                           type="button"
                           onClick={() => {
                              location.setIsLocationPassed(false);
                              sessionStorage.removeItem("verifiedLocation");
                              camera.handleCloseCamera();
                              face.resetFaceVerification();
                           }}
                           className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-md bg-orange-100 px-3 sm:px-4 text-xs sm:text-sm font-semibold text-orange-700 transition-colors hover:bg-orange-200 lg:h-11"
                        >
                           <RefreshCcw size={16} />
                           Relocate
                        </button>
                     </>
                  ) : (
                     <button
                        type="button"
                        onClick={
                           location.handleLocationCheck
                        }

                        disabled={
                           location.isLoading
                        }

                        className="flex h-14 w-full sm:h-22 lg:w-auto min-w-0 cursor-pointer flex-col items-center justify-center gap-1 sm:gap-2 rounded-md bg-(--pertama) px-2 sm:px-4 text-[13px] sm:text-base font-semibold whitespace-nowrap text-white disabled:cursor-not-allowed disabled:opacity-50 lg:h-26 lg:min-w-45"
                     >
                        {location.isLoading ? (
                           <Loader2 size={24} className="hidden sm:block animate-spin shrink-0" />
                        ) : (
                           <MapPinCheck size={24} className="hidden sm:block shrink-0" />
                        )}

                        <span className="truncate">
                           {location.isLoading ? "Checking..." : "Location Check"}
                        </span>
                     </button>
                  )}
               </div>
            </div>
         </div>

         {attendance.todayAttendance &&
            !location.isLocationPassed && (
               <div className="rounded-xl border border-amber-200 bg-amber-50 px-5 py-4">
                  <h2 className="text-lg font-semibold text-amber-700">
                     Today session detected
                  </h2>

                  <p className="mt-1 text-sm text-amber-600">
                     Attendance time :
                     {" "}
                     {formatAttendanceDate(
                        attendance.todayAttendance.attendance_time
                     )}
                  </p>

                  {attendance.todayAttendance.checkpoint_time !== null && (
                     <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1 text-sm font-medium text-emerald-700">
                        <CheckCircle size={14} />
                        Checkpoint Completed
                     </div>
                  )}
                  {attendance.todayAttendance.checkpoint_time === null && (
                     attendance.todayAttendance.checkout_time !== null && (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-sm font-medium text-red-700">
                           <XCircle size={14} />
                           Checkpoint Missed
                        </div>
                     )
                  )}
                  {attendance.todayAttendance.checkpoint_time === null && (
                     attendance.todayAttendance.checkout_time === null && (
                        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-700">
                           <Clock size={14} />
                           Waiting for Checkpoint
                        </div>
                     )
                  )}
               </div>
            )}

         {!location.isLocationPassed ? (
            <div className="flex min-h-34 flex-col items-center justify-center gap-6 rounded-xl border border-(--pertama) px-6 py-8 lg:min-h-34">
               <div className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-5 py-6 text-center">
                  <h3 className="text-3xl font-bold text-amber-700">
                     Smartphone Recommended
                  </h3>
                  <p className="mt-3 text-base font-medium text-amber-600 lg:text-lg">
                     For optimal GPS accuracy, please use a smartphone. PC or laptop locations may be inaccurate.
                  </p>
               </div>

               <h2 className="text-center text-lg font-semibold leading-8 text-(--pertama) lg:text-xl">
                  Please verify your location using the <span className="font-bold">Location Check</span> button above before opening the camera.
               </h2>
            </div>
         ) : attendanceMode === "completed" ? (
            <div className="flex min-h-0 flex-1 items-center justify-center rounded-xl border border-(--pertama)">
               <div className="text-center">
                  <h2 className="text-3xl font-semibold text-(--pertama)">
                     Today session completed
                  </h2>

                  <p className="mt-3 text-sm text-(--keenam)">
                     You have completed attendance, checkpoint, and checkout for today.
                  </p>
               </div>
            </div>
         ) : (
            <div className="grid grid-cols-1 gap-3 xl:min-h-0 xl:flex-1 xl:grid-cols-12 xl:gap-6">
               <div className="min-h-0 xl:col-span-9">
                  <CameraSection
                     videoRef={
                        camera.videoRef
                     }

                     cameraDevices={
                        camera.cameraDevices
                     }

                     selectedCamera={
                        camera.selectedCamera
                     }

                     setSelectedCamera={
                        camera.setSelectedCamera
                     }

                     isCameraLoading={
                        camera.isCameraLoading
                     }

                     isCameraOpened={
                        camera.isCameraOpened
                     }

                     isModelLoaded={
                        isModelLoaded
                     }
                  />
               </div>

               <div className="min-h-0 xl:col-span-3">
                  <ValidationStatus
                     mode={
                        attendanceMode
                     }

                     detectedFaceName={
                        face.matchedUser
                     }

                     isLocationPassed={
                        location.isLocationPassed
                     }

                     isLocationProcessing={
                        location.isLoading
                     }

                     onVerifyLocation={
                        location.handleLocationCheck
                     }

                     isFaceVerified={
                        face.isFaceVerified
                     }

                     isFaceProcessing={
                        face.isFaceProcessing
                     }

                     isAutoVerifying={
                        face.isAutoVerifying
                     }

                     onStartVerification={
                        handleStartVerification
                     }

                     onStopVerification={
                        handleStopVerification
                     }

                     currentChallenge={
                        liveness.currentChallenge
                     }

                     completedChallenges={
                        liveness.completedChallenges
                     }

                     isLivenessVerified={
                        liveness.isLivenessVerified
                     }

                     isLivenessProcessing={
                        liveness.isLivenessProcessing
                     }

                     isAttendanceReady={
                        isAttendanceReady
                     }

                     isSubmittingAttendance={
                        attendance.isSubmittingAttendance
                     }

                     onSwitchCamera={handleSwitchCamera}

                     onAttendance={() =>
                        attendance.handleAttendance({
                           matchedUser:
                              face.matchedUser,

                           coordinates:
                              location.coordinates,

                           locationName:
                              location.locationName,

                           isFaceVerified:
                              face.isFaceVerified,

                           isLivenessVerified:
                              liveness.isLivenessVerified,

                           resetVerification:
                              () => {
                                 face.setIsFaceVerified(
                                    false
                                 );

                                 face.setMatchedUser(
                                    null
                                 );

                                 liveness.setIsLivenessVerified(
                                    false
                                 );

                                 liveness.setCompletedChallenges(
                                    []
                                 );

                                 liveness.setCurrentChallengeIndex(
                                    0
                                 );
                              },
                        })
                     }
                  />
               </div>
            </div>
         )}
      </div>
   );
};

export default ValidatePage;
