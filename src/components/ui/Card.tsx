import { cn } from "@/utils/cn";
import { HTMLAttributes } from "react";

type CardProps = HTMLAttributes<HTMLDivElement>;

export const Card = ({
   className,
   children,
   ...props
}: CardProps) => {
   return (
      <div
         className={cn(
            "w-full rounded-xl border border-(--pertama) bg-(--kedua) p-10",
            className
         )}
         {...props}
      >
         {children}
      </div>
   );
};