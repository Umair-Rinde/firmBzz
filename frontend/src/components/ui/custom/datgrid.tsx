import { queryClient } from "@/config/query-client";
import { keepPreviousData } from "@tanstack/react-query";
import {
  ColumnDef,
  PaginationState,
  RowData,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import Axios from "axios";
import React, {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  TiArrowSortedDown,
  TiArrowSortedUp,
  TiArrowUnsorted,
} from "react-icons/ti";
import { X } from "lucide-react";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
} from "../pagination";
import { Skeleton } from "../skeleton";
import CustomSelect from "./custom-select";
import { SearchInput } from "./custom-search.-input";
import { NoData } from "./no-data";
import { useQuery } from "@/hooks/useQuerry";
import { axios } from "@/config/axios";
import CustomButton from "./custom-button";

export interface FilterConfig {
  param: string;
  label: string;
  options: { label: string; value: string }[];
}

type Props = {
  data?: any[];
  title?: string;
  url?: string;
  tableMetaDataKey?: string;
  editable?: boolean;
  disableFilters?: boolean;
  disableSearch?: boolean;
  disablePagination?: boolean;
  columns: ColumnDef<any>[];
  extraButtons?: ReactNode;
  excelDownload?: boolean;
  enableMultiRowSelection?: boolean;
  setRowSelection?: React.Dispatch<React.SetStateAction<any>>;
  setSelectedId?: React.Dispatch<React.SetStateAction<any>>;
  onRowChange?: (
    rows: any[],
    rowIndex: number,
    column: string,
    value: any,
    keyID?: any
  ) => any[];
  globalSearchText?: string;
  onRowDoubleClick?: any;
  filterConfig?: FilterConfig[];
};

declare module "@tanstack/react-table" {
  interface TableMeta<TData extends RowData> {
    updateData: (
      rowIndex: number,
      columnId: string,
      value: unknown,
      keyID?: any
    ) => void;
  }
}

function useSkipper() {
  const shouldSkipRef = useRef(true);
  const shouldSkip = shouldSkipRef.current;

  const skip = useCallback(() => {
    shouldSkipRef.current = false;
  }, []);

  useEffect(() => {
    shouldSkipRef.current = true;
  });

  return [shouldSkip, skip] as const;
}

