import { cn } from "@/utils/cn";
import { InputHTMLAttributes } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = ({
   className,
   ...props
}: InputProps) => {
   return (
      <input
         className={cn(
            "h-10 w-full rounded-md border border-(--pertama) px-4 outline-none transition-all focus:border-(--pertama) placeholder:text-(--pertama)/80",
            className
         )}
         {...props}
      />
   );
};