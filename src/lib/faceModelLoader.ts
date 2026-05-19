import * as faceapi from "face-api.js";

let isLoaded = false;
let loadPromise: Promise<void> | null = null;
const listeners = new Set<(loaded: boolean) => void>();

export const getModelLoadStatus = () => {
   return isLoaded;
};

export const subscribeToModelLoad = (
   callback: (loaded: boolean) => void
) => {
   listeners.add(callback);
   callback(isLoaded);
   return () => {
      listeners.delete(callback);
   };
};

export const preloadFaceModels = async (): Promise<void> => {
   if (isLoaded) {
      return;
   }
   if (loadPromise) {
      return loadPromise;
   }

   loadPromise = (async () => {
      try {
         await Promise.all([
            faceapi.nets.tinyFaceDetector.loadFromUri(
               "/models"
            ),
            faceapi.nets.faceLandmark68TinyNet.loadFromUri(
               "/models"
            ),
            faceapi.nets.faceRecognitionNet.loadFromUri(
               "/models"
            ),
            faceapi.nets.faceExpressionNet.loadFromUri(
               "/models"
            ),
         ]);
         isLoaded = true;
         listeners.forEach((callback) => {
            callback(true);
         });
      } catch (error) {
         console.error(
            "Failed load face model:",
            error
         );
         loadPromise = null;
         throw error;
      }
   })();

   return loadPromise;
};
