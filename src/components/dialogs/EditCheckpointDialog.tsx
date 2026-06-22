"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import * as Dialog from "@radix-ui/react-dialog";
import { Clock } from "lucide-react";
import { useEffect } from "react";
import { useForm, Controller, type Control, type FieldPath } from "react-hook-form";
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

const TimeInput = ({ control, name, max, label }: { control: Control<UpdateSettingsSchema>, name: FieldPath<UpdateSettingsSchema>, max: number, label: string }) => (
   <Controller
      name={name}
      control={control}
      render={({ field }) => (
         <div className="flex w-full flex-col gap-1.5">
            <label className="text-center text-xs font-medium text-(--keenam)">{label}</label>
            <input
               type="text"
               inputMode="numeric"
               value={String(field.value ?? 0).padStart(2, "0")}
               onChange={(e) => {
                  let val = e.target.value.replace(/\D/g, "");
                  
                  if (val === "") {
                     field.onChange(0);
                     return;
                  }

                  // Allow continuous typing by keeping the last two digits
                  if (val.length > 2) {
                     val = val.slice(-2);
                  }

                  let num = parseInt(val, 10);
                  if (isNaN(num)) num = 0;
                  if (num < 0) num = 0;
                  if (num > max) num = max;
                  
                  field.onChange(num);
               }}
               onBlur={() => field.onBlur()}
               className="h-11 w-full rounded-md border border-(--pertama) bg-transparent px-2 text-center text-sm font-semibold text-(--pertama) outline-none focus:border-(--ketiga)"
            />
         </div>
      )}
   />
);

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
      control,
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
         toast.error("Failed to update settings");
      }
   };

   return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />

            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-lg border border-(--pertama) bg-(--kesembilan) p-6 shadow-xl">
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
                        <div className="mx-auto flex w-full max-w-xs items-end justify-center gap-3">
                           <TimeInput control={control} name="checkpoint_start_hour" max={23} label="Start Hour" />
                           <span className="mb-2.5 text-xl font-bold text-(--pertama)">-</span>
                           <TimeInput control={control} name="checkpoint_end_hour" max={23} label="End Hour" />
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 rounded-md border border-(--pertama) p-4">
                        <h3 className="text-sm font-semibold text-(--pertama)">
                           Attendance Time
                        </h3>
                        <div className="mx-auto flex w-full max-w-xs items-end justify-center gap-3">
                           <TimeInput control={control} name="attendance_time_hour" max={23} label="Hour" />
                           <span className="mb-2.5 text-xl font-bold text-(--pertama)">:</span>
                           <TimeInput control={control} name="attendance_time_minute" max={59} label="Minute" />
                        </div>
                     </div>

                     <div className="flex flex-col gap-4 rounded-md border border-(--pertama) p-4">
                        <h3 className="text-sm font-semibold text-(--pertama)">
                           Checkout Time
                        </h3>
                        <div className="mx-auto flex w-full max-w-xs items-end justify-center gap-3">
                           <TimeInput control={control} name="checkout_time_hour" max={23} label="Hour" />
                           <span className="mb-2.5 text-xl font-bold text-(--pertama)">:</span>
                           <TimeInput control={control} name="checkout_time_minute" max={59} label="Minute" />
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
