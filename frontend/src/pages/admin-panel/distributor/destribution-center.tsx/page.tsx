import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppBar from "@/components/ui/custom/app-bar";
import { Datagrid } from "@/components/ui/custom/datgrid";
import { ColumnDef } from "@tanstack/react-table";

const columns: ColumnDef<any>[] = [
  {
    header: "Shipment ID",
    accessorKey: "shipment_id",
  },
  {
    header: "Destination",
    accessorKey: "destination",
  },
  {
    header: "Status",
    accessorKey: "status",
  },
  {
    header: "ETA",
    accessorKey: "ETA",
  },
  {
    header: "Action",
    accessorKey: "Action",
    cell({ row }) {
      return "";
    },
  },
];

export default function DistributionPage() {
  return (
    <div className="space-y-6 dashboard-page-offset max-w-full min-w-0">
      <AppBar subTitle="Distribution Center" title="Distribution Center" />

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-700 dark:text-blue-300">
              Active Fleet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">12 Trucks</div>
          </CardContent>
        </Card>
        <Card className="bg-green-50 dark:bg-green-950 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-700 dark:text-green-300">
              Delivered Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">45 Orders</div>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700 dark:text-orange-300">
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">8 Requests</div>
          </CardContent>
        </Card>
      </div>

      <Datagrid title="Ongoing Shipments" columns={columns} />
    </div>
  );
}
