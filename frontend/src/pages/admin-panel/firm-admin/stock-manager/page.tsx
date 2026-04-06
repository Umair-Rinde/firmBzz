import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { Datagrid, FilterConfig } from "@/components/ui/custom/datgrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ColumnDef } from "@tanstack/react-table";
import { Form, Formik } from "formik";
import { toast } from "sonner";
import * as Yup from "yup";

const MANUAL_REASONS = [
  { label: "Damage / loss", value: "DAMAGE" },
  { label: "Opening / migration stock", value: "OPENING_BALANCE" },
  { label: "Stock correction", value: "CORRECTION" },
  { label: "Other", value: "OTHER" },
];

const ledgerFilterConfig: FilterConfig[] = [
  {
    param: "entry_type",
    label: "Source",
    options: [
      { label: "Manual", value: "MANUAL" },
      { label: "Vendor receipt", value: "VENDOR_RECEIPT" },
      { label: "Invoice (sale)", value: "INVOICE_SALE" },
    ],
  },
];

export default function StockManagerPage() {
  const slug = useFirmSlug();

  const { data: productsData } = useQuery({
    queryKey: [`/firm/${slug}/products/`, { limit: 500 }],
    queryFn: () => axios.get(`/firm/${slug}/products/`, { params: { limit: 500 } }),
    enabled: !!slug,
  });
  const products = productsData?.data?.data?.rows || [];

  const stockColumns: ColumnDef<any>[] = [
    { header: "Code", accessorKey: "product_code", cell: ({ row }) => row.original.product_code || "—" },
    { header: "Product", accessorKey: "name" },
    {
      header: "Total qty",
      accessorKey: "total_quantity",
    },
    {
      header: "Batches (expiry → qty)",
      accessorKey: "batches",
      cell: ({ row }) => {
        const batches = row.original.batches || [];
        if (!batches.length) return <span className="text-slate-400">—</span>;
        return (
          <ul className="text-xs space-y-0.5 max-w-[280px]">
            {batches.map((b: any) => (
              <li key={b.id} className="truncate" title={b.id}>
                {b.expiry_date || "No expiry"} → {b.quantity}
              </li>
            ))}
          </ul>
        );
      },
    },
  ];

  const ledgerColumns: ColumnDef<any>[] = [
    {
      header: "When",
      accessorKey: "created_on",
      cell: ({ row }) => {
        const v = row.original.created_on;
        if (!v) return "—";
        try {
          return new Date(v).toLocaleString();
        } catch {
          return v;
        }
      },
    },
    { header: "Product", accessorKey: "product_name" },
    {
      header: "Δ Qty",
      accessorKey: "quantity_delta",
      cell: ({ row }) => {
        const n = row.original.quantity_delta;
        const cls = n > 0 ? "text-emerald-700 font-medium" : "text-red-700 font-medium";
        return <span className={cls}>{n > 0 ? `+${n}` : n}</span>;
      },
    },
    { header: "Source", accessorKey: "entry_type_display" },
    {
      header: "Reason",
      accessorKey: "manual_reason_display",
      cell: ({ row }) => row.original.manual_reason_display || "—",
    },
    {
      header: "Batch expiry",
      accessorKey: "batch_expiry",
      cell: ({ row }) => row.original.batch_expiry || "—",
    },
    { header: "By", accessorKey: "created_by_name" },
    { header: "Reference", accessorKey: "reference", cell: ({ row }) => row.original.reference || "—" },
    {
      header: "Note",
      accessorKey: "note",
      cell: ({ row }) => (
        <span className="max-w-[200px] truncate block" title={row.original.note}>
          {row.original.note || "—"}
        </span>
      ),
    },
  ];

  const validationSchema = Yup.object().shape({
    product: Yup.mixed().required("Product is required"),
    direction: Yup.string().oneOf(["in", "out"]).required(),
    quantity: Yup.number().min(1).required(),
    manual_reason: Yup.string().required("Reason is required"),
    note: Yup.string(),
    expiry_date: Yup.string().nullable(),
    product_batch: Yup.mixed().nullable(),
  });

  const { mutate: adjustStock, isPending } = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      axios.post(`/firm/${slug}/stock/adjust/`, payload),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Stock updated");
      queryClient.invalidateQueries({ queryKey: [`/firm/${slug}/stock/`] });
      queryClient.invalidateQueries({ queryKey: [`/firm/${slug}/stock/ledger/`] });
      queryClient.invalidateQueries({ queryKey: [`/firm/${slug}/products/`] });
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Adjustment failed"));
    },
  });

  return (
    <div className="dashboard-page-offset max-w-full min-w-0 space-y-8">
      <AppBar
        title="Stock manager"
        subTitle="View levels, manual adjustments (damage, migration, corrections), and full movement history"
      />

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Manual adjustment</CardTitle>
          <p className="text-sm text-slate-500 font-normal">
            Purchases still add stock via vendor order receive; sales still deduct via invoices. Use this for
            opening balances, damage, or corrections — every change is logged with user and time.
          </p>
        </CardHeader>
        <CardContent>
          <Formik
            initialValues={{
              product: null as any,
              direction: "in",
              quantity: 1,
              expiry_date: "",
              product_batch: null as any,
              manual_reason: null as any,
              note: "",
            }}
            validationSchema={validationSchema}
            enableReinitialize
            onSubmit={(values, { resetForm }) => {
              if (!values.product?.id) {
                toast.error("Select a product");
                return;
              }
              const payload: Record<string, unknown> = {
                product: values.product.id,
                direction: values.direction,
                quantity: values.quantity,
                manual_reason: values.manual_reason?.value || values.manual_reason,
                note: values.note || "",
              };
              if (values.direction === "in") {
                payload.expiry_date = values.expiry_date?.trim()
                  ? values.expiry_date.trim()
                  : null;
              } else {
                payload.product_batch = values.product_batch?.id || null;
              }
              adjustStock(payload, {
                onSuccess: () => {
                  resetForm({
                    values: {
                      product: null,
                      direction: values.direction,
                      quantity: 1,
                      expiry_date: "",
                      product_batch: null,
                      manual_reason: null,
                      note: "",
                    },
                  });
                },
              });
            }}
          >
            {({ values, setFieldValue, errors, touched }) => {
              const productId = values.product?.id;
              return (
                <Form className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <div>
                      <Label className="mb-2 block">Product</Label>
                      <CustomSelect
                        label=""
                        className="w-full min-w-[220px]"
                        options={products}
                        getOptionLabel={(o: any) =>
                          `${o.product_code ? `[${o.product_code}] ` : ""}${o.name}`
                        }
                        getOptionValue={(o: any) => o.id}
                        value={values.product}
                        onChange={(p: any) => {
                          setFieldValue("product", p);
                          setFieldValue("product_batch", null);
                        }}
                      />
                      {touched.product && errors.product && (
                        <p className="text-xs text-red-600 mt-1">{String(errors.product)}</p>
                      )}
                    </div>

                    <div>
                      <Label className="mb-2 block">Direction</Label>
                      <CustomSelect
                        label=""
                        className="w-full min-w-[180px]"
                        options={[
                          { label: "Stock in (+)", value: "in" },
                          { label: "Stock out (−)", value: "out" },
                        ]}
                        getOptionLabel={(o: any) => o.label}
                        getOptionValue={(o: any) => o.value}
                        value={
                          values.direction === "in"
                            ? { label: "Stock in (+)", value: "in" }
                            : { label: "Stock out (−)", value: "out" }
                        }
                        onChange={(o: any) => {
                          setFieldValue("direction", o?.value || "in");
                          setFieldValue("product_batch", null);
                        }}
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Quantity</Label>
                      <CustomInput
                        name="quantity"
                        type="number"
                        params={{ min: 1 }}
                        value={values.quantity}
                        onChange={(e: any) =>
                          setFieldValue("quantity", parseInt(e.target.value, 10) || 1)
                        }
                      />
                    </div>

                    <div>
                      <Label className="mb-2 block">Reason</Label>
                      <CustomSelect
                        label=""
                        className="w-full min-w-[220px]"
                        options={MANUAL_REASONS}
                        getOptionLabel={(o: any) => o.label}
                        getOptionValue={(o: any) => o.value}
                        value={values.manual_reason}
                        onChange={(o: any) => setFieldValue("manual_reason", o)}
                      />
                      {touched.manual_reason && errors.manual_reason && (
                        <p className="text-xs text-red-600 mt-1">{String(errors.manual_reason)}</p>
                      )}
                    </div>

                    {values.direction === "in" && (
                      <div>
                        <Label className="mb-2 block">Expiry date (optional)</Label>
                        <CustomInput
                          name="expiry_date"
                          type="date"
                          value={values.expiry_date}
                          onChange={(e: any) => setFieldValue("expiry_date", e.target.value)}
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Merges into the batch for this expiry (blank = no-expiry batch).
                        </p>
                      </div>
                    )}

                    {values.direction === "out" && productId && (
                      <BatchPick
                        firmSlug={slug}
                        productId={productId}
                        value={values.product_batch}
                        onChange={(b) => setFieldValue("product_batch", b)}
                      />
                    )}
                  </div>

                  <div>
                    <Label className="mb-2 block">Note (optional)</Label>
                    <CustomInput
                      name="note"
                      value={values.note}
                      onChange={(e: any) => setFieldValue("note", e.target.value)}
                      placeholder="e.g. Anmol migration — no PO on file"
                    />
                  </div>

                  <CustomButton type="submit" disabled={isPending}>
                    {isPending ? "Applying…" : "Apply adjustment"}
                  </CustomButton>
                </Form>
              );
            }}
          </Formik>
        </CardContent>
      </Card>

      <Datagrid
        columns={stockColumns}
        title="Current stock by product"
        url={slug ? `/firm/${slug}/stock/` : undefined}
        disableFilters={false}
        filterConfig={[
          {
            param: "is_active",
            label: "Catalog status",
            options: [
              { label: "Active", value: "true" },
              { label: "Inactive", value: "false" },
            ],
          },
        ]}
      />

      <Datagrid
        columns={ledgerColumns}
        title="Stock movement log"
        url={slug ? `/firm/${slug}/stock/ledger/` : undefined}
        disableFilters={false}
        filterConfig={ledgerFilterConfig}
      />
    </div>
  );
}

