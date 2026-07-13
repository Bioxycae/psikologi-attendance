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
   referenceDescriptor: Float32Array | null,
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
   const lastValidFaceTimeRef = useRef<number | null>(null);
   const mismatchCountRef = useRef<number>(0);

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

         const detections =
            await faceapi
               .detectAllFaces(
                  videoRef.current,
                  new faceapi.TinyFaceDetectorOptions()
               )
               .withFaceLandmarks(true)
               .withFaceDescriptors()
               .withFaceExpressions();

         if (!isProcessingRef.current || !detections) {
            return;
         }

         if (detections.length === 0) {
            if (lastValidFaceTimeRef.current !== null) {
               // eslint-disable-next-line react-hooks/purity
               if (Date.now() - lastValidFaceTimeRef.current > 2000) {
                  toast.dismiss("liveness");
                  toast.error(
                     "Wajah tidak terdeteksi. Silakan ulangi verifikasi.",
                     { duration: 3500 }
                  );
                  if (onFraudDetected) onFraudDetected();
                  stopLivenessVerification();
               }
            }
            return;
         }

         if (detections.length > 1) {
            toast.dismiss("liveness");
            toast.error(
               "Terdeteksi lebih dari satu wajah. Silakan ulangi verifikasi.",
               { duration: 3500 }
            );
            if (onFraudDetected) onFraudDetected();
            stopLivenessVerification();
            return;
         }

         const detection = detections[0];

         if (referenceDescriptor) {
            const distance = faceapi.euclideanDistance(
               detection.descriptor,
               referenceDescriptor
            );
            
            if (distance > 0.5) {
               mismatchCountRef.current += 1;
               if (mismatchCountRef.current >= 3) {
                  toast.dismiss("liveness");
                  toast.error(
                     "Identitas berubah. Silakan ulangi verifikasi.",
                     { duration: 3500 }
                  );
                  if (onFraudDetected) onFraudDetected();
                  stopLivenessVerification();
                  return;
               }
               // Don't process expression if mismatched this frame
               return; 
            } else {
               mismatchCountRef.current = 0;
            }
         }

         // eslint-disable-next-line react-hooks/purity
         lastValidFaceTimeRef.current = Date.now();

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
         lastValidFaceTimeRef.current = Date.now();
         mismatchCountRef.current = 0;

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
            // Check identity frequently for security
            timeoutId = setTimeout(runDetection, 500);
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