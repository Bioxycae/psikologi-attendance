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
               toast.error("Gagal mendapatkan data sesi pengguna", {
                  id: "face-scan",
               });
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
                  "Wajah terdaftar tidak ditemukan",
                  {
                     id: "face-scan",
                  }
               );

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
                  "Wajah terdaftar tidak valid",
                  {
                     id: "face-scan",
                  }
               );

               return;
            }

            const distance =
               faceapi.euclideanDistance(
                  currentFace.descriptor,
                  registeredFace.descriptor
               );

            const isMatched =
               distance < 0.5;

            setMatchedUser(
               isMatched
                  ? currentUserData.name
                  : null
            );

            setIsFaceVerified(
               isMatched
            );

            if (!isMatched) {
               toast.error(
                  "Wajah tidak cocok",
                  {
                     id: "face-scan",
                  }
               );

               return;
            }

            toast.success(
               `Matched with ${currentUserData.name}`,
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