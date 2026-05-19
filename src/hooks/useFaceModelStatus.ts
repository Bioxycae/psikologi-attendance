"use client";

import { useEffect, useState } from "react";
import {
   getModelLoadStatus,
   subscribeToModelLoad,
   preloadFaceModels,
} from "@/lib/faceModelLoader";

export const useFaceModelStatus = () => {
   const [isLoaded, setIsLoaded] = useState(
      getModelLoadStatus()
   );

   useEffect(() => {
      const unsubscribe = subscribeToModelLoad(
         (loaded) => {
            setIsLoaded(loaded);
         }
      );

      void preloadFaceModels();

      return unsubscribe;
   }, []);

   return isLoaded;
};
