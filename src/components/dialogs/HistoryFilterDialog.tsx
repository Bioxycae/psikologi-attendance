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
            <div className="w-full max-w-md rounded-3xl bg-(--kedua) p-6">
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

                     className="flex h-10 w-10 items-center justify-center rounded-xl bg-(--pertama) text-white"
                  >
                     ×
                  </button>
               </div>

               <div className="mt-6 space-y-5">
                  <div className="space-y-2">
                     <p className="text-sm font-medium text-(--pertama)">
                        Start Date
                     </p>

                     <input
                        type="date"

                        value={
                           startDate
                        }

                        onChange={
                           event =>
                              setStartDate(
                                 event
                                    .target
                                    .value
                              )
                        }

                        className="h-12 w-full rounded-2xl border border-(--ketiga) px-4 text-sm outline-none"
                     />
                  </div>

                  <div className="space-y-2">
                     <p className="text-sm font-medium text-(--pertama)">
                        End Date
                     </p>

                     <input
                        type="date"

                        value={
                           endDate
                        }

                        onChange={
                           event =>
                              setEndDate(
                                 event
                                    .target
                                    .value
                              )
                        }

                        className="h-12 w-full rounded-2xl border border-(--ketiga) px-4 text-sm outline-none"
                     />
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

                        className="h-12 w-full rounded-2xl border border-(--ketiga) bg-(--pertama) px-4 text-sm font-medium text-white outline-none"
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

                     className="rounded-2xl bg-(--pertama) px-5 py-3 text-sm font-semibold text-white"
                  >
                     Apply Filter
                  </button>
               </div>
            </div>
         </div>
      );
   };