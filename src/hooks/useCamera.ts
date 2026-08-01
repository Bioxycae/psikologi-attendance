"use client";

/* eslint-disable react-hooks/exhaustive-deps, react-hooks/set-state-in-effect */
import {
   useEffect,
   useRef,
   useState,
} from "react";

import { toast } from "sonner";

type CameraDevice = {
   deviceId: string;
   label: string;
};

export const useCamera =
   () => {
      const videoRef =
         useRef<HTMLVideoElement | null>(
            null
         );

      const streamRef =
         useRef<MediaStream | null>(
            null
         );

      const [
         isCameraLoading,
         setIsCameraLoading,
      ] = useState(false);

      const [
         isCameraOpened,
         setIsCameraOpened,
      ] = useState(false);

      const [
         cameraDevices,
         setCameraDevices,
      ] = useState<CameraDevice[]>(
         []
      );

      const [
         selectedCamera,
         setSelectedCamera,
      ] = useState("");

      const loadCameraDevices =
         async (isMounted: { current: boolean }) => {
            // Wait 500ms to allow React Strict Mode to unmount if it's the first ghost mount
            await new Promise(r => setTimeout(r, 500));
            
            // If component unmounted during the delay, abort to prevent ghost lock!
            if (!isMounted.current) return;

            try {
               const tempStream = await navigator.mediaDevices.getUserMedia({
                  video: {
                     width: { ideal: 1280 },
                     height: { ideal: 720 },
                  },
               });
               
               // Keep the stream alive in streamRef to hold the hardware lock open
               // This prevents the OS from tearing down the camera, which causes AbortError
               streamRef.current = tempStream;

               const devices =
                  await navigator.mediaDevices.enumerateDevices();
               console.log("Enumerated devices:", devices);

               const cameras =
                  devices
                     .filter(
                        device =>
                           device.kind ===
                           "videoinput"
                     )
                     .map(
                        (
                           device,
                           index
                        ) => ({
                           deviceId:
                              device.deviceId,

                           label:
                              device.label ||
                              `Camera ${index + 1}`,
                        })
                     );

               setCameraDevices(
                  cameras
               );

               if (cameras.length > 0) {
                  const activeTrack = tempStream.getVideoTracks()[0];
                  const activeDeviceId = activeTrack?.getSettings().deviceId;
                  
                  // Check if the active stream's deviceId matches a camera in the list
                  const matchingCamera = cameras.find(c => c.deviceId === activeDeviceId);
                  
                  if (matchingCamera) {
                     setSelectedCamera(matchingCamera.deviceId);
                  } else {
                     setSelectedCamera(cameras[0].deviceId);
                  }
               }
            } catch (
            error
            ) {
               console.error(
                  error
               );

               toast.error(
                  "Failed to retrieve camera list"
               );
            }
         };

      const handleOpenCamera =
         async () => {
            try {
               setIsCameraLoading(
                  true
               );

               const oldStream = streamRef.current;
               
               // Stop the old stream FIRST to release the hardware lock in Windows!
               if (oldStream) {
                  oldStream.getTracks().forEach(track => {
                     track.stop();
                  });
                  // Wait a tiny bit for the OS to completely release the USB hardware lock
                  await new Promise(r => setTimeout(r, 150));
               }

               const stream =
                  await navigator.mediaDevices.getUserMedia({
                     video: selectedCamera
                        ? {
                           deviceId: {
                              exact:
                                 selectedCamera,
                           },
                           width: { ideal: 1280 },
                           height: { ideal: 720 },
                        }
                        : {
                           width: { ideal: 1280 },
                           height: { ideal: 720 },
                        },
                  });

               streamRef.current = stream;

               if (
                  videoRef.current
               ) {
                  videoRef.current.srcObject =
                     stream;

                  await videoRef.current.play().catch(e => {
                     if (e.name !== "AbortError") {
                        console.error("Video play failed:", e);
                     }
                  });
               }

               setIsCameraOpened(
                  true
               );
            } catch (
            error
            ) {
               console.error(
                  error
               );

               toast.error(
                  "Failed to open camera"
               );
            } finally {
               setIsCameraLoading(
                  false
               );
            }
         };

      const handleCloseCamera = () => {
         if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
         }
         if (videoRef.current) {
            videoRef.current.srcObject = null;
         }
         setIsCameraOpened(false);
      };

      const isCameraStreamActive = () => {
         return !!(
            streamRef.current &&
            streamRef.current.getVideoTracks().length > 0 &&
            streamRef.current.getVideoTracks()[0].readyState === "live" &&
            videoRef.current &&
            videoRef.current.srcObject === streamRef.current
         );
      };

      useEffect(() => {
         const isMounted = { current: true };
         loadCameraDevices(isMounted);

         return () => {
            isMounted.current = false;
         };
      }, []);

      useEffect(() => {
         if (
            !isCameraOpened ||
            !selectedCamera
         ) {
            return;
         }

         handleOpenCamera();
      }, [selectedCamera]);

      useEffect(() => {
         return () => {
            if (
               streamRef.current
            ) {
               streamRef.current
                  .getTracks()
                  .forEach(
                     track =>
                        track.stop()
                  );
            }
         };
      }, []);

      return {
         videoRef,
         streamRef,

         isCameraLoading,
         isCameraOpened,

         cameraDevices,
         selectedCamera,

         setSelectedCamera,
         handleOpenCamera,
         handleCloseCamera,
         isCameraStreamActive,
      };
   };