"use client";

import { useState } from "react";
import { toast } from "sonner";

export const useLocationVerification =
   () => {
      const [
         isLoading,
         setIsLoading,
      ] = useState(false);

      const [
         isLocationPassed,
         setIsLocationPassed,
      ] = useState(false);

      const [
         locationName,
         setLocationName,
      ] = useState(
         "Location not verified"
      );

      const [
         coordinates,
         setCoordinates,
      ] = useState<{
         latitude: number;
         longitude: number;
      } | null>(null);

      const handleLocationCheck =
         () => {
            if (
               !navigator.geolocation
            ) {
               toast.error(
                  "Geolocation is not supported by your browser"
               );

               return;
            }

            setIsLoading(
               true
            );

            navigator.geolocation.getCurrentPosition(
               async position => {
                  try {
                     const latitude =
                        position.coords.latitude;

                     const longitude =
                        position.coords.longitude;

                     setCoordinates({
                        latitude,
                        longitude,
                      });

                     // Fetch reverse geocoding asynchronously so it doesn't block validation
                     fetch(
                        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
                     )
                        .then((res) => res.json())
                        .then((geoResult) => {
                           const city =
                              geoResult?.address?.city ||
                              geoResult?.address?.county ||
                              geoResult?.address?.state ||
                              "Unknown";
                           const country =
                              geoResult?.address?.country ||
                              "Unknown";
                           setLocationName(`${city}, ${country}`);
                        })
                        .catch(() => setLocationName("Unknown Location"));

                     const response =
                        await fetch(
                           "/api/validate-location",
                           {
                              method:
                                 "POST",

                              headers: {
                                 "Content-Type":
                                    "application/json",
                              },

                              body: JSON.stringify({
                                 latitude,
                                 longitude,
                              }),
                           }
                        );

                     const result =
                        await response.json();

                     if (
                        !result.success
                     ) {
                        toast.error(
                           result.message
                        );

                        setIsLocationPassed(
                           false
                        );

                        return;
                     }

                     setIsLocationPassed(
                        true
                     );

                     toast.success(
                        result.message
                     );
                  } catch {
                     toast.error(
                        "Failed to validate location"
                     );
                  } finally {
                     setIsLoading(
                        false
                     );
                  }
               },

               (error) => {
                  setIsLoading(false);
                  if (error.code === error.TIMEOUT) {
                     toast.error("Location request timed out. Please try again.");
                  } else {
                     toast.error("Failed to get location: " + error.message);
                  }
               },
               {
                  enableHighAccuracy: false,
                  timeout: 10000,
                  maximumAge: 0
               }
            );
         };

      return {
         isLoading,
         isLocationPassed,
         locationName,
         coordinates,
         handleLocationCheck,
      };
   };