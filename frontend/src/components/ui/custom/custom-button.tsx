import { Loader2 } from "lucide-react";
import React from "react";
import { Button } from "../button";

interface CustomButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link";
  size?: "default" | "sm" | "lg" | "xl" | "icon";
  isPending?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({
  type = "button",
  variant = "default",
  size = "default",
  className,
  isPending = false,
  children,
  ...props
}) => {
  return (
    <Button
      type={type as "button" | "submit" | "reset"}
      variant={variant}
      size={size}
      disabled={isPending || props.disabled}
      {...props}
      className={`!h-[40px] rounded-[8px] border-[#D5D7DA]  shadow-[rgba(10,13,18,0.05)] text-[0.875rem] capitalize flex font-medium leading-[20px] items-center gap-2 ${className}`}
    >
      {isPending && <Loader2 className="animate-spin h-4 w-4" />}
      {children}
    </Button>
  );
};

export default CustomButton;
