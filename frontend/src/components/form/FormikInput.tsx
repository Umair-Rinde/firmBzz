
import { useField } from "formik";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

interface FormikInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    name: string;
}

export const FormikInput = ({ label, className, ...props }: FormikInputProps) => {
    const [field, meta] = useField(props);
    const error = meta.touched && meta.error;

    return (
        <div className={cn("space-y-2", className)}>
            <Label htmlFor={props.name}>{label}</Label>
            <Input
                id={props.name}
                {...field}
                {...props}
                className={cn(error && "border-red-500 focus-visible:ring-red-500")}
            />
            {error && <p className="text-sm font-medium text-red-500">{error}</p>}
        </div>
    );
};
