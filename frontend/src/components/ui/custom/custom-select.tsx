import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useField, useFormikContext } from "formik";
import { useMemo, useState } from "react";
import { Label } from "./custom-label";

const CustomSelect = ({
  placeholder,
  customMsg,
  name = "",
  className,
  options,
  value: propValue,
  label,
  onChange,
  getOptionLabel,
  getOptionValue,
  required,
  disabled,
}: {
  placeholder?: string;
  customMsg?: string;
  name?: string;
  className?: string;
  options: any[];
  value?: any;
  label?: string;
  onChange?: (selectedItem: any) => void;
  getOptionLabel: (item: any) => string;
  getOptionValue: (item: any) => any;
  required?: boolean;
  disabled?: boolean;
}) => {
  let optionsProps: any = {};
  let ctx;
  const [localValue, setLocalValue] = useState<any>(propValue || "");
  if (name) {
    // eslint-disable-next-line
    const [inputProps, inputMetaProps, helpers] = useField(name);
    // eslint-disable-next-line
    ctx = useFormikContext();

    // console.log(inputMetaProps, ",--- inputMetaProps");
    optionsProps = {
      ...inputProps,
      ...helpers,
      error: !!(inputMetaProps.touched && inputMetaProps.error),
      helperText:
        inputMetaProps.touched && inputMetaProps.error
          ? inputMetaProps.error
          : "",
    };
  }

  const fieldValue = useMemo(() => {
    if (propValue) return getOptionValue(propValue);
    if (name) return getOptionValue(optionsProps?.value);
    return localValue;
  }, [propValue, name, optionsProps?.value, getOptionValue, localValue]);

  // console.log(optionsProps, "<----------------optionsProps.error");
  return (
    <div id={name}>
      {label && <Label required={required}>{label}</Label>}
      <Select
        disabled={disabled}
        value={fieldValue}
        onValueChange={(value) => {
          const selectedItem = options.find(
            (item) => getOptionValue(item) == value
          );
          if (name) {
            optionsProps?.setValue(selectedItem);
          } else {
            setLocalValue(value);
          }
          onChange?.(selectedItem);
        }}
      >
        <SelectTrigger
          className={`w-[180px] !h-[44px] !rounded-[8px] shadow-[rgba(10,13,18,0.05)] hover:bg-blue-50 ${className} ${
            optionsProps.error ? "border-red-500" : "border-[#D5D7DA] "
          }`}
        >
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent className="max-h-[300px]">
          <SelectGroup>
            {customMsg && <SelectLabel>{customMsg}</SelectLabel>}
            {options?.map((item) => (
              <SelectItem
                key={getOptionValue(item)}
                value={getOptionValue(item)}
              >
                {getOptionLabel(item)}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {optionsProps.error && (
        <p className="text-red-500 text-sm mt-1">{optionsProps.helperText}</p>
      )}
    </div>
  );
};

export default CustomSelect;
