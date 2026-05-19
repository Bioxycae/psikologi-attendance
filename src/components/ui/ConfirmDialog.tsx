"use client";

import * as Dialog from "@radix-ui/react-dialog";

type ConfirmDialogProps = {
   title: string;
   description: string;
   open: boolean;
   onOpenChange: (open: boolean) => void;
   onConfirm: () => void;
};

export const ConfirmDialog = ({
   title,
   description,
   open,
   onOpenChange,
   onConfirm,
}: ConfirmDialogProps) => {
   return (
      <Dialog.Root
         open={open}
         onOpenChange={onOpenChange}
      >
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/30" />

            <Dialog.Content className="fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[95vw] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-(--ketiga) bg-white p-7">
               <div className="flex flex-col gap-6">
                  <Dialog.Title className="text-xl font-semibold text-(--pertama)">
                     {title}
                  </Dialog.Title>

                  <Dialog.Description className="text-sm text-(--keenam)">
                     {description}
                  </Dialog.Description>

                  <div className="flex justify-end gap-3 pt-2">
                     <button
                        type="button"
                        onClick={() =>
                           onOpenChange(false)
                        }
                        className="cursor-pointer rounded-xl border border-(--pertama) px-5 py-3 font-medium text-(--pertama)"
                     >
                        Batal
                     </button>

                     <button
                        type="button"
                        onClick={onConfirm}
                        className="cursor-pointer rounded-xl bg-red-500 px-5 py-3 font-medium text-white"
                     >
                        Ya, lanjutkan
                     </button>
                  </div>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
};