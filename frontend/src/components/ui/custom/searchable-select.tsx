import { useField, useFormikContext } from "formik";
import { useEffect, useRef, useState } from "react";
import { Label } from "./custom-label";
import { Search, ChevronDown, X } from "lucide-react";

interface SearchableSelectProps {
  name: string;
  label?: string;
  placeholder?: string;
  options: any[];
  getOptionLabel: (item: any) => string;
  /** If set, the typeahead matches this string (e.g. code + name) instead of only the visible label. */
  getOptionSearchText?: (item: any) => string;
  getOptionValue: (item: any) => any;
  renderOption?: (item: any) => React.ReactNode;
  /** When true, the option is shown but cannot be selected (e.g. invalid licence). */
  isOptionDisabled?: (item: any) => boolean;
  onSelect?: (item: any | null) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function SearchableSelect({
  name,
  label,
  placeholder = "Search...",
  options,
  getOptionLabel,
  getOptionSearchText,
  getOptionValue,
  renderOption,
  isOptionDisabled,
  onSelect,
  required,
  disabled,
  className,
}: SearchableSelectProps) {
  const [, meta, helpers] = useField(name);
  const { getFieldProps } = useFormikContext();
  const fieldValue = getFieldProps(name).value;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const q = search.trim().toLowerCase();
  const textForFilter = getOptionSearchText ?? getOptionLabel;
  const filtered = options.filter((item) =>
    q === "" ? true : textForFilter(item).toLowerCase().includes(q),
  );

  const selectedLabel = fieldValue ? getOptionLabel(fieldValue) : "";

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (item: any) => {
    if (isOptionDisabled?.(item)) return;
    helpers.setValue(item);
    helpers.setTouched(true);
    setSearch("");
    setIsOpen(false);
    onSelect?.(item);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    helpers.setValue(null);
    setSearch("");
    onSelect?.(null);
  };

  const hasError = meta.touched && meta.error;

  return (
    <div ref={containerRef} className={`relative ${className || ""}`} id={name}>
      {label && <Label required={required}>{label}</Label>}
      <div
        onClick={() => {
          if (disabled) return;
          setIsOpen(true);
          setTimeout(() => inputRef.current?.focus(), 0);
        }}
        className={`flex items-center gap-1 w-full min-h-[44px] rounded-[8px] border px-3 py-2 text-sm cursor-pointer transition-colors
          ${hasError ? "border-red-500" : "border-[#D5D7DA]"}
          ${disabled ? "opacity-50 cursor-not-allowed bg-gray-50" : "hover:bg-blue-50 bg-white"}
          ${isOpen ? "ring-2 ring-primary/30 border-primary" : ""}
        `}
      >
        {isOpen ? (
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              className="flex-1 min-w-0 outline-none bg-transparent text-sm"
              placeholder={placeholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ) : (
          <span className={`flex-1 min-w-0 truncate ${fieldValue ? "text-gray-900" : "text-gray-400"}`}>
            {selectedLabel || placeholder}
          </span>
        )}
        {fieldValue && !disabled ? (
          <X className="h-4 w-4 text-gray-400 hover:text-gray-600 shrink-0" onClick={handleClear} />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-400 shrink-0" />
        )}
      </div>

      {isOpen && (
        <div className="absolute z-[100] mt-1 w-full max-h-[280px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
          {filtered.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-400">
              No results found
            </div>
          ) : (
            filtered.map((item) => {
              const val = getOptionValue(item);
              const isSelected = fieldValue && getOptionValue(fieldValue) === val;
              const optionDisabled = !!isOptionDisabled?.(item);
              return (
                <div
                  key={String(val)}
                  onClick={() => !optionDisabled && handleSelect(item)}
                  className={`px-3 py-2 text-sm transition-colors
                    ${optionDisabled ? "opacity-55 cursor-not-allowed bg-gray-50 text-gray-500" : "cursor-pointer"}
                    ${!optionDisabled && isSelected ? "bg-primary/10 text-primary font-medium" : ""}
                    ${!optionDisabled && !isSelected ? "hover:bg-gray-50" : ""}
                  `}
                >
                  {renderOption ? renderOption(item) : getOptionLabel(item)}
                </div>
              );
            })
          )}
        </div>
      )}

      {hasError && (
        <p className="text-red-500 text-sm mt-1">{meta.error}</p>
      )}
    </div>
  );
}
