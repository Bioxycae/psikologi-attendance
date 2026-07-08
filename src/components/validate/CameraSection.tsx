import { ChevronUp, ScanFace } from "lucide-react";
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
};

export const CameraSection = ({
   videoRef,
   cameraDevices,
   selectedCamera,
   setSelectedCamera,
   isCameraLoading,
   isCameraOpened,
   isModelLoaded,
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

   return (
      <div className="flex min-h-0 flex-col gap-3 xl:h-full xl:gap-5">
         <div className="relative min-h-[380px] overflow-hidden rounded-xl border border-(--pertama) bg-(--kedua) xl:min-h-0 xl:flex-1">
            <video
               ref={videoRef}
               autoPlay
               playsInline
               muted
               style={{
                  filter: "brightness(1.15) contrast(1.05)",
               }}
               className={`absolute inset-0 h-full w-full object-cover scale-x-[-1] ${
                  !isCameraOpened
                     ? "opacity-0"
                     : "opacity-100"
               } transition-opacity duration-300`}
            />

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

         <div className="hidden shrink-0 rounded-xl border border-(--pertama) p-4 xl:block xl:p-5">
            <div className="flex items-center gap-3 xl:gap-4">
               <p className="shrink-0 text-base font-semibold text-(--pertama)">
                  Camera :
               </p>

               <div className="relative min-w-0 flex-1 xl:max-w-56">
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
