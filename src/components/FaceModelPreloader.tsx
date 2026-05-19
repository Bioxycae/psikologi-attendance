"use client";

import { useEffect } from "react";
import { preloadFaceModels } from "@/lib/faceModelLoader";

export const FaceModelPreloader = () => {
   useEffect(() => {
      void preloadFaceModels();
   }, []);

   return null;
};
