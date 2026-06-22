"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import {
   useEffect,
   useRef,
   useState,
} from "react";

import * as faceapi from "face-api.js";
import { toast } from "sonner";
import { getCachedFaceDescriptor } from "@/lib/faceDescriptorCache";

const expressions = [
   "happy",
   "surprised",
   "angry",
   "neutral"
   // "sad",
] as const;

const expressionLabels = {
   happy: "Smile",
   surprised: "Surprised",
   angry: "Angry",
   neutral: "Neutral",
   // sad: "Sad",
};

type ExpressionType =
   (typeof expressions)[number];

export const useLivenessVerification = (
   videoRef: React.RefObject<HTMLVideoElement | null>,
   isCameraOpened: boolean,
   isFaceVerified: boolean,
   onFraudDetected?: () => void
) => {
   const [
      isLivenessVerified,
      setIsLivenessVerified,
   ] = useState(false);

   const [
      isLivenessProcessing,
      setIsLivenessProcessing,
   ] = useState(false);

   const [
      currentChallengeIndex,
      setCurrentChallengeIndex,
   ] = useState(0);

   const [
      livenessChallenges,
      setLivenessChallenges,
   ] = useState<
      ExpressionType[]
   >([]);

   const [
      completedChallenges,
      setCompletedChallenges,
   ] = useState<
      ExpressionType[]
   >([]);

   const isProcessingRef = useRef(false);

   const generateRandomChallenges =
      () => {
         const shuffled = [
            ...expressions,
         ].sort(
            () =>
               Math.random() -
               0.5
         );

         return shuffled.slice(
            0,
            2
         );
      };

   const currentChallenge =
      livenessChallenges[
      currentChallengeIndex
      ] || null;

   const verifyExpression =
      async () => {
         if (
            !isProcessingRef.current ||
            !isLivenessProcessing ||
            !videoRef.current ||
            !isCameraOpened ||
            !currentChallenge ||
            isLivenessVerified
         ) {
            return;
         }

         const detection =
            await faceapi
               .detectSingleFace(
                  videoRef.current,
                  new faceapi.TinyFaceDetectorOptions()
               )
               .withFaceLandmarks(true)
               .withFaceDescriptor()
               .withFaceExpressions();

         if (!isProcessingRef.current || !detection) {
            return;
         }

         const cachedFace = getCachedFaceDescriptor();
         if (cachedFace && cachedFace.descriptor) {
            const distance = faceapi.euclideanDistance(
               detection.descriptor,
               cachedFace.descriptor
            );
            // Increased threshold to 0.65 for liveness to tolerate extreme expressions
            if (distance > 0.65) {
               toast.dismiss("liveness");
               toast.error(
                  "Face swapped during liveness check! Verification reset.",
                  { duration: 3500 }
               );
               if (onFraudDetected) onFraudDetected();
               return;
            }
         }

         const score =
            detection.expressions[
            currentChallenge
            ];

         if (
            score < 0.7 ||
            completedChallenges.includes(
               currentChallenge
            )
         ) {
            return;
         }

         const updated = [
            ...completedChallenges,
            currentChallenge,
         ];

         setCompletedChallenges(
            updated
         );

         toast.success(
            `${expressionLabels[currentChallenge]} verified`
         );

         if (
            updated.length >=
            2
         ) {
            setIsLivenessVerified(
               true
            );

            setIsLivenessProcessing(
               false
            );

            toast.success(
               "Liveness verified",
               {
                  id: "liveness",
               }
            );

            return;
         }

         setCurrentChallengeIndex(
            prev =>
               prev + 1
         );
      };

   const handleVerifyLiveness =
      () => {
         if (
            !isFaceVerified
         ) {
            toast.error(
               "Verify your face first"
            );

            return;
         }

         setCompletedChallenges(
            []
         );

         setCurrentChallengeIndex(
            0
         );

         setIsLivenessVerified(
            false
         );

         setLivenessChallenges(
            generateRandomChallenges()
         );

         setIsLivenessProcessing(
            true
         );
         isProcessingRef.current = true;

         toast.loading(
            "Liveness verification started",
            {
               id: "liveness",
            }
         );
      };

   const stopLivenessVerification = () => {
      isProcessingRef.current = false;
      setIsLivenessProcessing(false);
      setIsLivenessVerified(false);
      setCompletedChallenges([]);
      setCurrentChallengeIndex(0);
      toast.dismiss("liveness");
   };

   useEffect(() => {
      let isSubscribed = true;
      let timeoutId: NodeJS.Timeout;

      const runDetection = async () => {
         if (!isSubscribed) return;
         await verifyExpression();
         if (isSubscribed) {
            timeoutId = setTimeout(runDetection, 1000);
         }
      };

      if (isLivenessProcessing && !isLivenessVerified) {
         runDetection();
      }

      return () => {
         isSubscribed = false;
         clearTimeout(timeoutId);
      };
   }, [
      isCameraOpened,
      currentChallenge,
      completedChallenges,
      isLivenessVerified,
      isLivenessProcessing,
   ]);

   return {
      isLivenessVerified,
      isLivenessProcessing,

      currentChallenge:
         currentChallenge
            ? expressionLabels[
            currentChallenge
            ]
            : null,

      completedChallenges,

      setIsLivenessVerified,
      setCompletedChallenges,
      setCurrentChallengeIndex,

      handleVerifyLiveness,
      stopLivenessVerification,
   };
};