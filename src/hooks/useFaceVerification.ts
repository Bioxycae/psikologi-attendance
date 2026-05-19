"use client";

import {
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

   const resetFaceVerification =
      () => {
         setIsFaceVerified(
            false
         );

         setMatchedUser(
            null
         );
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
            new faceapi.TinyFaceDetectorOptions()
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
               new faceapi.TinyFaceDetectorOptions()
            )
            .withFaceLandmarks(true)
            .withFaceDescriptor();
      };

   const handleVerifyFace =
      async () => {
         try {
            setIsFaceProcessing(
               true
            );

            setMatchedUser(
               null
            );

            setIsFaceVerified(
               false
            );

            toast.loading(
               "Scanning face...",
               {
                  id: "face-scan",
               }
            );

            const currentFace =
               await detectCurrentFace();

            if (!currentFace) {
               toast.error(
                  "Wajah tidak terdeteksi",
                  {
                     id: "face-scan",
                  }
               );

               return;
            }

            const [
               usersResponse,
               sessionResponse,
            ] = await Promise.all([
               fetch(
                  "/api/users/faces"
               ),

               fetch(
                  "/api/users/me"
               ),
            ]);

            const usersResult =
               await usersResponse.json();

            const sessionResult =
               await sessionResponse.json();

            const users =
               usersResult.data || [];

            const currentUserName =
               sessionResult.data?.name;

            let bestMatch:
               | string
               | null = null;

            let bestDistance =
               999;

            for (const user of users) {
               if (
                  !user.image_url
               ) {
                  continue;
               }

               const registeredFace =
                  await getFaceDescriptor(
                     user.image_url
                  );

               if (
                  !registeredFace
               ) {
                  continue;
               }

               const distance =
                  faceapi.euclideanDistance(
                     currentFace.descriptor,
                     registeredFace.descriptor
                  );

               if (
                  distance <
                  bestDistance
               ) {
                  bestDistance =
                     distance;

                  bestMatch =
                     user.name;
               }
            }

            const isMatched =
               bestDistance < 0.5;

            setMatchedUser(
               isMatched
                  ? bestMatch
                  : null
            );

            if (!isMatched) {
               toast.error(
                  "Face tidak cocok",
                  {
                     id: "face-scan",
                  }
               );

               return;
            }

            const isCorrectAccount =
               bestMatch ===
               currentUserName;

            setIsFaceVerified(
               isCorrectAccount
            );

            if (
               !isCorrectAccount
            ) {
               toast.error(
                  `Detected as ${bestMatch}, but logged in as ${currentUserName}`,
                  {
                     id: "face-scan",
                  }
               );

               return;
            }

            toast.success(
               `Matched with ${bestMatch}`,
               {
                  id: "face-scan",
               }
            );
         } catch (error) {
            console.error(
               error
            );

            toast.error(
               "Gagal verifikasi face",
               {
                  id: "face-scan",
               }
            );
         } finally {
            setIsFaceProcessing(
               false
            );
         }
      };

   return {
      isFaceVerified,
      isFaceProcessing,
      matchedUser,

      setIsFaceVerified,
      setMatchedUser,
      resetFaceVerification,
      handleVerifyFace,
   };
};