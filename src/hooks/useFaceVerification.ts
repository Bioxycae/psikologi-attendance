"use client";

import {
   useEffect,
   useState,
} from "react";
import * as faceapi from "face-api.js";
import { toast } from "sonner";
import {
   getCachedFaceDescriptor,
   preloadUserFaceDescriptor,
} from "@/lib/faceDescriptorCache";

export const useFaceVerification = (
   videoRef: React.RefObject<HTMLVideoElement | null>
) => {
   const [
      isFaceVerified,
      setIsFaceVerified,
   ] = useState(false);

   const [
      isFaceProcessing,
      setIsFaceProcessing,
   ] = useState(false);

   const [
      matchedUser,
      setMatchedUser,
   ] = useState<string | null>(
      null
   );

   const [isAutoVerifying, setIsAutoVerifying] = useState(false);
   const [registeredDescriptor, setRegisteredDescriptor] = useState<Float32Array | null>(null);
   const [registeredUserName, setRegisteredUserName] = useState<string | null>(null);
   const [faceStatusMessage, setFaceStatusMessage] = useState<string | null>(null);

   const stopAutoVerification = () => {
      setFaceStatusMessage(null);
      setIsAutoVerifying(false);
      setIsFaceProcessing(false);
      toast.dismiss("face-scan");
   };

   const resetFaceVerification =
      () => {
         setIsFaceVerified(
            false
         );

         setMatchedUser(
            null
         );
         stopAutoVerification();
      };

   const getFaceDescriptor = async (
      imageUrl: string
   ) => {
      const image =
         await faceapi.fetchImage(
            imageUrl
         );

      return await faceapi
         .detectSingleFace(
            image,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
         )
         .withFaceLandmarks(true)
         .withFaceDescriptor();
   };

   const detectCurrentFaces =
      async () => {
         if (!videoRef.current) {
            return null;
         }

         return await faceapi
            .detectAllFaces(
               videoRef.current,
               new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
            )
            .withFaceLandmarks(true)
            .withFaceDescriptors();
      };

   const startAutoVerification =
      async () => {
         try {
            setIsFaceProcessing(true);
            setMatchedUser(null);
            setIsFaceVerified(false);
            setRegisteredDescriptor(null);
            setRegisteredUserName(null);
            setFaceStatusMessage(null);

            toast.loading("Preparing face scan...", { id: "face-scan" });

            // Check cache first
            let descriptorData = getCachedFaceDescriptor();
            if (!descriptorData) {
               descriptorData = await preloadUserFaceDescriptor();
            }

            if (!descriptorData) {
               toast.error("Registered face not found or invalid", { id: "face-scan" });
               setIsFaceProcessing(false);
               return;
            }

            setRegisteredDescriptor(descriptorData.descriptor);
            setRegisteredUserName(descriptorData.userName);
            setIsAutoVerifying(true);
            toast.success("Starting automatic face scan...", { id: "face-scan" });
            setIsFaceProcessing(false);
         } catch (error) {
            console.error(
               error
            );

            toast.error(
               "Failed to start face verification",
               {
                  id: "face-scan",
               }
            );
            setIsFaceProcessing(false);
         }
      };

   useEffect(() => {
      let isSubscribed = true;
      let timeoutId: NodeJS.Timeout;
      let isCurrentlyProcessing = false;
      let lastValidTime: number | null = null;

      const runDetectionLoop = async () => {
         if (!isSubscribed || !isAutoVerifying || !registeredDescriptor) return;
         if (isCurrentlyProcessing) {
            timeoutId = setTimeout(runDetectionLoop, 200);
            return;
         }

         isCurrentlyProcessing = true;

         try {
            const currentFaces = await detectCurrentFaces();
            
            if (!currentFaces || currentFaces.length === 0) {
               setFaceStatusMessage("Wajah tidak terdeteksi.");
               lastValidTime = null;
            } else if (currentFaces.length > 1) {
               setFaceStatusMessage("Terdeteksi lebih dari satu wajah. Pastikan hanya satu orang berada di kamera.");
               lastValidTime = null;
            } else {
               const face = currentFaces[0];
               const video = videoRef.current;
               
               if (video) {
                  const box = face.detection.box;
                  const videoWidth = video.videoWidth;
                  const videoHeight = video.videoHeight;
                  
                  // Simple guide validation based on relative size and position
                  const faceAreaRatio = (box.width * box.height) / (videoWidth * videoHeight);
                  const faceCenterX = box.x + (box.width / 2);
                  const faceCenterY = box.y + (box.height / 2);
                  
                  // Normalize centers (0 to 1)
                  const normX = faceCenterX / videoWidth;
                  const normY = faceCenterY / videoHeight;

                  if (faceAreaRatio < 0.05) {
                     setFaceStatusMessage("Dekatkan wajah ke kamera.");
                     lastValidTime = null;
                  } else if (faceAreaRatio > 0.4) {
                     setFaceStatusMessage("Jauhkan wajah dari kamera.");
                     lastValidTime = null;
                  } else if (normX < 0.3 || normX > 0.7 || normY < 0.2 || normY > 0.8) {
                     setFaceStatusMessage("Posisikan wajah di dalam area panduan.");
                     lastValidTime = null;
                  } else {
                     setFaceStatusMessage("Pertahankan posisi wajah...");
                     
                     if (!lastValidTime) {
                        lastValidTime = Date.now();
                     } else if (Date.now() - lastValidTime > 500) {
                        // 500ms stable, perform distance check
                        const distance = faceapi.euclideanDistance(face.descriptor, registeredDescriptor);
                        const isMatched = distance < 0.5;

                        if (isMatched && isSubscribed) {
                           setMatchedUser(registeredUserName);
                           setIsFaceVerified(true);
                           setIsAutoVerifying(false);
                           setFaceStatusMessage(null);
                           toast.success(`Matched with ${registeredUserName}`, { id: "face-scan" });
                           isCurrentlyProcessing = false;
                           return; // Stop the loop
                        }
                     }
                  }
               }
            }
         } catch (error) {
            console.error("Face detection error during loop", error);
         }

         isCurrentlyProcessing = false;
         if (isSubscribed && isAutoVerifying) {
            timeoutId = setTimeout(runDetectionLoop, 200);
         }
      };

      if (isAutoVerifying && registeredDescriptor) {
         runDetectionLoop();
      }

      return () => {
         isSubscribed = false;
         clearTimeout(timeoutId);
      };
   // eslint-disable-next-line react-hooks/exhaustive-deps
   }, [isAutoVerifying, registeredDescriptor, registeredUserName]);

   return {
      isFaceVerified,
      isFaceProcessing,
      matchedUser,
      isAutoVerifying,
      faceStatusMessage,
      registeredDescriptor,

      setIsFaceVerified,
      setMatchedUser,
      resetFaceVerification,
      startAutoVerification,
      stopAutoVerification,
   };
};