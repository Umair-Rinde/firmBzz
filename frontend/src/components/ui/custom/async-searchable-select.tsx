import { useField, useFormikContext } from "formik";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useMemo, useRef, useState } from "react";
import { Label } from "./custom-label";
import { Search, ChevronDown, X, Loader2 } from "lucide-react";

export type AsyncPageResult<T> = { rows: T[]; count: number };

interface AsyncSearchableSelectProps<T = any> {
  name: string;
  /** Included in the query key so caches do not leak across firms / contexts. */
  queryScope: string;
  label?: string;
  placeholder?: string;
  pageSize?: number;
  debounceMs?: number;
  enabled?: boolean;
  loadPage: (search: string, page: number, limit: number) => Promise<AsyncPageResult<T>>;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string | number;
  renderOption?: (item: T) => React.ReactNode;
  isOptionDisabled?: (item: T) => boolean;
  onSelect?: (item: T | null) => void;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

function useDebouncedValue<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), ms);
    return () => clearTimeout(t);
  }, [value, ms]);
  return debounced;
}

export default function AsyncSearchableSelect<T = any>({
  name,
  queryScope,
  label,
  placeholder = "Search...",
  pageSize = 40,
  debounceMs = 300,
  enabled: enabledProp = true,
  loadPage,
  getOptionLabel,
  getOptionValue,
  renderOption,
  isOptionDisabled,
  onSelect,
  required,
  disabled,
  className,
}: AsyncSearchableSelectProps<T>) {
  const [, meta, helpers] = useField(name);
  const { getFieldProps } = useFormikContext();
  const fieldValue = getFieldProps(name).value as T | null;

  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search.trim(), debounceMs);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetching,
    isFetchingNextPage,
    isError,
    refetch,
  } = useInfiniteQuery({
    queryKey: ["async-searchable-select", queryScope, name, debouncedSearch, pageSize],
    queryFn: async ({ pageParam }) =>
      loadPage(debouncedSearch, pageParam as number, pageSize),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((acc, p) => acc + p.rows.length, 0);
      if (loaded >= lastPage.count) return undefined;
      return allPages.length;
    },
    enabled: enabledProp && isOpen,
    staleTime: 30_000,
  });

  const flatOptions = useMemo(() => {
    const seen = new Set<string>();
    const out: T[] = [];
    for (const page of data?.pages ?? []) {
      for (const row of page.rows) {
        const id = String(getOptionValue(row));
        if (!seen.has(id)) {
          seen.add(id);
          out.push(row);
        }
      }
    }
    return out;
  }, [data, getOptionValue]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isOpen || !sentinelRef.current || !listRef.current) return;
    const root = listRef.current;
    const sentinel = sentinelRef.current;
    const obs = new IntersectionObserver(
      (entries) => {
        const hit = entries.some((e) => e.isIntersecting);
        if (hit && hasNextPage && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root, rootMargin: "80px", threshold: 0 },
    );
    obs.observe(sentinel);
    return () => obs.disconnect();
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage, flatOptions.length]);

  const handleSelect = (item: T) => {
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
  const selectedLabel = fieldValue ? getOptionLabel(fieldValue) : "";

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
        <div
          ref={listRef}
          className="absolute z-[100] mt-1 w-full max-h-[280px] overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg"
        >
          {isError ? (
            <div className="px-3 py-4 text-center text-sm text-red-600">
              Could not load options.{" "}
              <button type="button" className="underline font-medium" onClick={() => void refetch()}>
                Retry
              </button>
            </div>
          ) : isFetching && flatOptions.length === 0 ? (
            <div className="px-3 py-8 flex flex-col items-center gap-2 text-sm text-gray-500">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              Loading…
            </div>
          ) : flatOptions.length === 0 ? (
            <div className="px-3 py-6 text-center text-sm text-gray-400">No results found</div>
          ) : (
            <>
              {flatOptions.map((item) => {
                const val = getOptionValue(item);
                const isSelected =
                  fieldValue != null && String(getOptionValue(fieldValue as T)) === String(val);
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
              })}
              <div ref={sentinelRef} className="h-1 w-full shrink-0" aria-hidden />
              {isFetchingNextPage && (
                <div className="flex justify-center py-2 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
              )}
            </>
          )}
        </div>
      )}

      {hasError && <p className="text-red-500 text-sm mt-1">{meta.error}</p>}
    </div>
  );
}
