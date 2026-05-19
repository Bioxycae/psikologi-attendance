"use client";

import {
   CheckSquare,
   MapPinCheck,
   ScanFace,
   Loader2,
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

   const liveness =
      useLivenessVerification(
         camera.videoRef,
         camera.isCameraOpened,
         face.isFaceVerified
      );

   const isAttendanceReady =
      location.isLocationPassed &&
      face.isFaceVerified &&
      (
         isAttendanceMode
            ? liveness.isLivenessVerified
            : true
      );

   const handleVerifyFace =
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

         await face.handleVerifyFace();
      };

   const handleVerifyLiveness =
      async () => {
         if (
            !camera.isCameraOpened
         ) {
            toast.error(
               "Open camera first"
            );

            return;
         }

         if (
            !face.isFaceVerified
         ) {
            toast.error(
               "Verify face first"
            );

            return;
         }

         await liveness.handleVerifyLiveness();
      };

   return (
      <div className="flex min-h-full flex-col gap-5 lg:h-full lg:gap-6">
         <div className="shrink-0 rounded-xl border border-(--pertama) p-4 lg:px-8 lg:py-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
               <div>
                  <h1 className="text-3xl font-semibold text-(--pertama)">
                     Validate
                  </h1>

                  <p className="mt-5 max-w-72 text-base leading-6 text-(--keenam) lg:mt-1 lg:max-w-none lg:text-sm">
                     Verify yourself and ensure your location is accurate.
                  </p>
               </div>

               <div className="grid grid-cols-2 gap-2 lg:flex lg:items-center lg:gap-3">
                  {location.isLocationPassed ? (
                     <div className="flex h-14 sm:h-22 min-w-16 sm:min-w-22 flex-col items-center justify-center gap-1 sm:gap-2 rounded-md bg-teal-100 px-3 sm:px-4 text-sm sm:text-base font-semibold text-(--ketujuh) lg:h-26">
                        <CheckSquare size={22} className="hidden sm:block" />
                        Pass
                     </div>
                  ) : (
                     <button
                        type="button"
                        onClick={
                           location.handleLocationCheck
                        }

                        disabled={
                           location.isLoading || attendanceMode === "completed"
                        }

                        className="flex h-14 sm:h-22 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 sm:gap-2 rounded-md bg-(--pertama) px-3 sm:px-4 text-sm sm:text-base font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50 lg:h-26 lg:min-w-45"
                     >
                        {location.isLoading ? (
                           <Loader2 size={24} className="hidden sm:block animate-spin" />
                        ) : (
                           <MapPinCheck size={24} className="hidden sm:block" />
                        )}

                        {location.isLoading
                           ? "Checking..."
                           : "Location Check"}
                     </button>
                  )}

                  <button
                     type="button"
                     onClick={
                        camera.handleOpenCamera
                     }

                     disabled={
                        !location.isLocationPassed || attendanceMode === "completed" || camera.isCameraLoading
                     }

                     className="flex h-14 sm:h-22 min-w-0 cursor-pointer flex-col items-center justify-center gap-1 sm:gap-2 rounded-md bg-(--pertama) px-3 sm:px-4 text-sm sm:text-base font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-500 disabled:opacity-90 lg:h-26 lg:min-w-35"
                  >
                     {camera.isCameraLoading ? (
                        <Loader2 size={24} className="hidden sm:block animate-spin" />
                     ) : (
                        <ScanFace size={24} className="hidden sm:block" />
                     )}
                     {camera.isCameraLoading ? "Opening..." : "Open Cam"}
                  </button>
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

                  {attendance.todayAttendance.checkpoint_verified && (
                     <p className="mt-1 text-sm text-amber-600">
                        Midday checkpoint completed
                     </p>
                  )}

                  {attendance.todayAttendance.checkout_verified &&
                     attendance.todayAttendance.checkpoint_verified && (
                        <p className="mt-1 text-sm text-emerald-600">
                           Session completed
                        </p>
                     )}

                  {attendance.todayAttendance.checkout_verified &&
                     !attendance.todayAttendance.checkpoint_verified && (
                        <p className="mt-1 text-sm text-amber-600">
                           Checkpoint missed
                        </p>
                     )}
               </div>
            )}

         {!location.isLocationPassed ? (
            <div className="flex min-h-34 items-center justify-center rounded-xl border border-(--pertama) px-8 lg:min-h-34">
               <h2 className="text-center text-lg font-semibold leading-8 text-(--pertama) lg:text-3xl">
                  Verify your location first via the <span className="font-bold">top menu</span>, then open the camera.
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

                     onVerifyFace={
                        handleVerifyFace
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

                     onVerifyLiveness={
                        handleVerifyLiveness
                     }

                     isAttendanceReady={
                        isAttendanceReady
                     }

                     isSubmittingAttendance={
                        attendance.isSubmittingAttendance
                     }

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
