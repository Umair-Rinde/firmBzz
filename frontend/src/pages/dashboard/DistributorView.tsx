
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Truck } from "lucide-react";

const shipments = [
    { id: "SHP-8821", destination: "Downtown Store", status: "In Transit", eta: "2 hrs" },
    { id: "SHP-9932", destination: "North Warehouse", status: "Loading", eta: "45 mins" },
    { id: "SHP-1123", destination: "East Coast Hub", status: "Completed", eta: "-" },
];

export default function DistributorView() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold flex items-center gap-2">
                <Truck className="h-8 w-8" />
                Distribution Center
            </h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200">
                    <CardHeader><CardTitle className="text-blue-700 dark:text-blue-300">Active Fleet</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">12 Trucks</div></CardContent>
                </Card>
                <Card className="bg-green-50 dark:bg-green-950 border-green-200">
                    <CardHeader><CardTitle className="text-green-700 dark:text-green-300">Delivered Today</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">45 Orders</div></CardContent>
                </Card>
                <Card className="bg-orange-50 dark:bg-orange-950 border-orange-200">
                    <CardHeader><CardTitle className="text-orange-700 dark:text-orange-300">Pending</CardTitle></CardHeader>
                    <CardContent><div className="text-3xl font-bold">8 Requests</div></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Ongoing Shipments</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Shipment ID</TableHead>
                                <TableHead>Destination</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>ETA</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {shipments.map(s => (
                                <TableRow key={s.id}>
                                    <TableCell className="font-semibold">{s.id}</TableCell>
                                    <TableCell>{s.destination}</TableCell>
                                    <TableCell><Badge variant="outline">{s.status}</Badge></TableCell>
                                    <TableCell>{s.eta}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