function BatchPick({
  firmSlug,
  productId,
  value,
  onChange,
}: {
  firmSlug: string | null;
  productId: string;
  value: any;
  onChange: (b: any) => void;
}) {
  const { data } = useQuery({
    queryKey: [`/firm/${firmSlug}/stock/`, { product: productId, limit: 20 }],
    queryFn: () =>
      axios.get(`/firm/${firmSlug}/stock/`, { params: { product: productId, limit: 50 } }),
    enabled: !!firmSlug && !!productId,
  });
  const rows = data?.data?.data?.rows || [];
  const row = rows[0];
  const batches = row?.batches || [];
  const options = [
    { label: "Auto (FEFO by expiry)", value: "__fefo__", batch: null },
    ...batches.map((b: any) => ({
      label: `${b.expiry_date || "No expiry"} — ${b.quantity} pcs`,
      value: b.id,
      batch: { id: b.id },
    })),
  ];

  const selected = !value?.id
    ? options[0]
    : options.find((o: any) => o.batch?.id === value.id) || options[0];

  return (
    <div>
      <Label className="mb-2 block">Take from batch (stock out)</Label>
      <CustomSelect
        label=""
        className="w-full min-w-[220px]"
        options={options}
        getOptionLabel={(o: any) => o.label}
        getOptionValue={(o: any) => o.value}
        value={selected}
        onChange={(o: any) => onChange(o?.batch ?? null)}
      />
      <p className="text-xs text-slate-500 mt-1">
        Leave on auto to deduct using the same FEFO rules as invoicing.
      </p>
    </div>
  );
}
