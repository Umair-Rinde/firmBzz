
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Edit } from "lucide-react";
import { useState } from "react";
import { DataTable } from "@/components/ui/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type Order = {
    id: string;
    customer: string;
    product: string;
    quantity: number;
    status: "Pending" | "Shipped" | "Delivered";
    date: string;
}

const initialOrders: Order[] = [
    { id: "ORD-001", customer: "Alice Smith", product: "Premium Honey", quantity: 5, status: "Pending", date: "2024-01-15" },
    { id: "ORD-002", customer: "Bob Jones", product: "Organic Tea", quantity: 2, status: "Shipped", date: "2024-01-16" },
    { id: "ORD-003", customer: "Charlie Day", product: "Coffee Beans", quantity: 10, status: "Delivered", date: "2024-01-14" },
];

export default function SuperRetailerOrders() {
    const [data, setData] = useState<Order[]>(initialOrders);

    const handleDelete = (id: string) => {
        if (confirm("Are you sure you want to delete this order?")) {
            setData(data.filter(o => o.id !== id));
        }
    };

    const columns: ColumnDef<Order>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={table.getIsAllPageRowsSelected() ? true : (table.getIsSomePageRowsSelected() ? "indeterminate" : false)}
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label="Select all"
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label="Select row"
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "id",
            header: "Order ID",
        },
        {
            accessorKey: "customer",
            header: "Customer",
        },
        {
            accessorKey: "product",
            header: "Product",
        },
        {
            accessorKey: "quantity",
            header: "Quantity",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const s = row.getValue("status") as string;
                return (
                    <Badge variant={s === "Delivered" ? "default" : s === "Shipped" ? "secondary" : "outline"}>
                        {s}
                    </Badge>
                )
            }
        },
        {
            accessorKey: "date",
            header: "Date",
        },
        {
            id: "actions",
            cell: ({ row }) => {
                const order = row.original;
                return (
                    <div className="text-right">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <Edit className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuItem onClick={() => alert("Edit " + order.id)}>Edit Details</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600" onClick={() => handleDelete(order.id)}>
                                    Delete Order
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )
            }
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Order Management</h1>
                <Button><Plus className="mr-2 h-4 w-4" /> New Order</Button>
            </div>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle>Recent Orders</CardTitle>
                </CardHeader>
                <CardContent>
                    <DataTable columns={columns} data={data} />
                </CardContent>
            </Card>
        </div>
    );
}
