import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import SearchableSelect from "@/components/ui/custom/searchable-select";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { fetchAllFirmProducts } from "@/lib/fetch-all-firm-products";
import { useMutation, useQuery as useTanQuery } from "@tanstack/react-query";
import { FieldArray, Form, Formik, useFormikContext } from "formik";
import { AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import {
  formatFssaiDate,
  getFssaiRetailStatus,
} from "@/utils/fssai-retailer";
import { toast } from "sonner";
import * as Yup from "yup";

const defaultLine = () => ({
  product: null as any,
  quantity: 1,
  applied_discount_percent: "",
  scheme_buy_qty: "",
  scheme_free_qty: "",
});

function ProductOptionRow({ p }: { p: any }) {
  const stock = Number(p.available_quantity ?? 0);
  const scheme = p.scheme_type;
  const freeName = p.scheme_free_product_name;
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {p.product_code && (
          <span className="text-xs font-mono bg-gray-100 px-1 rounded text-gray-600">
            {p.product_code}
          </span>
        )}
        <span className="font-medium truncate">{p.name}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span>Rate: {p.rate_per_unit || p.sale_rate || "—"}</span>
        <span>MRP: {p.mrp || "—"}</span>
        <span className={stock <= 5 ? "text-orange-600 font-medium" : ""}>
          Stock: {stock}
        </span>
        {scheme && scheme !== "NONE" && (
          <span className="text-blue-600">
            {scheme === "BUY_X_GET_Y"
              ? `Buy ${p.scheme_buy_qty} Get ${p.scheme_free_qty} Free`
              : `Flat ${p.scheme_discount_percent}%`}
          </span>
        )}
      </div>
      {freeName && (
        <div className="text-[11px] text-blue-600">
          Free product: {freeName}
        </div>
      )}
    </div>
  );
}

function CustomerOptionRow({ c }: { c: any }) {
  const outstanding = Number(c.outstanding_balance ?? 0);
  const fssaiStatus = getFssaiRetailStatus(c.fssai_expiry);
  const fssaiLine =
    fssaiStatus === "expired" ? (
      <span className="text-red-600 font-medium">
        FSSAI expired ({formatFssaiDate(c.fssai_expiry)}) — cannot select
      </span>
    ) : fssaiStatus === "expiring_soon" ? (
      <span className="text-amber-700 font-medium">
        FSSAI expires {formatFssaiDate(c.fssai_expiry)} (within 7 days)
      </span>
    ) : fssaiStatus === "none" ? (
      <span className="text-gray-500">FSSAI expiry not set</span>
    ) : (
      <span className="text-gray-500">FSSAI valid until {formatFssaiDate(c.fssai_expiry)}</span>
    );
  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center gap-1.5">
        {c.reference_code && (
          <span className="text-xs font-mono bg-gray-100 px-1 rounded text-gray-600">
            {c.reference_code}
          </span>
        )}
        <span className="font-medium truncate">{c.business_name}</span>
      </div>
      <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
        <span>
          {c.customer_type === "SUPER_SELLER" ? "Super Seller" : "Distributor"}
        </span>
        {outstanding > 0 && (
          <span className="text-red-600 font-medium">
            Pending: ₹{outstanding.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </span>
        )}
      </div>
      <div className="text-[11px] leading-snug">{fssaiLine}</div>
    </div>
  );
}

