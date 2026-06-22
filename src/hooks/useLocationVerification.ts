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

            const requestLocation = (attempt: number) => {
               const options = attempt === 1 
                  ? { enableHighAccuracy: true, timeout: 5000, maximumAge: Infinity }
                  : { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity };

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
                        sessionStorage.setItem("verifiedLocation", JSON.stringify({
                           isLocationPassed: true,
                           coordinates: { latitude, longitude }
                        }));

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

                  async (error) => {
                     if (attempt === 1 && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
                        requestLocation(2);
                        return;
                     }

                     if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
                        const validateIpLocation = async (lat: number, lon: number, city: string, country: string) => {
                           setCoordinates({ latitude: lat, longitude: lon });
                           const locName = `${city || "Unknown"}, ${country || "Unknown"}`;
                           setLocationName(locName);

                           const response = await fetch("/api/validate-location", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ latitude: lat, longitude: lon }),
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
                                 coordinates: { latitude: lat, longitude: lon },
                                 locationName: locName
                              }));
                              toast.warning("Sinyal GPS lemah. Menggunakan lokasi IP.");
                              toast.success(result.message);
                           }
                        };

                        try {
                           const ipRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
                           const ipData = await ipRes.json();
                           if (ipData && ipData.latitude && ipData.longitude) {
                              await validateIpLocation(Number(ipData.latitude), Number(ipData.longitude), ipData.city, ipData.country);
                              return;
                           }
                        } catch(e) {
                           try {
                              const ipRes2 = await fetch("https://ipapi.co/json/");
                              const ipData2 = await ipRes2.json();
                              if (ipData2 && ipData2.latitude && ipData2.longitude) {
                                 await validateIpLocation(Number(ipData2.latitude), Number(ipData2.longitude), ipData2.city, ipData2.country_name);
                                 return;
                              }
                           } catch(err2) {}
                        }
                     }

                     setIsLoading(false);
                     
                     let errorMessage = "Gagal mendapatkan lokasi akurat.";
                     if (error.code === error.PERMISSION_DENIED) {
                        errorMessage = "Akses lokasi ditolak. Izinkan browser untuk mengakses lokasi Anda.";
                     } else if (error.code === error.POSITION_UNAVAILABLE) {
                        errorMessage = "Informasi lokasi tidak tersedia. Nyalakan Wi-Fi perangkat Anda untuk akurasi terbaik.";
                     } else if (error.code === error.TIMEOUT) {
                        errorMessage = "Waktu habis. Pastikan 'Location Services' menyala di pengaturan OS laptop/HP Anda.";
                     }

                     toast.error(errorMessage);
                  },
                  options
               );
            };

            requestLocation(1);
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