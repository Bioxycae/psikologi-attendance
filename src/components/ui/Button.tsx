import { cn } from "@/utils/cn";
import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export const Button = ({
   className,
   children,
   ...props
}: ButtonProps) => {
   return (
      <button
         className={cn(
            "h-12 rounded-md bg-(--pertama)/90 px-4 text-(--kedua) transition-colors duration-300 hover:bg-(--pertama) cursor-pointer disabled:cursor-not-allowed disabled:opacity-50",
            className
         )}
         {...props}
      >
         {children}
      </button>
   );
};