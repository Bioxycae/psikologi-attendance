import * as faceapi from "face-api.js";

export type CachedDescriptor = {
   userName: string;
   descriptor: Float32Array;
};

let cachedDescriptor: CachedDescriptor | null = null;
let preloadPromise: Promise<CachedDescriptor | null> | null = null;

export const getCachedFaceDescriptor = () => cachedDescriptor;

export const clearCachedFaceDescriptor = () => {
   cachedDescriptor = null;
   preloadPromise = null;
};

export const preloadUserFaceDescriptor = async (): Promise<CachedDescriptor | null> => {
   if (cachedDescriptor) return cachedDescriptor;
   if (preloadPromise) return preloadPromise;

   preloadPromise = (async () => {
      try {
         const [usersResponse, sessionResponse] = await Promise.all([
            fetch("/api/users/faces", { cache: "no-store" }),
            fetch("/api/users/me", { cache: "no-store" }),
         ]);

         const contentTypeUsers = usersResponse.headers.get("content-type");
         const contentTypeSession = sessionResponse.headers.get("content-type");
         
         if (
            !contentTypeUsers || !contentTypeUsers.includes("application/json") ||
            !contentTypeSession || !contentTypeSession.includes("application/json")
         ) {
            return null;
         }

         const usersResult = await usersResponse.json();
         const sessionResult = await sessionResponse.json();

         const users = usersResult.data || [];
         const currentUserName = sessionResult.data?.name;

         const currentUserData = users.find(
            (user: { name: string; image_url: string | null }) => user.name === currentUserName
         );

         if (!currentUserData || !currentUserData.image_url) {
            return null;
         }

         const image = await faceapi.fetchImage(currentUserData.image_url);
         const detection = await faceapi
            .detectSingleFace(image, new faceapi.TinyFaceDetectorOptions({ inputSize: 224 }))
            .withFaceLandmarks(true)
            .withFaceDescriptor();

         if (!detection) {
            return null;
         }

         cachedDescriptor = {
            userName: currentUserData.name,
            descriptor: detection.descriptor,
         };

         return cachedDescriptor;
      } catch (error) {
         console.error("Failed to preload face descriptor:", error);
         return null;
      } finally {
         preloadPromise = null;
      }
   })();

   return preloadPromise;
};
