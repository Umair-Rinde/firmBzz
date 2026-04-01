import { useAuth } from "@/context/AuthContext";
import { useCookies } from "react-cookie";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Activity, DollarSign, ArrowUpRight, ArrowDownRight, TrendingUp,
  Briefcase, Package, Users, Store, FileText, ShoppingCart, AlertTriangle
} from "lucide-react";
import AppBar from "@/components/ui/custom/app-bar";
import { useQuery } from "@/hooks/useQuerry";
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip as RechartsTooltip, Legend, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';



const formatRupee = (value: number) =>
  `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ───────────── Firm Admin Dashboard ─────────────
function FirmDashboard({ data }: { data: any }) {
  const pieData = [
    { name: 'Cash In', value: Number(data.cash_in) || 0, color: '#10b981' },
    { name: 'Cash Out', value: Number(data.cash_out) || 0, color: '#ef4444' },
  ];
  const hasFinancialData = pieData.some(d => d.value > 0);

  const invoiceStatusData = [
    { name: 'Pending', count: data.invoice_stats?.pending || 0, fill: '#f59e0b' },
    { name: 'Approved', count: data.invoice_stats?.approved || 0, fill: '#10b981' },
    { name: 'Changes Req.', count: data.invoice_stats?.changes_requested || 0, fill: '#ef4444' },
  ];

  const orderStatusData = [
    { name: 'Pending', count: data.order_stats?.pending || 0, fill: '#f59e0b' },
    { name: 'Received', count: data.order_stats?.received || 0, fill: '#3b82f6' },
    { name: 'Completed', count: data.order_stats?.completed || 0, fill: '#10b981' },
  ];

  return (
    <>
      {/* Financial summary cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash In</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRupee(data.cash_in || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">From approved invoices</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Out</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupee(data.cash_out || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">From vendor orders</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit</CardTitle>
            <TrendingUp className={`h-4 w-4 ${data.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatRupee(data.profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Cash In − Cash Out</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{formatRupee(data.outstanding_amount || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Unpaid vendor dues</p>
          </CardContent>
        </Card>
      </div>

      {/* Entity count cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Products</CardTitle>
            <Package className="h-4 w-4 text-indigo-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_products || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vendors</CardTitle>
            <Store className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_vendors || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_customers || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Briefcase className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_users || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* Pie chart */}
        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Cash Flow Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {hasFinancialData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => [formatRupee(value), 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <DollarSign className="h-10 w-10 text-slate-300" />
                <p>No financial data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Invoice & Order status */}
        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Invoice & Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={[
                { name: 'Invoices', ...Object.fromEntries(invoiceStatusData.map(d => [d.name, d.count])) },
                { name: 'Orders', ...Object.fromEntries(orderStatusData.map(d => [d.name, d.count])) },
              ]} barGap={4} barCategoryGap="30%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="Pending" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Approved" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Changes Req." fill="#ef4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Received" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent invoices */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Recent Invoices
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.recent_invoices && data.recent_invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Invoice #</th>
                    <th className="py-2 pr-4">Customer</th>
                    <th className="py-2 pr-4">Amount</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {data.recent_invoices.map((inv: any) => (
                    <tr key={inv.id} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium">{inv.invoice_number || '—'}</td>
                      <td className="py-3 pr-4">{inv.customer__business_name || '—'}</td>
                      <td className="py-3 pr-4 font-medium">{formatRupee(inv.total_amount || 0)}</td>
                      <td className="py-3 pr-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                          inv.status === 'PENDING_APPROVAL' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                          {inv.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 text-muted-foreground">
                        {inv.created_on ? new Date(inv.created_on).toLocaleDateString('en-IN') : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">No invoices yet</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ───────────── Admin Dashboard ─────────────
function AdminDashboard({ data }: { data: any }) {
  const pieData = [
    { name: 'Cash In', value: Number(data.cash_in) || 0, color: '#10b981' },
    { name: 'Cash Out', value: Number(data.cash_out) || 0, color: '#ef4444' },
  ];
  const hasFinancialData = pieData.some(d => d.value > 0);
  const firmBreakdown = data.firm_breakdown || [];

  return (
    <>
      {/* Top-level aggregated financial cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-emerald-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash In (All Firms)</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{formatRupee(data.cash_in || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all firms</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-red-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cash Out (All Firms)</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatRupee(data.cash_out || 0)}</div>
            <p className="text-xs text-muted-foreground mt-1">Across all firms</p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Profit (All Firms)</CardTitle>
            <TrendingUp className={`h-4 w-4 ${data.profit >= 0 ? 'text-emerald-500' : 'text-red-500'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${data.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              {formatRupee(data.profit || 0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">Aggregated profit</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Firms</CardTitle>
            <Briefcase className="h-4 w-4 text-violet-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_firms || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
            <FileText className="h-4 w-4 text-teal-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_invoices || 0}</div>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vendor Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.total_orders || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts: Pie + Per-firm bar */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-3 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Overall Cash Flow
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {hasFinancialData ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData.filter(d => d.value > 0)}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip
                    formatter={(value: number) => [formatRupee(value), 'Amount']}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <DollarSign className="h-10 w-10 text-slate-300" />
                <p>No financial data yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-4 hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Per-Firm Profit Comparison
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[320px]">
            {firmBreakdown.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={firmBreakdown} barCategoryGap="20%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <RechartsTooltip
                    formatter={(value: number, name: string) => [formatRupee(value), name]}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="cash_in" name="Cash In" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cash_out" name="Cash Out" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="profit" name="Profit" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground gap-2">
                <Briefcase className="h-10 w-10 text-slate-300" />
                <p>No firms registered yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Per-firm breakdown table */}
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Firm-wise Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {firmBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2 pr-4">Firm</th>
                    <th className="py-2 pr-4">Cash In</th>
                    <th className="py-2 pr-4">Cash Out</th>
                    <th className="py-2 pr-4">Profit</th>
                    <th className="py-2 pr-4">Products</th>
                    <th className="py-2 pr-4">Vendors</th>
                    <th className="py-2">Customers</th>
                  </tr>
                </thead>
                <tbody>
                  {firmBreakdown.map((firm: any) => (
                    <tr key={firm.slug} className="border-b last:border-0 hover:bg-slate-50">
                      <td className="py-3 pr-4 font-medium">{firm.name}</td>
                      <td className="py-3 pr-4 text-emerald-600">{formatRupee(firm.cash_in)}</td>
                      <td className="py-3 pr-4 text-red-600">{formatRupee(firm.cash_out)}</td>
                      <td className={`py-3 pr-4 font-medium ${firm.profit >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                        {formatRupee(firm.profit)}
                      </td>
                      <td className="py-3 pr-4">{firm.products}</td>
                      <td className="py-3 pr-4">{firm.vendors}</td>
                      <td className="py-3">{firm.customers}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-muted-foreground text-sm text-center py-6">No firms registered yet</p>
          )}
        </CardContent>
      </Card>
    </>
  );
}

// ───────────── Main Dashboard ─────────────
export default function DashboardHome() {
  const { user } = useAuth();
  const [cookies] = useCookies(["current_role", "firm"]);

  const role = cookies.current_role || user?.role;
  const firm_slug = useFirmSlug();

  const dashboardUrl = role === "admin"
    ? "/firm/dashboard/admin/"
    : `/firm/${firm_slug}/dashboard/`;

  const { data: dashboardResponse, isLoading } = useQuery<any>({
    queryKey: [dashboardUrl],
    enabled: !!user && (role === "admin" || !!firm_slug),
  });

  const dashboardData = dashboardResponse?.data?.data || {};

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 mt-[150px]">
      <AppBar
        title={role === 'admin' ? "Admin Dashboard" : "Firm Dashboard"}
        subTitle={
          role === 'admin'
            ? "Aggregated overview across all registered firms"
            : `Detailed financial & operational summary for ${dashboardData.firm_name || 'your firm'}`
        }
      />

      {role === 'admin'
        ? <AdminDashboard data={dashboardData} />
        : <FirmDashboard data={dashboardData} />
      }
    </div>
  );
}
