"use client";

import { useState, useEffect } from "react";
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

      useEffect(() => {
         const saved = sessionStorage.getItem("verifiedLocation");
         if (saved) {
            try {
               const data = JSON.parse(saved);
               if (data.isLocationPassed) {
                  setIsLocationPassed(true);
                  if (data.coordinates) setCoordinates(data.coordinates);
                  if (data.locationName) setLocationName(data.locationName);
               }
            } catch (e) {}
         }
      }, []);

      const handleLocationCheck = () => {
         if (!navigator.geolocation) {
            toast.error("Geolocation is not supported by your browser");
            return;
         }

         setIsLoading(true);

         const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

         const fetchWithTimeout = async (url: string, timeout = 3000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            try {
               const response = await fetch(url, { signal: controller.signal });
               clearTimeout(id);
               return response;
            } catch (error) {
               clearTimeout(id);
               throw error;
            }
         };

         const fetchIpLocation = async () => {
             try {
                const ipRes = await fetchWithTimeout("https://get.geojs.io/v1/ip/geo.json", 3000);
                const ipData = await ipRes.json();
                if (ipData && ipData.latitude && ipData.longitude) {
                   return { latitude: Number(ipData.latitude), longitude: Number(ipData.longitude), city: ipData.city, country: ipData.country };
                }
             } catch(e) {}
             try {
                const ipRes2 = await fetchWithTimeout("https://ipapi.co/json/", 3000);
                const ipData2 = await ipRes2.json();
                if (ipData2 && ipData2.latitude && ipData2.longitude) {
                   return { latitude: Number(ipData2.latitude), longitude: Number(ipData2.longitude), city: ipData2.city, country: ipData2.country_name };
                }
             } catch(err2) {}
             return null;
         };

         const ipPromise = fetchIpLocation();
         let fallbackTriggered = false;

         const runIpFallback = async () => {
            if (fallbackTriggered) return;
            fallbackTriggered = true;
            
            try {
               const ipData = await ipPromise;
               if (!ipData) {
                  setIsLoading(false);
                  toast.error("Failed to retrieve accurate location. Both GPS and IP fallback are unavailable.");
                  return;
               }

               setCoordinates({ latitude: ipData.latitude, longitude: ipData.longitude });
               const locName = `${ipData.city || "Unknown"}, ${ipData.country || "Unknown"}`;
               setLocationName(locName);

               const response = await fetch("/api/validate-location", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ latitude: ipData.latitude, longitude: ipData.longitude }),
               });
               const result = await response.json();
               
               if (!result.success) {
                  toast.error(result.message);
                  setIsLocationPassed(false);
                  setIsLoading(false);
               } else {
                  setIsLocationPassed(true);
                  setIsLoading(false);
                  sessionStorage.setItem("verifiedLocation", JSON.stringify({
                     isLocationPassed: true,
                     coordinates: { latitude: ipData.latitude, longitude: ipData.longitude },
                     locationName: locName
                  }));
                  toast.warning("GPS signal is weak or unavailable. Falling back to IP location, which may be inaccurate.");
                  toast.success(result.message);
               }
            } catch (e) {
               setIsLoading(false);
               toast.error("An error occurred during IP fallback.");
            }
         };

         // Desktop: 5 seconds timeout. Mobile: 15 seconds timeout.
         const nativeTimeout = isMobile ? 15000 : 5000;
         const options = { enableHighAccuracy: isMobile, maximumAge: 0, timeout: nativeTimeout };

         navigator.geolocation.getCurrentPosition(
            async position => {
               if (fallbackTriggered) return;
               fallbackTriggered = true;
               
               try {
                  const latitude = position.coords.latitude;
                  const longitude = position.coords.longitude;

                  setCoordinates({ latitude, longitude });

                  fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
                     .then((res) => res.json())
                     .then((geoResult) => {
                        const city = geoResult?.address?.city || geoResult?.address?.county || geoResult?.address?.state || "Unknown";
                        const country = geoResult?.address?.country || "Unknown";
                        const locName = `${city}, ${country}`;
                        setLocationName(locName);
                        const saved = sessionStorage.getItem("verifiedLocation");
                        if (saved) {
                           try {
                              const data = JSON.parse(saved);
                              sessionStorage.setItem("verifiedLocation", JSON.stringify({ ...data, locationName: locName }));
                           } catch(e){}
                        }
                     })
                     .catch(() => setLocationName("Unknown Location"));

                  const response = await fetch("/api/validate-location", {
                     method: "POST",
                     headers: { "Content-Type": "application/json" },
                     body: JSON.stringify({ latitude, longitude }),
                  });

                  const result = await response.json();

                  if (!result.success) {
                     toast.error(result.message);
                     setIsLocationPassed(false);
                     setIsLoading(false);
                     return;
                  }

                  setIsLocationPassed(true);
                  sessionStorage.setItem("verifiedLocation", JSON.stringify({
                     isLocationPassed: true,
                     coordinates: { latitude, longitude }
                  }));

                  toast.success(result.message);
               } catch {
                  toast.error("Failed to validate location");
               } finally {
                  setIsLoading(false);
               }
            },
            async error => {
               if (fallbackTriggered) return;

               if (error.code === error.PERMISSION_DENIED) {
                  fallbackTriggered = true;
                  setIsLoading(false);
                  toast.error("Location access denied. Please explicitly allow your browser to access your location settings.");
                  return;
               }

               if (error.code === error.POSITION_UNAVAILABLE) {
                  await runIpFallback();
                  return;
               }

               if (error.code === error.TIMEOUT) {
                  // In privacy browsers like Brave, Permissions API might be spoofed.
                  // We use document.hasFocus() to detect if the prompt is still open.
                  // If focus is false, the user is likely still looking at the prompt.
                  // If focus is true, the prompt is closed, meaning they clicked Allow but GPS is slow.
                  let isGranted = false;
                  try {
                     const perm = await navigator.permissions.query({ name: "geolocation" });
                     if (perm.state === "granted") isGranted = true;
                  } catch (e) {}

                  if (isGranted || document.hasFocus()) {
                     await runIpFallback();
                  } else {
                     fallbackTriggered = true;
                     setIsLoading(false);
                     toast.error("Location request timed out. Please click Verify again and quickly select 'Allow'.");
                  }
                  return;
               }

               fallbackTriggered = true;
               setIsLoading(false);
               toast.error("Failed to retrieve accurate location.");
            },
            options
         );
      };

      return {
         isLoading,
         isLocationPassed,
         setIsLocationPassed,
         locationName,
         coordinates,
         handleLocationCheck,
      };
   };