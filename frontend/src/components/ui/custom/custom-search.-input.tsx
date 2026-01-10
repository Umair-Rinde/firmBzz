import { cn } from "@/lib/utils";
import React from "react";
import { FiSearch } from "react-icons/fi";

type Props = {
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  containerClass?: string;
  placeholder?: string;
};

export const SearchInput = (props: Props) => {
  return (
    <div className={cn("relative w-full !h-[40px] ", props.containerClass)}>
      <FiSearch className="absolute top-1/2 left-4 -translate-y-1/2 text-base size-5  text-[#A4A7AE] font-bold " />
      <input
        placeholder={props?.placeholder ? props?.placeholder : "Search"}
        {...props?.inputProps}
        type="text"
        className={cn(
          "border-[#D5D7DA] shadow-[rgba(10,13,18,0.05)] border rounded-[8px] py-1 pr-5 pl-10 outline-none text-primary-text !h-[40px] w-full placeholder:text-[1rem] placeholder:leading-6 placeholder:text-[#717680]",
          props?.inputProps?.className
        )}
      />
    </div>
  );
};
