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
               await navigator.mediaDevices.getUserMedia({
                  video: true,
               });

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
                  "Gagal mendapatkan daftar kamera"
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

               const stream =
                  await navigator.mediaDevices.getUserMedia({
                     video: selectedCamera
                        ? {
                           deviceId: {
                              exact:
                                 selectedCamera,
                           },
                        }
                        : true,
                  });

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
                  "Gagal membuka kamera"
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
      };
   };