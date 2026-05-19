"use client";

import { cn } from "@/utils/cn";
import {
    BrainCircuit,
    ChevronUp,
    History,
    LayoutDashboard,
    LogOut,
    Menu,
    ScanFace,
    Settings,
    UserRoundCog,
    X,
    Globe,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ConfirmDialog } from "../ui/ConfirmDialog";

type MobileHeaderProps = {
   title: string;
   variant?: "user" | "admin";
};

export const MobileHeader = ({
   title,
   variant = "user",
}: MobileHeaderProps) => {
   const [isOpen, setIsOpen] = useState(false);
   const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
   const [isLogoutOpen, setIsLogoutOpen] = useState(false);
   const pathname = usePathname();
   const router = useRouter();

   const handleLogout = async () => {
      await fetch("/api/logout", {
         method: "POST",
      });

      router.replace("/login");
   };

   const menuItems =
      variant === "admin"
         ? [
            {
               href: "/admin/dashboard",
               label: "Dashboard",
               icon: <LayoutDashboard size={20} />,
            },
            {
               href: "/admin/manage",
               label: "Manage",
               icon: <Settings size={20} />,
            },
            {
               href: "/admin/usertrack",
               label: "User Track",
               icon: <Globe size={20} />,
            },
         ]
         : [
            {
               href: "/dashboard",
               label: "Dashboard",
               icon: <LayoutDashboard size={20} />,
            },
            {
               href: "/history",
               label: "History",
               icon: <History size={20} />,
            },
            {
               href: "/validate",
               label: "Validate",
               icon: <ScanFace size={20} />,
            },
         ];

   return (
      <>
         <header className="flex h-20 items-center justify-between border-b border-(--pertama) bg-(--kedua) px-8 lg:hidden">
            <div className="flex items-center gap-3">
               <BrainCircuit
                  size={22}
                  className="text-purple-300"
               />

               <h1 className="text-xl font-semibold tracking-wide text-(--pertama)">
                  {title}
               </h1>
            </div>

            <button
               type="button"
               onClick={() => setIsOpen(!isOpen)}
               className="cursor-pointer text-(--pertama)"
               aria-label={isOpen ? "Close menu" : "Open menu"}
            >
               {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
         </header>

         {isOpen && (
            <div className="fixed inset-x-0 top-20 z-50 border-b border-(--pertama) bg-(--kedua) px-5 py-4 shadow-lg lg:hidden">
               <div className="flex flex-col gap-2">
                  {menuItems.map(item => {
                     const isActive = pathname === item.href;

                     return (
                        <Link
                           key={item.href}
                           href={item.href}
                           onClick={() => setIsOpen(false)}
                           className={cn(
                              "flex cursor-pointer items-center gap-3 rounded-md px-4 py-3 text-base font-semibold transition-all",
                              isActive
                                 ? "bg-(--pertama) text-white"
                                 : "text-(--pertama) hover:bg-(--ketiga)"
                           )}
                        >
                           {item.icon}
                           {item.label}
                        </Link>
                     );
                  })}

                  <div className="mt-3 border-t border-(--pertama) pt-3">
                     {isProfileMenuOpen && (
                        <div className="mb-2 rounded-md border border-(--pertama) bg-(--kedua) p-2 shadow-lg">
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

                                 setIsOpen(
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
                        className="flex h-12 w-full cursor-pointer items-center justify-between rounded-md bg-(--pertama) px-4 text-base font-semibold text-white"
                     >
                        <span className="flex items-center gap-3">
                           <UserRoundCog size={20} />
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
               </div>
            </div>
         )}

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
