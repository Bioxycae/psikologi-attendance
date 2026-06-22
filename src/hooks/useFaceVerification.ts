"use client";

import {
   useEffect,
   useState,
} from "react";
import * as faceapi from "face-api.js";
import { toast } from "sonner";

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

            const [
               usersResponse,
               sessionResponse,
            ] = await Promise.all([
               fetch(
                  "/api/users/faces",
                  { cache: "no-store" }
               ),

               fetch(
                  "/api/users/me",
                  { cache: "no-store" }
               ),
            ]);

            const contentTypeUsers = usersResponse.headers.get("content-type");
            const contentTypeSession = sessionResponse.headers.get("content-type");
            if (
               !contentTypeUsers || !contentTypeUsers.includes("application/json") ||
               !contentTypeSession || !contentTypeSession.includes("application/json")
            ) {
               toast.error("Failed to fetch user session data", {
                  id: "face-scan",
               });
               setIsFaceProcessing(false);
               return;
            }

            const usersResult =
               await usersResponse.json();

            const sessionResult =
               await sessionResponse.json();

            const users =
               usersResult.data || [];

            const currentUserName =
               sessionResult.data?.name;

            const currentUserData = users.find(
               (user: { name: string; image_url: string | null }) => user.name === currentUserName
            );

            if (!currentUserData || !currentUserData.image_url) {
               toast.error(
                  "Registered face not found",
                  {
                     id: "face-scan",
                  }
               );
               setIsFaceProcessing(false);
               return;
            }

            const registeredFace =
               await getFaceDescriptor(
                  currentUserData.image_url
               );

            if (
               !registeredFace
            ) {
               toast.error(
                  "Registered face is invalid",
                  {
                     id: "face-scan",
                  }
               );
               setIsFaceProcessing(false);
               return;
            }

            setRegisteredDescriptor(registeredFace.descriptor);
            setRegisteredUserName(currentUserData.name);
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
            timeoutId = setTimeout(runDetectionLoop, 1000);
            return;
         }

         isCurrentlyProcessing = true;
         setIsFaceProcessing(true);

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
                  setIsFaceProcessing(false);
                  return; // Stop the loop
               }
            }
         } catch (error) {
            console.error("Face detection error during loop", error);
         }

         isCurrentlyProcessing = false;
         if (isSubscribed && isAutoVerifying) {
            setIsFaceProcessing(false);
            timeoutId = setTimeout(runDetectionLoop, 3000);
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