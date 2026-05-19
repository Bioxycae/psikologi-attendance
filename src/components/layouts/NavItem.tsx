"use client";

import { cn } from "@/utils/cn";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

type NavItemProps = {
   href: string;
   icon?: ReactNode;
   children: ReactNode;
};

export const NavItem = ({
   href,
   icon,
   children,
}: NavItemProps) => {
   const pathname = usePathname();

   const isActive = pathname === href;

   return (
      <Link
         href={href}
         className={cn(
            "flex cursor-pointer items-center gap-4 rounded-md px-4 py-3 text-lg font-medium transition-all",
            isActive
               ? "bg-(--pertama) text-(--kedua)"
               : "text-(--pertama) hover:bg-(--ketiga)"
         )}
      >
         <span className="flex h-6 w-6 shrink-0 items-center justify-center">
            {icon}
         </span>

         <span>{children}</span>
      </Link>
   );
};
