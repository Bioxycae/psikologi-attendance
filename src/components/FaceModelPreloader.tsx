"use client";

import { useEffect } from "react";
import { preloadFaceModels } from "@/lib/faceModelLoader";

export const FaceModelPreloader = () => {
   useEffect(() => {
      if (typeof window !== "undefined") {
         const timer = setTimeout(() => {
            void preloadFaceModels();
         }, 2500);

         return () => clearTimeout(timer);
      }
   }, []);

   return null;
};
