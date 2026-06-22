"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import {
   useEffect,
   useState,
} from "react";

import * as faceapi from "face-api.js";

import { toast } from "sonner";

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
   isFaceVerified: boolean
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
               .withFaceExpressions();

         if (!detection) {
            return;
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

         toast.loading(
            "Liveness verification started",
            {
               id: "liveness",
            }
         );
      };

   const stopLivenessVerification = () => {
      setIsLivenessProcessing(false);
      setIsLivenessVerified(false);
      setCompletedChallenges([]);
      setCurrentChallengeIndex(0);
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