type HistoryFilterDialogProps = {
   selectedFilter: string;
   setSelectedFilter: (
      value: string
   ) => void;

   startDate: string;
   setStartDate: (
      value: string
   ) => void;

   endDate: string;
   setEndDate: (
      value: string
   ) => void;

   onClose: () => void;
};

import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format, parseISO } from "date-fns";
import { CalendarIcon } from "lucide-react";

export const HistoryFilterDialog =
   ({
      selectedFilter,
      setSelectedFilter,
      startDate,
      setStartDate,
      endDate,
      setEndDate,
      onClose,
   }: HistoryFilterDialogProps) => {
      return (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-xl border border-(--pertama) bg-(--kedua) p-6">
               <div className="flex items-start justify-between gap-4">
                  <div>
                     <h2 className="text-2xl font-semibold text-(--pertama)">
                        Filter History
                     </h2>

                     <p className="mt-1 text-sm text-(--keenam)">
                        Customize attendance filters.
                     </p>
                  </div>

                  <button
                     onClick={
                        onClose
                     }

                     className="flex h-10 w-10 items-center justify-center rounded-md bg-(--pertama) text-white"
                  >
                     ×
                  </button>
               </div>

               <div className="mt-6 space-y-5">
                  <div className="space-y-2">
                     <p className="text-sm font-medium text-(--pertama)">
                        Start Date
                     </p>

                     <div className="relative">
                        <DatePicker
                           selected={startDate ? parseISO(startDate) : null}
                           onChange={(date: Date | null) => setStartDate(date ? format(date, "yyyy-MM-dd") : "")}
                           dateFormat="dd/MM/yyyy"
                           placeholderText="dd/mm/yyyy"
                           wrapperClassName="w-full"
                           className="h-12 w-full rounded-md border border-(--ketiga) bg-transparent px-4 pr-10 text-sm outline-none focus:border-(--pertama)"
                        />
                        <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--ketiga)" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-sm font-medium text-(--pertama)">
                        End Date
                     </p>

                     <div className="relative">
                        <DatePicker
                           selected={endDate ? parseISO(endDate) : null}
                           onChange={(date: Date | null) => setEndDate(date ? format(date, "yyyy-MM-dd") : "")}
                           dateFormat="dd/MM/yyyy"
                           placeholderText="dd/mm/yyyy"
                           wrapperClassName="w-full"
                           className="h-12 w-full rounded-md border border-(--ketiga) bg-transparent px-4 pr-10 text-sm outline-none focus:border-(--pertama)"
                        />
                        <CalendarIcon className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-(--ketiga)" />
                     </div>
                  </div>

                  <div className="space-y-2">
                     <p className="text-sm font-medium text-(--pertama)">
                        Session Status
                     </p>

                     <select
                        value={
                           selectedFilter
                        }

                        onChange={
                           event =>
                              setSelectedFilter(
                                 event
                                    .target
                                    .value
                              )
                        }

                        className="h-12 w-full rounded-md border border-(--ketiga) bg-(--pertama) px-4 text-sm font-medium text-white outline-none"
                     >
                        <option value="all">
                           All Status
                        </option>

                        <option value="completed">
                           Completed
                        </option>

                        <option value="checkpoint_missed">
                           Checkpoint Missed
                        </option>

                        <option value="in_progress">
                           In Progress
                        </option>
                     </select>
                  </div>
               </div>

               <div className="mt-6 flex justify-end">
                  <button
                     onClick={
                        onClose
                     }

                     className="rounded-md bg-(--pertama) px-5 py-3 text-sm font-semibold text-white hover:opacity-90"
                  >
                     Apply Filter
                  </button>
               </div>
            </div>
         </div>
      );
   };