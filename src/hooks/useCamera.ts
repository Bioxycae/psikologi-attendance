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
         async () => {
            try {
               try {
                  const tempStream = await navigator.mediaDevices.getUserMedia({
                     video: {
                        width: { ideal: 1280 },
                        height: { ideal: 720 },
                     },
                  });
                  
                  // MUST STOP TRACKS SO CAMERA IS NOT LOCKED ON WINDOWS
                  tempStream.getTracks().forEach(track => track.stop());
               } catch (e) {
                  console.warn("Failed temp getUserMedia (camera might be in use by previous page):", e);
               }

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

               if (
                  cameras.length > 0
               ) {
                  setSelectedCamera(
                     cameras[0]
                        .deviceId
                  );
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

               let stream: MediaStream | null = null;
               for (let i = 0; i < 3; i++) {
                  try {
                     stream = await navigator.mediaDevices.getUserMedia({
                        video: selectedCamera
                           ? {
                              deviceId: { exact: selectedCamera },
                              width: { ideal: 1280 },
                              height: { ideal: 720 },
                           }
                           : {
                              width: { ideal: 1280 },
                              height: { ideal: 720 },
                           },
                     });
                     break;
                  } catch (err) {
                     if (i === 2) throw err;
                     console.warn("Camera might be locked, retrying in 500ms...", err);
                     await new Promise(r => setTimeout(r, 500));
                  }
               }
               
               if (!stream) throw new Error("Could not acquire camera stream");

               streamRef.current =
                  stream;

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
         loadCameraDevices();
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