function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const Datagrid = ({
  data,
  columns,
  extraButtons,
  url,
  onRowChange,
  tableMetaDataKey,
  disablePagination,
  disableFilters = true,
  disableSearch,
  excelDownload,
  setSelectedId,
  globalSearchText,
  setRowSelection,
  onRowDoubleClick,
  title,
  filterConfig,
}: Props) => {
  let perfrences: any = JSON.parse(localStorage.getItem("user_pref")!);
  let tableMetaData: any = {};
  if (tableMetaDataKey && perfrences) {
    tableMetaData = perfrences?.tableMetaData?.[tableMetaDataKey];
  }
  const [globalFilter, setGlobalFilter] = useState("");
  const debouncedSearch = useDebounce(globalFilter, 400);
  const [tableData, setTableData] = useState<any>({ count: 0, rows: [] });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: tableMetaData?.pageIndex || 0,
    pageSize: tableMetaData?.pageSize || 10,
  });

  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const handleFilterChange = (param: string, value: string | null) => {
    setActiveFilters((prev) => {
      const next = { ...prev };
      if (!value) {
        delete next[param];
      } else {
        next[param] = value;
      }
      return next;
    });
    table.setPageIndex(0);
  };

  const clearAllFilters = () => {
    setActiveFilters({});
    table.setPageIndex(0);
  };

  useEffect(() => {
    if (globalSearchText !== undefined) {
      setGlobalFilter(globalSearchText);
    }
  }, [globalSearchText]);

  const [autoResetPageIndex, skipAutoResetPageIndex] = useSkipper();

  const table = useReactTable({
    data: tableData?.rows || [],
    columns,
    defaultColumn: {
      minSize: 200,
    },
    state: {
      pagination: !disablePagination ? pagination : undefined,
      globalFilter: debouncedSearch,
    },
    initialState: {
      columnVisibility: {
        ...columns.reduce(
          (prev, curr: any) => ({
            ...prev,
            [curr.accessorKey]:
              !curr.meta || (curr.meta && !curr.meta["hideColumn"]),
          }),
          {}
        ),
        ...(tableMetaData?.visibilityObject
          ? tableMetaData?.visibilityObject
          : {}),
      },
      columnOrder: tableMetaData?.columnOrder || [],
    },
    globalFilterFn: "auto",
    columnResizeMode: "onEnd",
    columnResizeDirection: "ltr",
    getCoreRowModel: getCoreRowModel(),
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getPaginationRowModel: !disablePagination
      ? getPaginationRowModel()
      : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getSubRows: (row) => row.children,
    getExpandedRowModel: getExpandedRowModel(),
    manualPagination: !!url,
    enableGlobalFilter: !url,
    autoResetPageIndex: !url,
    enableMultiRowSelection: false,
    meta: {
      updateData: (rowIndex, columnId, value, keyID) => {
        if (onRowChange) {
          skipAutoResetPageIndex();
          const rows = onRowChange(
            tableData.rows,
            rowIndex,
            columnId,
            value,
            keyID
          );
          setTableData((prev: any) => ({ ...prev, rows }));
          if (url) {
            queryClient.refetchQueries({ queryKey: [url] });
          }
        }
      },
    },
  });
  let state = table.getState();

  useEffect(() => {
    setSelectedId?.(table.getSelectedRowModel().rows[0]?.original?.id);
    setRowSelection?.(table.getSelectedRowModel().rows[0]?.original);
  }, [table.getState().rowSelection]);

  function PaginationComponent({
    currentPage,
    totalPages,
    table,
  }: {
    table: any;
    totalPages: number;
    currentPage: number;
  }) {
    const pageNumbers = [];
    const maxVisibleButtons = 3;

    let startPage = Math.max(
      1,
      currentPage - Math.floor(maxVisibleButtons / 2)
    );
    let endPage = Math.min(totalPages, startPage + maxVisibleButtons - 1);

    if (endPage - startPage + 1 < maxVisibleButtons) {
      startPage = Math.max(1, endPage - maxVisibleButtons + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    let canPreviousPage = currentPage !== 1;
    const canNextPage = currentPage <= totalPages - 1;

    return (
      <Pagination className="items-center m-0">
        <PaginationContent className="w-full flex gap-3 items-center justify-between">
          <PaginationItem
            onClick={() => table.getCanPreviousPage() && table.previousPage()}
            className={cn(
              "border border-[#D5D7DA] !rounded-[8px] cursor-pointer text-gray-500",
              "!rounded-[8px] shadow-[rgba(10,13,18,0.05)] cursor-pointer text-[0.875rem] font-semibold text-gray-700",
              {
                "cursor-default opacity-50 font-thin hover:text-gray-500":
                  !canPreviousPage,
              }
            )}
          >
            <PaginationLink
              className={cn(
                "hover:text-secondary-dark hover:bg-secondary-light text-[#414651] w-20 text-[0.75rem] font-semibold",
                !canPreviousPage && "hover:text-inherit hover:bg-inherit"
              )}
            >
              Previous
            </PaginationLink>
          </PaginationItem>

          <div className="flex items-center gap-2">
            {currentPage >= 3 && (
              <>
                <PaginationItem
                  onClick={() => table.firstPage()}
                  className={cn(
                    "!rounded-[8px] size-8 cursor-pointer !w-[32px]",
                    { "bg-[rgba(216,231,252,1)]": 0 === currentPage }
                  )}
                >
                  <PaginationLink
                    className={cn(
                      "hover:text-secondary-dark !w-[32px] hover:bg-secondary-light text-gray-500",
                      { "text-secondary-dark hover:text-secondary-dark": currentPage === 0 }
                    )}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
                <PaginationItem>
                  <PaginationEllipsis className="text-gray-500" />
                </PaginationItem>
              </>
            )}
            {pageNumbers.map((page) => (
              <PaginationItem
                key={page}
                onClick={() => table.setPageIndex(page - 1)}
                className={cn(
                  "!rounded-[8px] !w-[32px] size-8 cursor-pointer",
                  {
                    "bg-[rgba(216,231,252,1)] !text-[#1570EF] font-medium":
                      page === currentPage,
                  }
                )}
              >
                <PaginationLink
                  className={cn(
                    "hover:text-secondary-dark hover:bg-secondary-light !w-[32px] text-gray-500",
                    { "text-red hover:text-secondary-dark": page - 1 === currentPage }
                  )}
                >
                  {page}
                </PaginationLink>
              </PaginationItem>
            ))}

            {endPage < totalPages && (
              <>
                <PaginationItem>
                  <PaginationEllipsis className="text-gray-500" />
                </PaginationItem>
                <PaginationItem
                  onClick={() => canNextPage && table.setPageIndex(totalPages - 1)}
                  className={cn(
                    "!rounded-[8px] !w-[32px] size-8 cursor-pointer",
                    { "bg-secondary-light": totalPages === currentPage }
                  )}
                >
                  <PaginationLink
                    className={cn(
                      "hover:text-secondary-dark !w-[32px] hover:bg-secondary-light text-gray-500",
                      { "text-secondary-dark hover:text-secondary-dark": totalPages === currentPage }
                    )}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              </>
            )}
          </div>

          <PaginationItem
            className={cn(
              "border border-[#D5D7DA] !rounded-[8px] text-center cursor-pointer text-gray-500",
              { "cursor-default opacity-50 hover:text-gray-500": currentPage === totalPages }
            )}
          >
            <PaginationLink
              onClick={() => canNextPage && table.nextPage()}
              className={cn(
                "hover:text-secondary-dark hover:bg-secondary-light text-[#414651] text-[0.75rem] w-[60px] font-semibold",
                currentPage === totalPages && "hover:text-inherit hover:bg-inherit"
              )}
            >
              Next
            </PaginationLink>
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  }

  const dataQuery = useQuery<any>({
    queryKey: [
      url,
      {
        limit: !disablePagination ? pagination.pageSize : undefined,
        pg: !disablePagination ? pagination.pageIndex : undefined,
        q: debouncedSearch || undefined,
        ...activeFilters,
      },
    ],
    enabled: !!url,
    placeholderData: keepPreviousData,
    initialData: { count: 0, rows: [] },
    select: (res: any) => res?.data,
  });

  useEffect(() => {
    if (url && dataQuery.data) {
      setTableData({
        count: dataQuery?.data?.data?.count || 0,
        rows: dataQuery?.data?.data?.rows || [],
      });
    } else {
      setTableData({ count: data?.length || 0, rows: data || [] });
    }
  }, [dataQuery.data, url, data]);

  const [isDownloading, setIsDownloading] = useState(false);
  const [excelLoading, setExcelloading] = useState(false);

  function extractFilenameWithoutExtension(filePath: string): string {
    const parts = filePath?.split("/");
    return parts[parts?.length - 1];
  }

  function removePublicFromPath(path: string): string {
    return path?.replace("./public", "");
  }

  function downloadFile(dlUrl: string, fileName: string) {
    const a = document.createElement("a");
    a.href = import.meta.env.VITE_API_BASE_URL + dlUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setExcelloading(false);
    setIsDownloading(false);
  }

  const handleDownload = async () => {
    try {
      setExcelloading(true);
      setIsDownloading(true);
      let resp: any = await axios.get(
        `${url}${url?.includes("?") ? "&" : "?"}download=true`,
        { params: { ...activeFilters, q: debouncedSearch || undefined } }
      );
      downloadFile(
        removePublicFromPath(resp),
        extractFilenameWithoutExtension(resp)
      );
      setExcelloading(false);
      setIsDownloading(false);
    } catch (error: any) {
      setExcelloading(false);
      setIsDownloading(false);
      if (error?.response?.data?.msg) {
        toast.error(error.response.data.msg);
      } else {
        toast.error("Something went wrong");
      }
    }
  };

  const showFilterBar = filterConfig && filterConfig.length > 0;

  return (
    <div className="my-7 w-full bg-white border-[1px] border-[#E9EAEB] shadow-[rgba(10,13,18,0.1)] !rounded-[12px]">
      <div className="flex justify-between lg:items-center items-end min-h-[81px] lg:flex-row px-[1.5rem] py-4 flex-col gap-5 flex-wrap">
        <div className="flex justify-start items-center gap-3 md:w-auto w-full">
          {title && (
            <p className="font-semibold leading-[28px] text-[#181D27] text-[18px]">
              {title}
            </p>
          )}
        </div>
        <div className="flex justify-end items-center gap-3">
          {!disableSearch && (
            <SearchInput
              containerClass="md:w-[320px] w-full"
              inputProps={{
                onChange: (e) => {
                  setGlobalFilter(e.target.value);
                  table.setPageIndex(0);
                },
                onKeyDown: (e) => {
                  if (e.key === "Enter") e.preventDefault();
                },
                value: globalFilter,
              }}
            />
          )}
          {extraButtons}
          {excelDownload && <div className="w-[1px] h-10 bg-gray-200"></div>}
          {excelDownload && !excelLoading ? (
            <CustomButton
              variant="outline"
              color="primary"
              onClick={handleDownload}
              disabled={isDownloading}
            >
              <span className="hidden md:inline">Download</span>
            </CustomButton>
          ) : (
            ""
          )}
        </div>
      </div>

      {showFilterBar && (
        <div className="flex items-center gap-3 px-6 pb-4 flex-wrap">
          {filterConfig!.map((fc) => {
            const ALL_VALUE = "__all__";
            const allOption = { label: `All`, value: ALL_VALUE };
            const opts = [allOption, ...fc.options];
            const currentVal = activeFilters[fc.param];
            const selectedOpt = currentVal
              ? fc.options.find((o) => o.value === currentVal) || allOption
              : allOption;

            return (
              <div key={fc.param} className="flex items-center gap-1.5">
                <span className="text-xs text-gray-500 font-medium">{fc.label}:</span>
                <CustomSelect
                  className="!w-[150px] !h-[34px] !text-[0.8rem]"
                  placeholder={fc.label}
                  options={opts}
                  value={selectedOpt}
                  onChange={(item: any) => {
                    handleFilterChange(fc.param, item?.value === ALL_VALUE ? null : item?.value);
                  }}
                  getOptionLabel={(o) => o.label}
                  getOptionValue={(o) => o.value}
                />
              </div>
            );
          })}
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="flex items-center gap-1 text-xs text-red-600 hover:text-red-800 font-medium px-2 py-1 rounded hover:bg-red-50 transition-colors"
            >
              <X className="h-3 w-3" />
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className="lg:w-full w-[calc(100vw_-_60px)] overflow-auto min-h-auto">
        <table
          style={{
            minWidth: "100%",
            width: table.getCenterTotalSize(),
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th
                    colSpan={header.colSpan}
                    className={cn(
                      "bg-[rgba(250,250,250,1)] h-[44px] text-start px-6 font-medium text-[0.75rem] text-[#667085] border-b border-t border-[rgba(233,234,235,1)] relative group"
                    )}
                    style={{ width: header.getSize(), minWidth: "100%" }}
                    key={header.id}
                  >
                    <div
                      onClick={header.column.getToggleSortingHandler()}
                      className={cn(
                        "flex justify-between items-center !min-h-[44px] h-full",
                        { "cursor-pointer": header.column.getCanSort() }
                      )}
                    >
                      <div className="flex justify-start items-center gap-2">
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                        {header.column.getCanSort() &&
                          ({
                            asc: <TiArrowSortedDown size={15} className="text-inherit text-base" />,
                            desc: <TiArrowSortedUp size={15} className="text-inherit text-base" />,
                          }[header.column.getIsSorted() as string] ?? (
                            <TiArrowUnsorted size={15} className="text-inherit text-base" />
                          ))}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "w-0 group-hover:w-[4px] h-full bg-orange-200 absolute right-0 top-0 hover:bg-primary z-[1000] cursor-col-resize",
                        { "bg-primary": header.column.getIsResizing() }
                      )}
                      {...{
                        onDoubleClick: () => header.column.resetSize(),
                        onMouseDown: header.getResizeHandler(),
                        onTouchStart: header.getResizeHandler(),
                        style: {
                          transform: header.column.getIsResizing()
                            ? `translateX(${
                                1 * (table.getState().columnSizingInfo.deltaOffset ?? 0)
                              }px)`
                            : "",
                        },
                      }}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {(dataQuery.isFetching === true || dataQuery?.isRefetching) && (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length}>
                  <div className="flex flex-col gap-1">
                    {[1, 2, 3, 4, 5].map((item) => (
                      <Skeleton key={item} className="h-[72px]" />
                    ))}
                  </div>
                </td>
              </tr>
            )}

            {!tableData?.rows?.length && !dataQuery.isFetching && (
              <tr>
                <td colSpan={table.getVisibleFlatColumns().length}>
                  <NoData />
                </td>
              </tr>
            )}

            {!(dataQuery.isFetching === true || dataQuery?.isRefetching) &&
              table.getRowModel().rows.map((row) => (
                <tr
                  className="hover:bg-gray-100"
                  key={row.id}
                  onDoubleClick={() => onRowDoubleClick?.(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "h-[72px] px-6 border-b font-normal leading-[20px] text-[#535862] space-y-[14px] border-[rgba(233,234,235,1)] text-[0.875rem]"
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      ) || "-"}
                    </td>
                  ))}
                </tr>
              ))}
          </tbody>
        </table>
      </div>
      {!disablePagination && (
        <div className="flex justify-between px-[16px] py-[12px] !h-[68px]">
          <div className="justify-start items-center gap-2 flex">
            <div className="text-[#A8A8A8] w-[180px] text-xs md:block hidden">
              Showing {pagination.pageIndex + 1} to{" "}
              {(pagination.pageIndex + 1) * pagination.pageSize} of{" "}
              {tableData.count?.toLocaleString()} Entries
            </div>
            <div className="w-[1px] h-4 bg-gray-200 md:block hidden"></div>
            <div className="text-primary-text text-xs text-[#4D4D4D] md:block hidden">
              Show
            </div>
            <CustomSelect
              className="w-[3rem] !h-[30px] p-[6px] !text-[0.75rem] text-[#4D4D4D]"
              options={["5", "10", "25", "50"]}
              value={pagination.pageSize.toLocaleString()}
              onChange={(selectedItem) => {
                table.setPageSize(selectedItem);
                table.setPageIndex(0);
              }}
              getOptionLabel={(option) => option}
              getOptionValue={(option) => option}
            />
            <div className="text-primary-text text-[#4D4D4D] text-xs md:block hidden">
              Entries
            </div>
          </div>
          <div>
            <PaginationComponent
              table={table}
              key={"pagination"}
              currentPage={pagination.pageIndex + 1}
              totalPages={Math.ceil(tableData.count / pagination.pageSize)}
            />
          </div>
        </div>
      )}
    </div>
  );
};
