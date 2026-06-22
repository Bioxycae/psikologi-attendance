import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { CalendarClock, CalendarIcon, ChevronDown } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

import { PRESENSI_STATUS } from "@/constants/presensi.constant";

const CustomSelect = ({ value, onChange, options }: { value: string, onChange: (v: string) => void, options: {label: string, value: string}[] }) => {
   const [open, setOpen] = useState(false);
   const ref = useRef<HTMLDivElement>(null);
   useEffect(() => {
      const handleClick = (e: MouseEvent) => { if(ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
      document.addEventListener('mousedown', handleClick);
      return () => document.removeEventListener('mousedown', handleClick);
   }, []);
   return (
      <div className="relative" ref={ref}>
         <button type="button" onClick={() => setOpen(!open)} className="flex h-11 w-full items-center justify-between rounded-md border border-(--pertama) bg-transparent px-3 text-sm text-(--pertama) outline-none focus:border-(--ketiga)">
            {options.find(o => o.value === value)?.label || "Select Status"}
            <ChevronDown size={16} />
         </button>
         {open && (
            <div className="absolute z-50 mt-1 w-full rounded-md border border-(--pertama)/20 bg-(--kedua) shadow-lg overflow-hidden">
               {options.map(o => (
                  <button type="button" key={o.value} onClick={() => { onChange(o.value); setOpen(false); }} className="w-full px-3 py-2.5 text-left text-sm text-(--pertama) hover:bg-(--pertama) hover:text-(--kedua) transition-colors">
                     {o.label}
                  </button>
               ))}
            </div>
         )}
      </div>
   )
};
import type { Presensi } from "@/types/database.type";

type UpdateAttendancePayload = {
   status: string;
   checkpoint_verified: boolean;
   checkout_verified: boolean;
   attendance_time: string;
   checkpoint_time: string | null;
   checkout_time: string | null;
};

type EditAttendanceRecordDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   record: (Presensi & { 
      attendance_time?: string; 
      checkpoint_time?: string | null; 
      checkout_time?: string | null;
      checkpoint_verified?: boolean;
      checkout_verified?: boolean;
   }) | null;
   onSuccess: () => void;
};

const toDateObject = (isoString?: string | null) => {
   if (!isoString) return null;
   return new Date(isoString);
};

const fromDateObject = (date: Date | null) => {
   if (!date) return null;
   return date.toISOString();
};

export const EditAttendanceRecordDialog = ({
   open,
   onOpenChange,
   record,
   onSuccess,
}: EditAttendanceRecordDialogProps) => {
   const {
      register,
      handleSubmit,
      reset,
      control,
      setValue,
      formState: { isSubmitting },
   } = useForm<any>();

   useEffect(() => {
      if (!record) return;
      
      let initialCompletionStatus = "Missed Checkout";
      if (record.checkpoint_verified && record.checkout_verified) {
         initialCompletionStatus = "Completed";
      } else if (!record.checkpoint_verified && record.checkout_verified) {
         initialCompletionStatus = "Incomplete";
      }

      reset({
         status: record.status || PRESENSI_STATUS.HADIR,
         completion_status: initialCompletionStatus,
         checkpoint_verified: record.checkpoint_verified || false,
         checkout_verified: record.checkout_verified || false,
         attendance_time: toDateObject(record.attendance_time),
         checkpoint_time: toDateObject(record.checkpoint_time),
         checkout_time: toDateObject(record.checkout_time),
      });
   }, [record, reset]);

   const handleCompletionChange = (val: string) => {
      setValue("completion_status", val);
      if (val === "Completed") {
         setValue("checkpoint_verified", true);
         setValue("checkout_verified", true);
      } else if (val === "Incomplete") {
         setValue("checkpoint_verified", false);
         setValue("checkout_verified", true);
      } else if (val === "Missed Checkout") {
         setValue("checkpoint_verified", false);
         setValue("checkout_verified", false);
      }
   };

   const onSubmit = async (data: any) => {
      if (!record) return;

      try {
         const payload = {
            status: data.status,
            checkpoint_verified: data.checkpoint_verified,
            checkout_verified: data.checkout_verified,
            attendance_time: fromDateObject(data.attendance_time),
            checkpoint_time: fromDateObject(data.checkpoint_time),
            checkout_time: fromDateObject(data.checkout_time),
         };

         const response = await fetch(`/api/admin/attendance?id=${record.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
         });

         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         toast.success(result.message);
         onOpenChange(false);
         onSuccess();
      } catch (error) {
         console.error(error);
         toast.error("An error occurred while saving data");
      }
   };

   const inputClass = "h-11 w-full rounded-md border border-(--pertama) px-3 text-sm text-(--pertama) outline-none focus:border-(--ketiga)";
   const labelClass = "text-sm font-medium text-(--pertama)";

   return (
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            <Dialog.Content className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-(--kedua) p-6 shadow-xl">
               <div className="flex items-start justify-between gap-4">
                  <div>
                     <Dialog.Title className="text-xl font-bold text-(--pertama)">
                        Edit Attendance Record
                     </Dialog.Title>
                     <Dialog.Description className="mt-1 text-sm text-(--keenam)">
                        Modify attendance times and statuses
                     </Dialog.Description>
                  </div>
                  <CalendarClock size={24} className="text-(--pertama) shrink-0" />
               </div>

               <form onSubmit={handleSubmit(onSubmit)} className="mt-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                     <label className={labelClass}>Status</label>
                     <Controller
                        control={control}
                        name="completion_status"
                        render={({ field }) => (
                           <CustomSelect
                              value={field.value}
                              onChange={handleCompletionChange}
                              options={[
                                 { label: "Completed", value: "Completed" },
                                 { label: "Incomplete", value: "Incomplete" },
                                 { label: "Missed Checkout", value: "Missed Checkout" },
                              ]}
                           />
                        )}
                     />
                  </div>

                  <div className="flex flex-col gap-1.5">
                     <label className={labelClass}>Check-in Time</label>
                     <Controller
                        control={control}
                        name="attendance_time"
                        rules={{ required: true }}
                        render={({ field }) => (
                           <div className="relative flex h-11 w-full items-center rounded-md border border-(--pertama) bg-transparent px-3">
                              <DatePicker
                                 selected={field.value}
                                 onChange={(date: Date | null) => field.onChange(date)}
                                 showTimeSelect
                                 timeFormat="HH:mm"
                                 timeIntervals={1}
                                 dateFormat="dd/MM/yyyy HH:mm"
                                 className="w-full bg-transparent text-sm text-(--pertama) outline-none"
                                 wrapperClassName="w-full"
                              />
                              <CalendarIcon size={18} className="text-(--keenam)" />
                           </div>
                        )}
                     />
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Checkpoint Time</label>
                        <Controller
                           control={control}
                           name="checkpoint_time"
                           render={({ field }) => (
                              <div className="relative flex h-11 w-full items-center rounded-md border border-(--pertama) bg-transparent px-3">
                                 <DatePicker
                                    selected={field.value}
                                    onChange={(date: Date | null) => field.onChange(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={1}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    className="w-full bg-transparent text-sm text-(--pertama) outline-none"
                                    wrapperClassName="w-full"
                                 />
                                 <CalendarIcon size={18} className="text-(--keenam)" />
                              </div>
                           )}
                        />
                     </div>
                     <div className="flex flex-col justify-end pb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="checkbox" {...register("checkpoint_verified")} className="w-4 h-4 cursor-pointer accent-(--pertama)" />
                           <span className="text-sm font-medium text-(--pertama)">Verified</span>
                        </label>
                     </div>
                  </div>

                  <div className="grid grid-cols-[1fr_auto] gap-4">
                     <div className="flex flex-col gap-1.5">
                        <label className={labelClass}>Checkout Time</label>
                        <Controller
                           control={control}
                           name="checkout_time"
                           render={({ field }) => (
                              <div className="relative flex h-11 w-full items-center rounded-md border border-(--pertama) bg-transparent px-3">
                                 <DatePicker
                                    selected={field.value}
                                    onChange={(date: Date | null) => field.onChange(date)}
                                    showTimeSelect
                                    timeFormat="HH:mm"
                                    timeIntervals={1}
                                    dateFormat="dd/MM/yyyy HH:mm"
                                    className="w-full bg-transparent text-sm text-(--pertama) outline-none"
                                    wrapperClassName="w-full"
                                 />
                                 <CalendarIcon size={18} className="text-(--keenam)" />
                              </div>
                           )}
                        />
                     </div>
                     <div className="flex flex-col justify-end pb-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                           <input type="checkbox" {...register("checkout_verified")} className="w-4 h-4 cursor-pointer accent-(--pertama)" />
                           <span className="text-sm font-medium text-(--pertama)">Verified</span>
                        </label>
                     </div>
                  </div>

                  <div className="mt-4 flex justify-end gap-3">
                     <Dialog.Close asChild>
                        <button
                           type="button"
                           className="cursor-pointer rounded-md border border-(--pertama) px-4 py-2 text-sm font-medium text-(--pertama) hover:bg-slate-50"
                        >
                           Cancel
                        </button>
                     </Dialog.Close>
                     <button
                        type="submit"
                        disabled={isSubmitting}
                        className="cursor-pointer rounded-md bg-(--pertama) px-4 py-2 text-sm font-medium text-(--kedua) hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isSubmitting ? "Saving..." : "Save Changes"}
                     </button>
                  </div>
               </form>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
};
