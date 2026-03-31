import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";
import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { FaPlus, FaUpload } from "react-icons/fa";
import { useState } from "react";
import VendorProductDrawer from "./components/vendor-product";
import BulkImportDrawer from "./components/bulk-import-drawer";
import { useCookies } from "react-cookie";
import { LuPen } from "react-icons/lu";
import { DeleteItem } from "@/components/ui/custom/delete-dialog";
import { Badge } from "@/components/ui/badge";

const productFilterConfig: FilterConfig[] = [
  {
    param: "is_active",
    label: "Status",
    options: [
      { label: "Active", value: "true" },
      { label: "Inactive", value: "false" },
    ],
  },
];

function schemeBadge(row: any) {
  const st = row.scheme_type;
  if (!st || st === "NONE") return "—";
  if (st === "BUY_X_GET_Y") {
    const freeName = row.scheme_free_product_name;
    return (
      <div className="flex flex-col gap-0.5">
        <Badge variant="secondary" className="text-xs whitespace-nowrap w-fit">
          Buy {row.scheme_buy_qty} Get {row.scheme_free_qty} Free
        </Badge>
        {freeName && (
          <span className="text-[11px] text-blue-600 truncate max-w-[160px]" title={freeName}>
            Free: {freeName}
          </span>
        )}
      </div>
    );
  }
  if (st === "FLAT_DISCOUNT")
    return (
      <Badge variant="secondary" className="text-xs">
        Flat {row.scheme_discount_percent}%
      </Badge>
    );
  return st;
}

export default function FirmProductPage() {
  const columns: ColumnDef<any>[] = [
    {
      header: "Code",
      accessorKey: "product_code",
      cell: ({ row }) => row.original.product_code || "—",
    },
    {
      header: "Name",
      accessorKey: "name",
    },
    {
      header: "HSN",
      accessorKey: "hsn_code",
    },
    {
      header: "GST %",
      accessorKey: "gst_percent",
    },
    {
      header: "MRP",
      accessorKey: "mrp",
    },
    {
      header: "Rate / unit",
      accessorKey: "rate_per_unit",
    },
    {
      header: "Disc %",
      accessorKey: "product_discount",
    },
    {
      header: "Scheme",
      accessorKey: "scheme_type",
      cell: ({ row }) => schemeBadge(row.original),
    },
    {
      header: "Stock",
      accessorKey: "available_quantity",
    },
    {
      header: "Active",
      accessorKey: "is_active",
      cell: ({ row }) =>
        row.original.is_active ? (
          <Badge>Yes</Badge>
        ) : (
          <Badge variant="destructive">No</Badge>
        ),
    },
    {
      header: "Action",
      accessorKey: "Action",
      cell({ row }) {
        return (
          <div className="flex justify-start items-center gap-5">
            <span
              className="flex gap-1 items-center cursor-pointer text-[#006F6D]"
              onClick={() => {
                setOpen(true);
                setSelectedRow(row?.original?.id);
              }}
            >
              <LuPen className="text-[#12B76A] size-[18px]" />
            </span>

            <DeleteItem
              endPoint={`/firm/${cookies.firm}/products/${row.original.id}/`}
              itemName={`${row?.original?.name}`}
              title="Delete Product"
              refetchUrl={[`/firm/${cookies.firm}/products/`]}
            />
          </div>
        );
      },
    },
  ];

  const [open, setOpen] = useState(false);
  const [bulkImportOpen, setBulkImportOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState<any>(null);

  const [cookies] = useCookies(["current_role", "firm"]);

  const handleClose = () => {
    setOpen(false);
  };
  return (
    <div className="mt-[150px]">
      <AppBar title="Products" subTitle="Create, update and delete products" />
      <Datagrid
        columns={columns}
        title="Products"
        url={`/firm/${cookies.firm}/products/`}
        filterConfig={productFilterConfig}
        extraButtons={
          <div className="flex gap-4">
            <CustomButton
              variant="outline"
              onClick={() => setBulkImportOpen(true)}
              className="border-primary text-primary hover:bg-primary/5"
            >
              Bulk Import <FaUpload className="ml-2" />
            </CustomButton>
            <CustomButton onClick={() => setOpen(true)}>
              Add Product <FaPlus />
            </CustomButton>
          </div>
        }
      />
      {open && (
        <VendorProductDrawer
          handleClose={handleClose}
          open={open}
          id={selectedRow}
        />
      )}
      {bulkImportOpen && (
        <BulkImportDrawer
          handleClose={() => setBulkImportOpen(false)}
          open={bulkImportOpen}
        />
      )}
    </div>
  );
}
