import { cn } from "@/lib/utils";
import { useField, useFormikContext } from "formik";
import React, { useRef, useState } from "react";
import { Label } from "./custom-label";
import { UploadCloud, X } from "lucide-react";

interface CustomFileInputProps {
    label?: string;
    className?: string;
    required?: boolean;
    name: string;
    accept?: string;
    disabled?: boolean;
}

const CustomFileInput = ({
    label,
    className = "",
    required,
    name,
    accept,
    disabled,
}: CustomFileInputProps) => {
    const [field, meta, helpers] = useField(name);
    const { setFieldValue } = useFormikContext();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isDragging, setIsDragging] = useState(false);

    const showError = meta.touched && meta.error;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setFieldValue(name, file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!disabled) setIsDragging(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragging(false);
        if (disabled) return;

        const file = e.dataTransfer.files?.[0];
        if (file) {
            setFieldValue(name, file);
            if (fileInputRef.current) {
                // We can't actually set the value of a file input for security reasons,
                // but formik state holds the file object nicely.
                // We can create a Datatransfer object if needed, or simply rely on formik.
            }
        }
    };

    const removeFile = (e: React.MouseEvent) => {
        e.stopPropagation();
        setFieldValue(name, null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="flex flex-col">
            {label && <Label required={required}>{label}</Label>}

            <div
                className={cn(
                    "mt-1 relative flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors focus-within:ring-2 focus-within:ring-[#006F6D] focus-within:border-transparent",
                    isDragging ? "border-[#006F6D] bg-[#006F6D]/5" : "border-[#D5D7DA] bg-white",
                    showError ? "border-red-500" : "hover:bg-gray-50",
                    disabled ? "opacity-60 cursor-not-allowed hover:bg-white" : "",
                    className
                )}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => !disabled && fileInputRef.current?.click()}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    id={name}
                    name={name}
                    accept={accept}
                    disabled={disabled}
                    onChange={handleFileChange}
                    className="sr-only"
                />

                {field.value ? (
                    <div className="flex flex-col items-center justify-center text-center p-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">
                            {field.value.name || (typeof field.value === "string" ? field.value.split("/").pop() : "File selected")}
                        </p>
                        {field.value.size && (
                            <p className="text-xs text-gray-500 mt-1">
                                {(field.value.size / 1024 / 1024).toFixed(2)} MB
                            </p>
                        )}
                        {!disabled && (
                            <button
                                type="button"
                                onClick={removeFile}
                                className="absolute top-2 right-2 p-1 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-600"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 mb-3 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-500">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">
                            {accept ? `Supported: ${accept}` : 'Any file format'}
                        </p>
                    </div>
                )}
            </div>

            {showError && (
                <div className="text-red-500 text-xs mt-1">{meta.error}</div>
            )}
        </div>
    );
};

export default CustomFileInput;
