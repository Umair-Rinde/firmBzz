import { ColumnDef, SortingState } from "@tanstack/react-table";

export type DataGridColumnInterface<T> =
  | ColumnDef<T>
  | {
      apiURL?: string;
      optionAccessor?: string;
      type?: string;
      placeholder?: string;
      operators?: string[];
    };

export interface ColumnMetaDataInterface {
  id: string;
  apiURL?: string;
  operators: string[];
  optionAccessor?: string;
  disableFilters?: boolean;
}
export interface FilterColumnInterface {
  column: ColumnMetaDataInterface;
  field: string;
  operator: { label: string; value: string };
  value: any;
}

export interface TableMetaDataInterface {
  pageSize: number;
  pageIndex: number;
  globalFilter: string;
  filters: FilterColumnInterface[];
  sorting: SortingState;
}
