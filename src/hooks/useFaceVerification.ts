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

   const stopAutoVerification = () => {
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

   const detectCurrentFace =
      async () => {
         if (!videoRef.current) {
            return null;
         }

         return await faceapi
            .detectSingleFace(
               videoRef.current,
               new faceapi.TinyFaceDetectorOptions({ inputSize: 224 })
            )
            .withFaceLandmarks(true)
            .withFaceDescriptor();
      };

   const startAutoVerification =
      async () => {
         try {
            setIsFaceProcessing(true);
            setMatchedUser(null);
            setIsFaceVerified(false);
            setRegisteredDescriptor(null);
            setRegisteredUserName(null);

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

      const runDetectionLoop = async () => {
         if (!isSubscribed || !isAutoVerifying || !registeredDescriptor) return;
         if (isCurrentlyProcessing) {
            timeoutId = setTimeout(runDetectionLoop, 200);
            return;
         }

         isCurrentlyProcessing = true;

         try {
            const currentFace = await detectCurrentFace();
            if (currentFace) {
               const distance = faceapi.euclideanDistance(currentFace.descriptor, registeredDescriptor);
               const isMatched = distance < 0.5;

               if (isMatched && isSubscribed) {
                  setMatchedUser(registeredUserName);
                  setIsFaceVerified(true);
                  setIsAutoVerifying(false);
                  toast.success(`Matched with ${registeredUserName}`, { id: "face-scan" });
                  isCurrentlyProcessing = false;
                  return; // Stop the loop
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

      setIsFaceVerified,
      setMatchedUser,
      resetFaceVerification,
      startAutoVerification,
      stopAutoVerification,
   };
};