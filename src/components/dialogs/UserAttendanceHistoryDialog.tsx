import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { History, Loader2, Edit2, Trash2, MapPin, Clock } from "lucide-react";

import type { Presensi } from "@/types/database.type";
import { EditAttendanceRecordDialog } from "./EditAttendanceRecordDialog";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";

type UserAttendanceHistoryDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   userId: string | null;
   userName: string;
};

export const UserAttendanceHistoryDialog = ({
   open,
   onOpenChange,
   userId,
   userName,
}: UserAttendanceHistoryDialogProps) => {
   const [history, setHistory] = useState<Presensi[]>([]);
   const [isLoading, setIsLoading] = useState(false);
   const [hasMore, setHasMore] = useState(false);
   const [offset, setOffset] = useState(0);
   const LIMIT = 8;

   const [selectedRecord, setSelectedRecord] = useState<Presensi | null>(null);
   const [isEditRecordOpen, setIsEditRecordOpen] = useState(false);
   const [isDeleteRecordOpen, setIsDeleteRecordOpen] = useState(false);

   const fetchHistory = async (currentOffset = 0, append = false) => {
      if (!userId) return;
      setIsLoading(true);
      try {
         const response = await fetch(`/api/admin/attendance?userId=${userId}&limit=${LIMIT}&offset=${currentOffset}`);
         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         setHistory((prev) => (append ? [...prev, ...result.data] : result.data));
         setHasMore(result.hasMore);
         setOffset(currentOffset);
      } catch (error) {
         console.error(error);
         toast.error("Gagal mengambil data history");
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      if (open && userId) {
         fetchHistory(0, false);
      } else {
         setHistory([]);
         setOffset(0);
         setHasMore(false);
      }
   }, [open, userId]);

   const handleDeleteRecord = async () => {
      if (!selectedRecord) return;

      try {
         const response = await fetch(`/api/admin/attendance?id=${selectedRecord.id}`, {
            method: "DELETE",
         });
         const result = await response.json();

         if (!result.success) {
            toast.error(result.message);
            return;
         }

         toast.success(result.message);
         setIsDeleteRecordOpen(false);
         fetchHistory(0, false); // Refetch from start
      } catch (error) {
         console.error(error);
         toast.error("Gagal menghapus data absen");
      }
   };

   return (
      <>
         <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
               <Dialog.Overlay className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
               <Dialog.Content className="fixed top-1/2 left-1/2 z-40 w-full max-w-3xl max-h-[90vh] overflow-y-auto -translate-x-1/2 -translate-y-1/2 rounded-xl bg-(--kedua) p-6 shadow-xl">
                  <div className="flex items-start justify-between gap-4 sticky top-0 bg-(--kedua) pb-4 border-b border-(--kesembilan) z-10">
                     <div>
                        <Dialog.Title className="text-xl font-bold text-(--pertama)">
                           Attendance History
                        </Dialog.Title>
                        <Dialog.Description className="mt-1 text-sm text-(--keenam)">
                           Managing attendance records for <span className="font-semibold">{userName}</span>
                        </Dialog.Description>
                     </div>
                     <Dialog.Close asChild>
                        <button className="text-(--keenam) hover:text-(--pertama)">
                           ✕
                        </button>
                     </Dialog.Close>
                  </div>

                  <div className="mt-6 flex flex-col gap-4">
                     {isLoading && history.length === 0 ? (
                        <div className="flex items-center justify-center py-10">
                           <Loader2 className="h-8 w-8 animate-spin text-(--pertama)" />
                        </div>
                     ) : history.length === 0 ? (
                        <div className="rounded-xl border border-(--pertama) p-8 text-center">
                           <History className="mx-auto h-12 w-12 text-(--keenam) mb-3" />
                           <p className="text-sm text-(--keenam)">Belum ada history absen.</p>
                        </div>
                     ) : (
                        history.map((record) => {
                           const date = new Date((record as any).attendance_time);
                           const isCheckpoint = (record as any).checkpoint_verified;
                           const isCheckout = (record as any).checkout_verified;
                           
                           let statusLabel = "Missed Checkout";
                           let statusColor = "bg-red-100 text-red-700";
                           
                           if (isCheckpoint && isCheckout) {
                              statusLabel = "Completed";
                              statusColor = "bg-green-100 text-green-700";
                           } else if (!isCheckpoint && isCheckout) {
                              statusLabel = "Incomplete";
                              statusColor = "bg-yellow-100 text-yellow-700";
                           }
                           
                           return (
                              <div key={record.id} className="rounded-xl border border-(--pertama) bg-(--kesembilan) p-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                                 <div className="flex flex-col gap-2">
                                    <div className="flex items-center gap-2">
                                       <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusColor}`}>
                                          {statusLabel}
                                       </span>
                                       <span className="text-sm font-medium text-(--pertama)">
                                          {date.toLocaleDateString("id-ID", { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                                       </span>
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-(--keenam)">
                                       <div className="flex items-center gap-1">
                                          <Clock size={16} />
                                          {date.toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' })}
                                       </div>
                                       <div className="flex items-center gap-1">
                                          <MapPin size={16} />
                                          {(record as any).location_name || "Unknown Location"}
                                       </div>
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-3 self-end sm:self-auto">
                                    <button
                                       onClick={() => {
                                          setSelectedRecord(record);
                                          setIsEditRecordOpen(true);
                                       }}
                                       className="flex items-center gap-1.5 rounded-md border border-(--pertama) px-3 py-1.5 text-sm font-medium text-(--pertama) transition-colors hover:bg-slate-50"
                                    >
                                       <Edit2 size={16} />
                                       Edit
                                    </button>
                                    <button
                                       onClick={() => {
                                          setSelectedRecord(record);
                                          setIsDeleteRecordOpen(true);
                                       }}
                                       className="flex items-center gap-1.5 rounded-md bg-red-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-red-600"
                                    >
                                       <Trash2 size={16} />
                                       Delete
                                    </button>
                                 </div>
                              </div>
                           );
                        })
                     )}
                  </div>

                  {hasMore && !isLoading && (
                     <div className="mt-6 flex justify-center">
                        <button
                           onClick={() => fetchHistory(offset + LIMIT, true)}
                           className="rounded-md bg-(--pertama) px-6 py-2 text-sm font-semibold text-(--kedua) transition-opacity hover:opacity-90"
                        >
                           Load More
                        </button>
                     </div>
                  )}
                  {isLoading && history.length > 0 && (
                     <div className="mt-6 flex justify-center">
                        <Loader2 className="h-6 w-6 animate-spin text-(--pertama)" />
                     </div>
                  )}
               </Dialog.Content>
            </Dialog.Portal>
         </Dialog.Root>

         <EditAttendanceRecordDialog
            open={isEditRecordOpen}
            onOpenChange={setIsEditRecordOpen}
            record={selectedRecord}
            onSuccess={() => fetchHistory(0, false)}
         />

         <ConfirmDialog
            title="Delete Attendance Record"
            description="Apakah lu yakin ingin menghapus data absen ini?"
            open={isDeleteRecordOpen}
            onOpenChange={setIsDeleteRecordOpen}
            onConfirm={handleDeleteRecord}
         />
      </>
   );
};
