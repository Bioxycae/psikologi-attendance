import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

type ImageViewDialogProps = {
   open: boolean;
   onOpenChange: (open: boolean) => void;
   imageUrl: string | null;
   userName: string;
};

export const ImageViewDialog = ({
   open,
   onOpenChange,
   imageUrl,
   userName,
}: ImageViewDialogProps) => {
   return (
      <Dialog.Root
         open={open}
         onOpenChange={onOpenChange}
      >
         <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm" />
            
            <Dialog.Content aria-describedby={undefined} className="fixed top-1/2 left-1/2 z-50 w-[95vw] max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-lg border border-(--pertama) bg-(--kesembilan) p-7 shadow-xl data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
               <div className="flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                     <Dialog.Title className="text-2xl font-semibold text-(--pertama)">
                        {userName}&apos;s Photo
                     </Dialog.Title>
                     
                     <Dialog.Close asChild>
                        <button
                           type="button"
                           className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-(--background) text-(--keenam) transition-colors hover:bg-(--ketiga) hover:text-(--pertama)"
                        >
                           <X size={18} />
                        </button>
                     </Dialog.Close>
                  </div>
                  <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-(--background)">
                     {imageUrl ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img
                           src={imageUrl}
                           alt={userName}
                           className="h-full w-full object-cover"
                        />
                     ) : (
                        <div className="flex h-full w-full items-center justify-center">
                           <p className="text-sm text-(--keenam)">No image available</p>
                        </div>
                     )}
                  </div>
               </div>
            </Dialog.Content>
         </Dialog.Portal>
      </Dialog.Root>
   );
};
