"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Clock } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import {
    updateSettingsSchema,
    type UpdateSettingsSchema,
} from "@/schemas/settings.schema";
import type { AppSettings } from "@/types/database.type";

type EditCheckpointDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   settings: AppSettings | null;
   onSuccess: () => void;
};

export const EditCheckpointDialog = ({
   open,
   onOpenChange,
   settings,
   onSuccess,
}: EditCheckpointDialogProps) => {
   const {
      register,
      handleSubmit,
      reset,
      formState: { errors, isSubmitting },
   } = useForm<UpdateSettingsSchema>({
      resolver: zodResolver(updateSettingsSchema),
   });

   useEffect(() => {
      if (!settings) return;
      reset({
         latitude: settings.latitude,
         longitude: settings.longitude,
         radius: settings.radius,
         checkpoint_start_hour: settings.checkpoint_start_hour ?? 11,
         checkpoint_end_hour: settings.checkpoint_end_hour ?? 14,
         attendance_time_hour: settings.attendance_time_hour ?? 7,
         attendance_time_minute: settings.attendance_time_minute ?? 30,
         checkout_time_hour: settings.checkout_time_hour ?? 16,
         checkout_time_minute: settings.checkout_time_minute ?? 30,
      });
   }, [settings, reset]);

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
         onSuccess();
         onOpenChange(false);
      } catch (error) {
         console.error(error);
         toast.error("Gagal memperbarui pengaturan");
      }
   };

   const inputClass = "h-11 w-full rounded-md border border-(--pertama) px-4 text-sm text-(--pertama) outline-none";
   const labelClass = "text-sm font-medium text-(--pertama)";

   return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />

            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl border border-(--pertama) bg-white p-6">
               <div className="flex flex-col gap-5">
                  <div>
                     <Dialog.Title className="text-xl font-semibold text-(--pertama)">
                        Attendance Settings
                     </Dialog.Title>
                     <Dialog.Description className="mt-1 text-sm text-(--keenam)">
                        Configure attendance times and checkpoint window.
                     </Dialog.Description>
                  </div>

                  <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                     <div className="flex flex-col gap-4 rounded-md border border-(--pertama) p-4">
                        <div className="flex items-center gap-3">
                           <Clock size={20} className="text-(--pertama)" />
                           <h3 className="text-sm font-semibold text-(--pertama)">
                              Checkpoint Window
                           </h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1.5">
                              <label className={labelClass}>Start Hour</label>
                              <input
                                 type="number"
                                 min="0"
                                 max="23"
                                 {...register("checkpoint_start_hour", { valueAsNumber: true })}
                                 className={inputClass}
                              />
                              {errors.checkpoint_start_hour && (
                                 <p className="text-xs text-red-500">{errors.checkpoint_start_hour.message}</p>
                              )}
                           </div>
                           <div className="flex flex-col gap-1.5">
                              <label className={labelClass}>End Hour</label>
                              <input
                                 type="number"
                                 min="0"
                                 max="23"
                                 {...register("checkpoint_end_hour", { valueAsNumber: true })}
                                 className={inputClass}
                              />
                              {errors.checkpoint_end_hour && (
                                 <p className="text-xs text-red-500">{errors.checkpoint_end_hour.message}</p>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 rounded-md border border-(--pertama) p-4">
                        <h3 className="text-sm font-semibold text-(--pertama)">
                           Attendance Time
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1.5">
                              <label className={labelClass}>Hour</label>
                              <input
                                 type="number"
                                 min="0"
                                 max="23"
                                 {...register("attendance_time_hour", { valueAsNumber: true })}
                                 className={inputClass}
                              />
                              {errors.attendance_time_hour && (
                                 <p className="text-xs text-red-500">{errors.attendance_time_hour.message}</p>
                              )}
                           </div>
                           <div className="flex flex-col gap-1.5">
                              <label className={labelClass}>Minute</label>
                              <input
                                 type="number"
                                 min="0"
                                 max="59"
                                 {...register("attendance_time_minute", { valueAsNumber: true })}
                                 className={inputClass}
                              />
                              {errors.attendance_time_minute && (
                                 <p className="text-xs text-red-500">{errors.attendance_time_minute.message}</p>
                              )}
                           </div>
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 rounded-md border border-(--pertama) p-4">
                        <h3 className="text-sm font-semibold text-(--pertama)">
                           Checkout Time
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                           <div className="flex flex-col gap-1.5">
                              <label className={labelClass}>Hour</label>
                              <input
                                 type="number"
                                 min="0"
                                 max="23"
                                 {...register("checkout_time_hour", { valueAsNumber: true })}
                                 className={inputClass}
                              />
                              {errors.checkout_time_hour && (
                                 <p className="text-xs text-red-500">{errors.checkout_time_hour.message}</p>
                              )}
                           </div>
                           <div className="flex flex-col gap-1.5">
                              <label className={labelClass}>Minute</label>
                              <input
                                 type="number"
                                 min="0"
                                 max="59"
                                 {...register("checkout_time_minute", { valueAsNumber: true })}
                                 className={inputClass}
                              />
                              {errors.checkout_time_minute && (
                                 <p className="text-xs text-red-500">{errors.checkout_time_minute.message}</p>
                              )}
                           </div>
                        </div>
                     </div>

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
                           {isSubmitting ? "Saving..." : "Save Changes"}
                        </button>
                     </div>
                  </form>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
};
