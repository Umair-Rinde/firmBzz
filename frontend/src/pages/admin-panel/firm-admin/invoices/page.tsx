import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import { axios } from "@/config/axios";

import { Datagrid } from "@/components/ui/custom/datgrid";
import { queryClient } from "@/config/query-client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { Eye, Plus } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

const InvoicesPage = () => {
  const { firmId } = useParams();
  const navigate = useNavigate();

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "PENDING_APPROVAL":
        return "bg-yellow-100 text-yellow-800";
      case "APPROVED":
        return "bg-green-100 text-green-800";
      case "CHANGES_REQUESTED":
        return "bg-orange-100 text-orange-800";
      case "REJECTED":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "invoice_number",
      header: "Invoice No.",
    },
    {
      accessorKey: "customer_name",
      header: "Customer",
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.customer_name}</div>
          <div className="text-xs text-gray-500">
            {row.original.customer_type === "SUPER_SELLER"
              ? "Super Seller"
              : "Distributor"}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "total_amount",
      header: "Total Amount",
      cell: ({ row }) => (
        <div className="font-medium">
          ₹{parseFloat(row.original.total_amount).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium ${getStatusStyle(row.original.status)}`}
        >
          {row.original.status_display}
        </span>
      ),
    },
    {
      accessorKey: "created_on",
      header: "Created On",
      cell: ({ row }) => (
        <div className="text-gray-500">
          {format(new Date(row.original.created_on), "dd MMM yyyy")}
        </div>
      ),
    },
    {
      accessorKey: "created_by_name",
      header: "Created By",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex gap-2 justify-end">
          <CustomButton
            variant="outline"
            size="sm"
            className="h-8"
            onClick={() =>
              navigate(`/dashboard/${firmId}/invoices/${row.original.id}`)
            }
          >
            <Eye className="w-4 h-4 mr-2" />
            View / Edit
          </CustomButton>
        </div>
      ),
    },
  ];

  return (
    <div className="mt-[150px]   pb-20">
      <AppBar
        title="Invoices"
        subTitle="Manage all customer invoices, super seller and distributor orders."
      />

      <Datagrid
        title="Invoice List"
        url={`/firm/${firmId}/invoices/`}
        columns={columns}
        extraButtons={
          <Link to={`/dashboard/${firmId}/invoices/create`}>
            <CustomButton className="gap-2">
              <Plus className="w-4 h-4" />
              Create Invoice
            </CustomButton>
          </Link>
        }
      />
    </div>
  );
};

export default InvoicesPage;
