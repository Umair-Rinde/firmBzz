import { cn } from "@/lib/utils";
import { ReactNode } from "react";

type Props = {
  required?: boolean;
  children: ReactNode;
  className?: string;
};

export const Label = ({ required, children, className }: Props) => {
  return (
    <p
      className={cn(
        "m-0 text capitalize mb-1 text-sm font-medium leading-5 text-[#414651]",
        className
      )}
    >
      {children}
      {required && <span className="text-red-500"> *</span>}
    </p>
  );
};