function CustomerOutstandingBanner({ slug }: { slug: string }) {
  const { values } = useFormikContext<any>();
  const customer = values.customer;
  const customerId = customer?.id;
  const [expanded, setExpanded] = useState(false);

  const { data } = useTanQuery<any>({
    queryKey: [`/firm/${slug}/customers/${customerId}/outstanding`],
    queryFn: () => axios.get(`/firm/${slug}/customers/${customerId}/outstanding/`),
    enabled: !!slug && !!customerId,
    select: (res: any) => res?.data?.data,
  });

  if (!customerId || !data) return null;

  const totalOutstanding = Number(data.total_outstanding ?? 0);
  if (totalOutstanding <= 0) return null;

  const invoices: any[] = data.invoices ?? [];
  const fmtINR = (n: number) =>
    n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="rounded-lg border border-red-200 bg-red-50 overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center justify-between px-4 py-3 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-red-100">
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-red-800">
              Outstanding: ₹{fmtINR(totalOutstanding)}
            </p>
            <p className="text-xs text-red-600">
              {invoices.length} pending invoice{invoices.length !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        {invoices.length > 0 && (
          <div className="text-red-500">
            {expanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        )}
      </button>

      {expanded && invoices.length > 0 && (
        <div className="border-t border-red-200 px-2 py-2 overflow-x-auto">
          <table className="w-full text-xs min-w-[520px] sm:min-w-0">
            <thead>
              <tr className="text-red-700 font-medium">
                <th className="text-left py-1 px-2">Invoice</th>
                <th className="text-left py-1 px-2">Date</th>
                <th className="text-right py-1 px-2">Total</th>
                <th className="text-right py-1 px-2">Paid</th>
                <th className="text-right py-1 px-2 font-bold">Due</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv: any) => (
                <tr
                  key={inv.invoice_id}
                  className="border-t border-red-100 text-red-900"
                >
                  <td className="py-1.5 px-2 font-mono">
                    {inv.invoice_number || inv.invoice_id?.slice(0, 8)}
                  </td>
                  <td className="py-1.5 px-2 text-red-600">
                    {inv.created_on
                      ? new Date(inv.created_on).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })
                      : "—"}
                  </td>
                  <td className="py-1.5 px-2 text-right">
                    ₹{fmtINR(Number(inv.total_amount ?? 0))}
                  </td>
                  <td className="py-1.5 px-2 text-right text-green-700">
                    ₹{fmtINR(Number(inv.amount_paid ?? 0))}
                  </td>
                  <td className="py-1.5 px-2 text-right font-bold text-red-700">
                    ₹{fmtINR(Number(inv.amount_pending ?? 0))}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-red-300 font-semibold text-red-800">
                <td colSpan={4} className="py-1.5 px-2 text-right">
                  Total due
                </td>
                <td className="py-1.5 px-2 text-right">
                  ₹{fmtINR(totalOutstanding)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}

function OrderLineItem({
  index,
  products,
  canRemove,
  onRemove,
}: {
  index: number;
  products: any[];
  canRemove: boolean;
  onRemove: () => void;
}) {
  const { setFieldValue, values } = useFormikContext<any>();
  const line = values.items[index];
  const hasProduct = !!line?.product;
  const scheme = line?.product?.scheme_type;
  const hasScheme = scheme === "BUY_X_GET_Y";

  const handleProductSelect = (product: any | null) => {
    const prefix = `items.${index}`;
    if (!product) {
      setFieldValue(`${prefix}.applied_discount_percent`, "");
      setFieldValue(`${prefix}.scheme_buy_qty`, "");
      setFieldValue(`${prefix}.scheme_free_qty`, "");
      return;
    }
    const retailerDisc = Number(values.customer?.default_discount_percent ?? 0);
    const disc = product.no_discount ? 0 : retailerDisc;
    setFieldValue(`${prefix}.applied_discount_percent`, disc || "");

    if (product.scheme_type === "BUY_X_GET_Y") {
      setFieldValue(`${prefix}.scheme_buy_qty`, product.scheme_buy_qty || "");
      setFieldValue(`${prefix}.scheme_free_qty`, product.scheme_free_qty || "");
    } else {
      setFieldValue(`${prefix}.scheme_buy_qty`, "");
      setFieldValue(`${prefix}.scheme_free_qty`, "");
    }
  };

  return (
    <div className="border rounded-lg p-3 bg-gray-50/80 space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:gap-2 sm:items-start">
        <div className="flex-1 min-w-0 w-full">
          <SearchableSelect
            name={`items.${index}.product`}
            label="Product"
            placeholder="Search by product code or name..."
            options={products}
            getOptionLabel={(p: any) =>
              `${p.product_code ? `[${p.product_code}] ` : ""}${p.name}`
            }
            getOptionSearchText={(p: any) =>
              [p.product_code, p.name].filter(Boolean).join(" ")
            }
            getOptionValue={(p: any) => p.id}
            renderOption={(p: any) => <ProductOptionRow p={p} />}
            onSelect={handleProductSelect}
          />
        </div>
        <div className="flex items-end gap-2 shrink-0">
          <div className="w-24 sm:w-20">
            <CustomInput
              name={`items.${index}.quantity`}
              label="Qty"
              type="number"
              params={{ min: 1 }}
            />
          </div>
          <button
            type="button"
            className="mb-0.5 sm:mb-0 sm:mt-7 text-red-500 p-1.5 shrink-0 rounded-md hover:bg-red-50 disabled:opacity-40"
            onClick={onRemove}
            disabled={!canRemove}
            aria-label="Remove line"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {hasProduct && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <CustomInput
            name={`items.${index}.applied_discount_percent`}
            label="Disc %"
            type="number"
            placeholder="0"
            disabled={!hasProduct || !!line?.product?.no_discount}
          />
          <CustomInput
            name={`items.${index}.scheme_buy_qty`}
            label="Scheme buy"
            type="number"
            placeholder="—"
            disabled={!hasScheme}
          />
          <CustomInput
            name={`items.${index}.scheme_free_qty`}
            label="Scheme free"
            type="number"
            placeholder="—"
            disabled={!hasScheme}
          />
        </div>
      )}
    </div>
  );
}

const RetailerOrderDrawer = ({
  handleClose,
  open,
}: {
  handleClose: () => void;
  open: boolean;
}) => {
  const slug = useFirmSlug();

  const { data: customersRaw } = useQuery<any>({
    queryKey: [`/firm/${slug}/customers/`, { limit: 500 }],
    select: (res: any) => res?.data?.data?.rows ?? [],
    enabled: !!slug && open,
  });

  const { data: productsRaw } = useTanQuery({
    queryKey: [`/firm/${slug}/products/`, { allPages: true }],
    queryFn: () => fetchAllFirmProducts(slug!),
    enabled: !!slug && open,
  });

  const customers = (customersRaw || []).filter((c: any) => c.is_active);
  // Show all active products; stock can be 0 (e.g. migrated catalog without batches).
  const products = [...(productsRaw || [])]
    .filter((p: any) => p.is_active)
    .sort(
      (a: any, b: any) =>
        Number(b.available_quantity ?? 0) - Number(a.available_quantity ?? 0),
    );

  const validationSchema = Yup.object().shape({
    customer: Yup.object()
      .nullable()
      .required("Customer is required")
      .test(
        "fssai-not-expired",
        "This retailer's FSSAI has expired. Update FSSAI in retailer configuration or choose another retailer.",
        (c: any) => !c || getFssaiRetailStatus(c?.fssai_expiry) !== "expired",
      ),
    items: Yup.array()
      .of(
        Yup.object().shape({
          product: Yup.object().nullable().required("Product is required"),
          quantity: Yup.number().min(1).required(),
        }),
      )
      .min(1, "Add at least one line"),
  });

  const { mutate, isPending } = useMutation({
    mutationFn: (payload: any) =>
      axios.post(`/firm/${slug}/retailer-orders/`, payload),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "Order created");
      queryClient.invalidateQueries({
        queryKey: [`/firm/${slug}/retailer-orders/`],
      });
      handleClose();
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Failed to create order"));
    },
  });

  const buildItemsPayload = (rows: any[]) =>
    rows.map((row: any) => {
      const item: Record<string, unknown> = {
        product: row.product.id,
        quantity: Number(row.quantity),
      };
      const disc = String(row.applied_discount_percent ?? "").trim();
      if (disc !== "" && !Number.isNaN(Number(disc))) {
        item.applied_discount_percent = Number(disc);
      }
      const bq = String(row.scheme_buy_qty ?? "").trim();
      const fq = String(row.scheme_free_qty ?? "").trim();
      if (bq !== "" && fq !== "") {
        const buyN = Number(bq);
        const freeN = Number(fq);
        if (!Number.isNaN(buyN) && !Number.isNaN(freeN)) {
          item.scheme_applied = { buy_qty: buyN, free_qty: freeN };
        }
      }
      return item;
    });

  return (
    <Drawer open={open} onOpenChange={handleClose} width="600px">
      <div className="h-full min-h-0 flex flex-col overflow-hidden">
        <div className="h-[3.75rem] w-full shrink-0 border-b px-4 sm:px-5 bg-white border-[#D0D0D7] text-base sm:text-lg font-bold flex items-center">
          New retailer order
        </div>

        <Formik
          initialValues={{
            customer: null as any,
            reference: "",
            notes: "",
            items: [defaultLine()],
          }}
          validationSchema={validationSchema}
          onSubmit={(values) => {
            mutate({
              customer: values.customer.id,
              reference: values.reference || undefined,
              notes: values.notes || undefined,
              items: buildItemsPayload(values.items),
            });
          }}
        >
          {() => (
            <Form className="flex flex-col flex-1 min-h-0">
              <div className="flex flex-col gap-4 flex-1 min-h-0 overflow-y-auto overscroll-contain py-4 px-4 sm:px-5 pb-32 sm:pb-28">
                <SearchableSelect
                  name="customer"
                  label="Retailer (customer)"
                  placeholder="Search by name or code..."
                  options={customers}
                  getOptionLabel={(c: any) =>
                    `${c.reference_code ? `[${c.reference_code}] ` : ""}${c.business_name}`
                  }
                  getOptionValue={(c: any) => c.id}
                  renderOption={(c: any) => <CustomerOptionRow c={c} />}
                  isOptionDisabled={(c: any) => getFssaiRetailStatus(c.fssai_expiry) === "expired"}
                  required
                />
                <CustomerOutstandingBanner slug={slug} />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CustomInput name="reference" label="Reference (optional)" />
                  <CustomInput name="notes" label="Notes (optional)" />
                </div>

                <p className="text-sm font-semibold text-gray-700 pt-1">
                  Line items
                </p>
                <FieldArray name="items">
                  {({ push, remove, form }) => (
                    <div className="space-y-3">
                      {form.values.items.map((_: any, index: number) => (
                        <OrderLineItem
                          key={index}
                          index={index}
                          products={products}
                          canRemove={form.values.items.length > 1}
                          onRemove={() => remove(index)}
                        />
                      ))}
                      <CustomButton
                        type="button"
                        variant="outline"
                        className="w-full border-dashed"
                        onClick={() => push(defaultLine())}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Add line
                      </CustomButton>
                    </div>
                  )}
                </FieldArray>
              </div>

              <div className="shrink-0 flex flex-col-reverse sm:flex-row bg-white border-t w-full justify-stretch sm:justify-end items-stretch sm:items-center px-4 sm:px-5 pt-3 sm:pt-4 pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] sm:pb-4 gap-2 sm:gap-3">
                <CustomButton
                  variant="outline"
                  type="button"
                  onClick={handleClose}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </CustomButton>
                <CustomButton type="submit" isPending={isPending} className="w-full sm:w-auto">
                  Submit order
                </CustomButton>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </Drawer>
  );
};

export default RetailerOrderDrawer;
