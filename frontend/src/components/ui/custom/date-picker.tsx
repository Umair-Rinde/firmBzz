import { useField, useFormikContext } from "formik";
import { useEffect } from "react";
import "react-calendar/dist/Calendar.css";
import DatePicker from "react-date-picker";
import "react-date-picker/dist/DatePicker.css";
import { LuCalendar1 } from "react-icons/lu";
import { Label } from "./custom-label";

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface DatePickerComponentProps {
  name: string;
  className?: string;
  label?: string;
  minDate?: Date;
  maxDate?: Date;
  required?: boolean;
  props?: any;
}

export function DatePickerComponent({
  name,
  className,
  label,
  minDate,
  maxDate,
  required,
  ...props
}: DatePickerComponentProps) {
  const [field, meta, helpers] = useField(name);
  const { setFieldValue } = useFormikContext();

  useEffect(() => {
    if (!field.value) {
      setFieldValue(name, new Date());
    }
  }, [field.value, name, setFieldValue]);

  return (
    <div className="flex flex-col relative w-full">
      {label && <Label required={required}>{label}</Label>}
      <DatePicker
        {...props}
        minDate={minDate}
        maxDate={maxDate}
        clearIcon={null}
        className={` !h-[44px] border !rounded-[8px]  !text-sm !bg-white border-[#D5D7DA] !shadow-[rgba(10,13,18,0.05)] bg-transparent transition-colors justify-between font-normal inter ${className}`}
        value={field.value}
        onChange={(val: Value) => {
          setFieldValue(name, val);
        }}
        calendarIcon={<LuCalendar1 className="size-[20px] opacity-70 " />}
      />

      {meta.touched && meta.error && (
        <div style={{ color: "red", fontSize: "12px" }}>{meta.error}</div>
      )}
    </div>
  );
}
