"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { clearCachedFaceDescriptor } from "@/lib/faceDescriptorCache";
import {
   BrainCircuit,
   ChevronUp,
   LogOut,
   Settings,
   UserRoundCog,
} from "lucide-react";

type SidebarProps = {
   children: ReactNode;
};

export const Sidebar = ({
   children,
}: SidebarProps) => {
   const [isLogoutOpen, setIsLogoutOpen] = useState(false);
   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
   const router = useRouter();

   const handleLogout = async () => {
      clearCachedFaceDescriptor();
      await fetch("/api/logout", {
         method: "POST",
      });
      router.refresh();
      router.replace("/login");
   };

   return (
      <>
         <aside className="hidden w-80 border-r border-(--pertama) bg-(--kedua) px-7 py-10 lg:flex lg:flex-col">
            <div className="flex h-14 items-center gap-3 rounded-md bg-(--pertama) px-14 text-(--kedua)">
               <BrainCircuit
                  size={22}
                  className="text-purple-300"
               />

               <h1 className="text-xl font-semibold tracking-wide">
                  PsychoLab
               </h1>
            </div>

            <div className="mt-16 flex flex-col">
               <h2 className="mb-5 text-lg font-semibold text-(--keenam)">
                  Menu
               </h2>

               <div className="flex flex-col gap-3">
                  {children}
               </div>
            </div>

            <div className="relative mt-auto">
               {isProfileMenuOpen && (
                  <div className="absolute right-0 bottom-15 left-0 rounded-md border border-(--pertama) bg-(--kedua) p-2 shadow-lg">
                     <button
                        type="button"
                        disabled
                        className="flex h-11 w-full cursor-not-allowed items-center justify-between rounded-md px-3 text-sm font-semibold text-(--keenam) opacity-70"
                     >
                        <span className="flex items-center gap-3">
                           <Settings size={18} />
                           Settings
                        </span>

                        <span className="text-xs">
                           Soon
                        </span>
                     </button>

                     <button
                        type="button"
                        onClick={() => {
                           setIsProfileMenuOpen(
                              false
                           );

                           setIsLogoutOpen(
                              true
                           );
                        }}
                        className="mt-1 flex h-11 w-full cursor-pointer items-center gap-3 rounded-md px-3 text-sm font-semibold text-(--pertama) hover:bg-(--ketiga)"
                     >
                        <LogOut size={18} />
                        Logout
                     </button>
                  </div>
               )}

               <button
                  type="button"
                  onClick={() =>
                     setIsProfileMenuOpen(
                        previous =>
                           !previous
                     )
                  }
                  className="flex h-12 w-full cursor-pointer items-center justify-between rounded-md bg-(--kesembilan) px-4 text-lg font-semibold text-(--pertama)"
               >
                  <span className="flex items-center gap-4">
                     <UserRoundCog size={22} />
                     Profile
                  </span>

                  <ChevronUp
                     size={18}
                     className={
                        isProfileMenuOpen
                           ? "rotate-180 transition-transform"
                           : "transition-transform"
                     }
                  />
               </button>
            </div>
         </aside>
         <ConfirmDialog
            title="Logout"
            description="Apakah lu yakin ingin logout?"
            open={isLogoutOpen}
            onOpenChange={setIsLogoutOpen}
            onConfirm={handleLogout}
         />
      </>
   );
};
