"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
    updateSettingsSchema,
    type UpdateSettingsSchema,
} from "@/schemas/settings.schema";

import type { AppSettings } from "@/types/database.type";

import dynamic from "next/dynamic";

const MapPicker = dynamic(
   () => import("@/components/maps/MapPicker").then((mod) => mod.MapPicker),
   { ssr: false }
);

type EditSettingsDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   settings: AppSettings | null;
   onSuccess: () => void;
};

export const EditSettingsDialog = ({
   open,
   onOpenChange,
   settings,
   onSuccess,
}: EditSettingsDialogProps) => {
   const [latitude, setLatitude] = useState(-6.200000);
   const [longitude, setLongitude] = useState(106.816666);
   const [isGettingLocation, setIsGettingLocation] = useState(false);

   const {
      register,
      handleSubmit,
      reset,
      setValue,
      formState: { errors, isSubmitting },
   } = useForm<UpdateSettingsSchema>({
      resolver: zodResolver(updateSettingsSchema),
   });

   useEffect(() => {
      if (!settings) return;
      setLatitude(settings.latitude);
      setLongitude(settings.longitude);

      reset({
         latitude: settings.latitude,
         longitude: settings.longitude,
         radius: settings.radius,
         checkpoint_start_hour: settings.checkpoint_start_hour,
         checkpoint_end_hour: settings.checkpoint_end_hour,
         attendance_time_hour: settings.attendance_time_hour,
         attendance_time_minute: settings.attendance_time_minute,
         checkout_time_hour: settings.checkout_time_hour,
         checkout_time_minute: settings.checkout_time_minute,
      });
   }, [settings, reset]);

   const handleMapChange = ({ latitude, longitude }: { latitude: number; longitude: number; }) => {
      setLatitude(latitude);
      setLongitude(longitude);
      setValue("latitude", latitude);
      setValue("longitude", longitude);
   };

   const handleUseCurrentLocation = () => {
      if (!navigator.geolocation) {
         toast.error("Geolocation tidak didukung browser");
         return;
      }

      setIsGettingLocation(true);

      const requestLocation = (attempt: number) => {
         const options = attempt === 1 
            ? { enableHighAccuracy: true, timeout: 5000, maximumAge: Infinity }
            : { enableHighAccuracy: false, timeout: 5000, maximumAge: Infinity };

         navigator.geolocation.getCurrentPosition(
            (position) => {
               const { latitude, longitude } = position.coords;
               setLatitude(latitude);
               setLongitude(longitude);
               setValue("latitude", latitude);
               setValue("longitude", longitude);
               setIsGettingLocation(false);
               toast.success("Lokasi berhasil diambil");
            },
            async (error) => {
               if (attempt === 1 && (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE)) {
                  requestLocation(2);
                  return;
               }

               if (error.code === error.TIMEOUT || error.code === error.POSITION_UNAVAILABLE) {
                  try {
                     const ipRes = await fetch("https://get.geojs.io/v1/ip/geo.json");
                     const ipData = await ipRes.json();
                     if (ipData && ipData.latitude && ipData.longitude) {
                        const latitude = Number(ipData.latitude);
                        const longitude = Number(ipData.longitude);
                        setLatitude(latitude);
                        setLongitude(longitude);
                        setValue("latitude", latitude);
                        setValue("longitude", longitude);
                        setIsGettingLocation(false);
                        toast.warning("Lokasi presisi tidak tersedia. Menggunakan lokasi IP. Silakan geser pin pada peta untuk menyesuaikan secara manual.");
                        return;
                     }
                  } catch (e) {
                     try {
                        const ipRes2 = await fetch("https://ipapi.co/json/");
                        const ipData2 = await ipRes2.json();
                        if (ipData2 && ipData2.latitude && ipData2.longitude) {
                           const latitude = Number(ipData2.latitude);
                           const longitude = Number(ipData2.longitude);
                           setLatitude(latitude);
                           setLongitude(longitude);
                           setValue("latitude", latitude);
                           setValue("longitude", longitude);
                           setIsGettingLocation(false);
                           toast.warning("Lokasi presisi tidak tersedia. Menggunakan lokasi IP. Silakan geser pin pada peta untuk menyesuaikan secara manual.");
                           return;
                        }
                     } catch (err2) {}
                  }
               }

               setIsGettingLocation(false);
               
               let errorMessage = "Gagal mengambil lokasi akurat.";
               if (error.code === error.PERMISSION_DENIED) {
                  errorMessage = "Akses lokasi ditolak. Izinkan browser untuk mengakses lokasi Anda.";
               } else if (error.code === error.POSITION_UNAVAILABLE) {
                  errorMessage = "Informasi lokasi tidak tersedia. Nyalakan Wi-Fi perangkat Anda untuk akurasi terbaik.";
               } else if (error.code === error.TIMEOUT) {
                  errorMessage = "Waktu habis. Pastikan 'Location Services' menyala di pengaturan OS laptop Anda, lalu coba lagi.";
               }

               toast.error(errorMessage);
            },
            options
         );
      };

      requestLocation(1);
   };

   const onSubmit = async (values: UpdateSettingsSchema) => {
      try {
         const response = await fetch("/api/settings", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
         });

         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         toast.success(result.message);
         onOpenChange(false);
         onSuccess();
      } catch {
         toast.error("Gagal memperbarui pengaturan");
      }
   };

   const inputClass = "h-11 w-full rounded-md border border-(--pertama) px-4 text-sm text-(--pertama) outline-none";
   const labelClass = "text-sm font-medium text-(--pertama)";

   return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-3xl -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-(--pertama) bg-(--kesembilan) p-6 shadow-xl">
               <div className="flex flex-col gap-5">
                  <div>
                     <Dialog.Title className="text-xl font-semibold text-(--pertama)">
                        Edit Attendance Settings
                     </Dialog.Title>

                     <Dialog.Description className="mt-1 text-sm text-(--keenam)">
                        Update dynamic attendance location
                     </Dialog.Description>
                  </div>

                  <form
                     onSubmit={handleSubmit(onSubmit)}
                     className="flex flex-col gap-4"
                  >
                     <button
                        onClick={handleUseCurrentLocation}
                        type="button"
                        disabled={isGettingLocation}
                        className="w-fit cursor-pointer rounded-md border border-(--pertama) px-4 py-2 text-sm font-medium text-(--pertama) transition-all hover:bg-(--ketiga) disabled:opacity-50"
                     >
                        {isGettingLocation ? "Getting Location..." : "Use Current Location"}
                     </button>

                     <div className="overflow-hidden rounded-md border border-(--pertama)">
                        <MapPicker
                           latitude={latitude}
                           longitude={longitude}
                           onChange={handleMapChange}
                        />
                     </div>

                     <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div className="flex flex-col gap-1.5">
                           <label className={labelClass}>Latitude</label>
                           <input
                              type="number"
                              step="any"
                              {...register("latitude", { valueAsNumber: true })}
                              className={inputClass}
                           />
                           {errors.latitude && (
                              <p className="text-xs text-red-500">{errors.latitude.message}</p>
                           )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                           <label className={labelClass}>Longitude</label>
                           <input
                              type="number"
                              step="any"
                              {...register("longitude", { valueAsNumber: true })}
                              className={inputClass}
                           />
                           {errors.longitude && (
                              <p className="text-xs text-red-500">{errors.longitude.message}</p>
                           )}
                        </div>
                     </div>

                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Radius (meter)</label>
                        <input
                           type="number"
                           {...register("radius", { valueAsNumber: true })}
                           className={inputClass}
                        />
                        {errors.radius && (
                           <p className="text-xs text-red-500">{errors.radius.message}</p>
                        )}
                     </div>

                     <input type="hidden" {...register("checkpoint_start_hour", { valueAsNumber: true })} />
                     <input type="hidden" {...register("checkpoint_end_hour", { valueAsNumber: true })} />
                     <input type="hidden" {...register("attendance_time_hour", { valueAsNumber: true })} />
                     <input type="hidden" {...register("attendance_time_minute", { valueAsNumber: true })} />
                     <input type="hidden" {...register("checkout_time_hour", { valueAsNumber: true })} />
                     <input type="hidden" {...register("checkout_time_minute", { valueAsNumber: true })} />

                     <div className="flex justify-end gap-3 pt-2">
                        <button
                           type="button"
                           onClick={() => onOpenChange(false)}
                           className="cursor-pointer rounded-md border border-(--pertama) px-5 py-2.5 text-sm font-medium text-(--pertama) transition-colors hover:bg-(--ketiga)"
                        >
                           Cancel
                        </button>

                        <button
                           type="submit"
                           disabled={isSubmitting}
                           className="cursor-pointer rounded-md bg-(--pertama) px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
                        >
                           {isSubmitting ? "Saving..." : "Save Settings"}
                        </button>
                     </div>
                  </form>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
};