import { cn } from "@/lib/utils";
import { useField, useFormikContext } from "formik";
import { HTMLInputTypeAttribute } from "react";
import { Label } from "./custom-label";
import { Input } from "../input";

interface CustomInputProps {
  label?: string;
  placeholder?: string;
  className?: string;
  required?: boolean;
  type?: HTMLInputTypeAttribute;
  name?: string;
  params?: any;
  value?: string | number;
  disabled?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onWheel?: (e: React.WheelEvent<HTMLInputElement>) => void;
  error?: string;
  touched?: boolean;
}

const CustomInput = ({
  placeholder,
  label,
  className = "",
  required,
  value,
  type = "text",
  name,
  params,
  disabled,
  onChange,
  onWheel,
  error,
  touched,
}: CustomInputProps) => {
  let field: any, meta;
  const formik = useFormikContext<any>();

  const isFormik = !!(formik && name);

  if (isFormik) {
    // eslint-disable-next-line
    [field, meta] = useField(name!);
  }

  const showError = isFormik ? meta?.touched && meta?.error : touched && error;

  const errorMessage = isFormik ? meta?.error : error;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isFormik) {
      field?.onChange(e);
    }
    onChange?.(e);
  };

  return (
    <div className="flex flex-col">
      {label && <Label required={required}>{label}</Label>}
      <Input
        {...(isFormik ? field : { name })}
        {...params}
        type={type}
        disabled={disabled}
        placeholder={placeholder}
        onChange={handleChange}
        value={value !== undefined ? value : isFormik ? field?.value : ""}
        onWheel={onWheel}
        className={cn(
          className,
          "border-[#D5D7DA] shadow-[rgba(10,13,18,0.05)]",
          {
            "border-destructive": !!showError,
            "appearance-none [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none":
              type === "number",
          }
        )}
      />
      {showError && (
        <div className="text-red-500 text-xs mt-1">{errorMessage}</div>
      )}
    </div>
  );
};

export default CustomInput;
