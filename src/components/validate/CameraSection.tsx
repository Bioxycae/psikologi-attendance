import { ChevronUp, ScanFace, SwitchCamera } from "lucide-react";
import React, { useState } from "react";

type CameraDevice = {
   deviceId: string;
   label: string;
};

type CameraSectionProps = {
   videoRef: React.RefObject<HTMLVideoElement | null>;
   cameraDevices: CameraDevice[];
   selectedCamera: string;
   setSelectedCamera: (value: string) => void;
   isCameraLoading: boolean;
   isCameraOpened: boolean;
   isModelLoaded: boolean;
   faceStatusMessage?: string | null;
};

export const CameraSection = ({
   videoRef,
   cameraDevices,
   selectedCamera,
   setSelectedCamera,
   isCameraLoading,
   isCameraOpened,
   isModelLoaded,
   faceStatusMessage,
}: CameraSectionProps) => {
   const [
      isCameraMenuOpen,
      setIsCameraMenuOpen,
   ] = useState(false);

   const selectedCameraLabel =
      cameraDevices.find(
         device =>
            device.deviceId ===
            selectedCamera
      )?.label ||
      "Select camera";

   const isBackCamera = 
      selectedCameraLabel.toLowerCase().includes("back") || 
      selectedCameraLabel.toLowerCase().includes("environment") ||
      selectedCameraLabel.toLowerCase().includes("rear");

   const handleSwitchCamera = () => {
      if (cameraDevices.length <= 1) return;
      const currentIndex = cameraDevices.findIndex(d => d.deviceId === selectedCamera);
      const nextIndex = (currentIndex + 1) % cameraDevices.length;
      setSelectedCamera(cameraDevices[nextIndex].deviceId);
   };

   return (
      <div className="flex min-h-0 flex-col gap-3 xl:h-full xl:gap-5">
         <div className="relative aspect-square w-full overflow-hidden rounded-xl border border-(--pertama) bg-(--kedua) xl:aspect-auto xl:w-auto xl:min-h-0 xl:flex-1">
            {cameraDevices.length > 1 && (
               <div className="absolute bottom-3 right-3 z-30 xl:hidden">
                  <button
                     type="button"
                     className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-lg bg-(--pertama) text-white shadow-md transition-colors hover:bg-slate-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                     onClick={handleSwitchCamera}
                     aria-label="Switch camera"
                     title="Switch camera"
                  >
                     <SwitchCamera size={22} />
                  </button>
               </div>
            )}
            <video
               ref={videoRef}
               autoPlay
               playsInline
               muted
               style={{
                  filter: "brightness(1.15) contrast(1.05)",
                  transform: isBackCamera ? "scaleX(1)" : "scaleX(-1)",
               }}
               className={`absolute inset-0 h-full w-full object-cover ${
                  !isCameraOpened
                     ? "opacity-0"
                     : "opacity-100"
               } transition-opacity duration-300`}
            />

             {isCameraOpened && !isCameraLoading && isModelLoaded && (
                <>
                   <div className="absolute inset-0 z-10 pointer-events-none">
                      <svg
                         className="w-full h-full"
                         viewBox="0 0 100 100"
                         preserveAspectRatio="none"
                      >
                         <path
                            d="M0,0 H100 V100 H0 Z M50,15 C25,15 15,35 15,50 C15,65 25,85 50,85 C75,85 85,65 85,50 C85,35 75,15 50,15 Z"
                            fill="rgba(0,0,0,0.4)"
                            fillRule="evenodd"
                         />
                         <ellipse
                            cx="50"
                            cy="50"
                            rx="35"
                            ry="35"
                            fill="none"
                            stroke="#ffffff"
                            strokeWidth="0.5"
                            strokeDasharray="2,2"
                         />
                      </svg>
                   </div>

                   {faceStatusMessage && (
                      <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-center px-4">
                         <div className="rounded-full bg-black/70 px-5 py-2.5 text-center text-sm font-semibold text-white backdrop-blur-sm shadow-lg border border-white/20">
                            {faceStatusMessage}
                         </div>
                      </div>
                   )}
                </>
             )}

            {!isCameraOpened && (
               <div className="absolute inset-0 flex items-center justify-center bg-(--kedua)">
                  <div className="text-center text-(--keenam)">
                     <ScanFace
                        size={72}
                        strokeWidth={1.5}
                        className="mx-auto"
                     />

                     <p className="mt-3 text-base font-semibold">
                        Processing...
                     </p>
                  </div>
               </div>
            )}

            {isCameraOpened &&
               (
                  isCameraLoading ||
                  !isModelLoaded
               ) && (
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-(--kedua)/80">
                     <div className="text-center text-(--keenam)">
                        <ScanFace
                           size={72}
                           strokeWidth={1.5}
                           className="mx-auto"
                        />

                        <p className="mt-3 text-base font-semibold">
                           Processing...
                        </p>
                     </div>
                  </div>
               )}
         </div>

         <div className="hidden shrink-0 rounded-xl border border-(--pertama) p-5 xl:block">
            <div className="flex items-center gap-4">
               <p className="shrink-0 text-base font-semibold text-(--pertama)">
                  Camera :
               </p>

               <div className="relative min-w-0 flex-1 max-w-56">
                  <button
                     type="button"
                     onClick={() =>
                        setIsCameraMenuOpen(
                           previous =>
                              !previous
                        )
                     }
                     className="flex h-10 w-full cursor-pointer items-center justify-between gap-3 rounded-md bg-(--pertama) px-4 text-left text-sm font-semibold text-white"
                  >
                     <span className="truncate">
                        {
                           selectedCameraLabel
                        }
                     </span>

                     <ChevronUp
                        size={18}
                        className={
                           isCameraMenuOpen
                              ? "shrink-0 rotate-180 transition-transform"
                              : "shrink-0 transition-transform"
                        }
                     />
                  </button>

                  {isCameraMenuOpen && (
                     <div className="absolute right-0 bottom-12 left-0 z-30 rounded-md border border-(--pertama) bg-(--kedua) p-2 shadow-lg">
                        {cameraDevices.length ===
                           0 ? (
                           <div className="px-3 py-2 text-sm font-semibold text-(--keenam)">
                              No camera found
                           </div>
                        ) : (
                           cameraDevices.map(
                              (device, index) => (
                                 <button
                                    key={
                                       device.deviceId ? `${device.deviceId}-${index}` : `cam-${index}`
                                    }
                                    type="button"
                                    onClick={() => {
                                       setSelectedCamera(
                                          device.deviceId
                                       );

                                       setIsCameraMenuOpen(
                                          false
                                       );
                                    }}
                                    className="flex h-10 w-full cursor-pointer items-center rounded-md px-3 text-left text-sm font-semibold text-(--pertama) hover:bg-(--ketiga)"
                                 >
                                    <span className="truncate">
                                       {
                                          device.label
                                       }
                                    </span>
                                 </button>
                              )
                           )
                        )}
                     </div>
                  )}
               </div>
            </div>
         </div>


      </div>
   );
};
