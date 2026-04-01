import AppBar from "@/components/ui/custom/app-bar";
import CustomButton from "@/components/ui/custom/custom-button";
import SearchableSelect from "@/components/ui/custom/searchable-select";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik, useFormikContext } from "formik";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { toast } from "sonner";
import * as Yup from "yup";

interface InvoiceLine {
  product: any;
  quantity: number;
  discount_percent: number;
  include_scheme: boolean;
  free_quantity: number;
  original_qty: number;
}

function mergeOrderLines(orders: any[]): InvoiceLine[] {
  const map = new Map<string, InvoiceLine>();
  for (const o of orders) {
    for (const line of o.items || []) {
      const pid = line.product;
      const existing = map.get(pid);
      const product =
        typeof line.product_obj === "object" ? line.product_obj : null;
      const qty = Number(line.quantity);
      const disc = Number(line.applied_discount_percent ?? 0);
      const scheme = line.scheme_applied || {};
      const freeQty = Number(scheme.free_qty ?? 0);
      if (existing) {
        existing.quantity += qty;
        existing.original_qty += qty;
        existing.free_quantity += freeQty;
      } else {
        map.set(pid, {
          product: product || { id: pid, name: line.product_name || pid },
          quantity: qty,
          discount_percent: disc,
          include_scheme: freeQty > 0,
          free_quantity: freeQty,
          original_qty: qty,
        });
      }
    }
  }
  return Array.from(map.values());
}

function OrderSelector({
  allOrders,
  selectedIds,
  toggle,
}: {
  allOrders: any[];
  selectedIds: Set<string>;
  toggle: (id: string) => void;
}) {
  if (allOrders.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No submitted orders for this retailer.
      </p>
    );
  }
  return (
    <ul className="divide-y rounded-lg border border-gray-200 max-h-56 overflow-y-auto">
      {allOrders.map((o: any) => (
        <li
          key={o.id}
          className="flex items-start gap-3 p-3 hover:bg-gray-50 cursor-pointer"
          onClick={() => toggle(o.id)}
        >
          <input
            type="checkbox"
            className="mt-1"
            checked={selectedIds.has(o.id)}
            readOnly
          />
          <div className="flex-1 text-sm">
            <div className="font-medium text-gray-800">
              {o.reference || "Order"} · {o.items?.length ?? 0} line(s)
            </div>
            <div className="text-gray-500 text-xs mt-0.5">
              {o.created_on ? new Date(o.created_on).toLocaleString() : ""}
              {o.created_by_name ? ` · ${o.created_by_name}` : ""}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function EditableLineItems({
  lines,
  setLines,
  products,
}: {
  lines: InvoiceLine[];
  setLines: React.Dispatch<React.SetStateAction<InvoiceLine[]>>;
  products: any[];
}) {
  const updateLine = (idx: number, patch: Partial<InvoiceLine>) => {
    setLines((prev) => prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)));
  };

  const removeLine = (idx: number) => {
    setLines((prev) => prev.filter((_, i) => i !== idx));
  };

  const addLine = (product: any) => {
    if (!product) return;
    if (lines.some((l) => l.product?.id === product.id)) {
      toast.error("Product already in the list");
      return;
    }
    const disc = product.no_discount ? 0 : Number(product.product_discount ?? 0);
    const hasScheme = product.scheme_type === "BUY_X_GET_Y";
    setLines((prev) => [
      ...prev,
      {
        product,
        quantity: 1,
        discount_percent: disc,
        include_scheme: hasScheme,
        free_quantity: hasScheme ? Number(product.scheme_free_qty ?? 0) : 0,
        original_qty: 0,
      },
    ]);
  };

  const inStockProducts = products.filter(
    (p: any) => p.is_active && Number(p.available_quantity ?? 0) > 0,
  );

  return (
    <div className="space-y-3">
      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 text-left text-gray-500 font-medium">
              <th className="p-3 border-b min-w-[200px]">Product</th>
              <th className="p-3 border-b text-center w-20">Order Qty</th>
              <th className="p-3 border-b text-center w-24">Invoice Qty</th>
              <th className="p-3 border-b text-center w-24">Disc %</th>
              <th className="p-3 border-b text-center w-20">Scheme</th>
              <th className="p-3 border-b text-center w-20">Free Qty</th>
              <th className="p-3 border-b text-center w-12"></th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => {
              const noDiscount = line.product?.no_discount === true;
              const hasScheme =
                line.product?.scheme_type === "BUY_X_GET_Y" && line.include_scheme;
              return (
                <tr key={line.product?.id || idx} className="border-b last:border-0">
                  <td className="p-3">
                    <div className="font-medium text-gray-800 truncate">
                      {line.product?.product_code && (
                        <span className="text-xs font-mono bg-gray-100 px-1 rounded mr-1">
                          {line.product.product_code}
                        </span>
                      )}
                      {line.product?.name}
                    </div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      Rate: {line.product?.rate_per_unit || line.product?.sale_rate || "—"}
                      {" · "}Stock: {line.product?.available_quantity ?? "—"}
                      {noDiscount && (
                        <span className="ml-2 text-red-500 font-medium">No discount</span>
                      )}
                    </div>
                  </td>
                  <td className="p-3 text-center text-gray-500">
                    {line.original_qty || "—"}
                  </td>
                  <td className="p-3 text-center">
                    <input
                      type="number"
                      min={1}
                      value={line.quantity}
                      onChange={(e) =>
                        updateLine(idx, {
                          quantity: Math.max(1, Number(e.target.value) || 1),
                        })
                      }
                      className="w-20 text-center border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                    />
                  </td>
                  <td className="p-3 text-center">
                    {noDiscount ? (
                      <span className="text-gray-400 text-xs">Locked (0)</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={0.01}
                        value={line.discount_percent}
                        onChange={(e) =>
                          updateLine(idx, {
                            discount_percent: Math.min(
                              100,
                              Math.max(0, Number(e.target.value) || 0),
                            ),
                          })
                        }
                        className="w-20 text-center border border-gray-200 rounded-md px-2 py-1.5 text-sm focus:ring-2 focus:ring-primary/30 focus:border-primary outline-none"
                      />
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {line.product?.scheme_type === "BUY_X_GET_Y" ? (
                      <label className="flex items-center justify-center gap-1 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={line.include_scheme}
                          onChange={(e) =>
                            updateLine(idx, {
                              include_scheme: e.target.checked,
                              free_quantity: e.target.checked
                                ? Number(line.product?.scheme_free_qty ?? 0)
                                : 0,
                            })
                          }
                        />
                        <span className="text-xs text-gray-600">
                          {line.include_scheme ? "On" : "Off"}
                        </span>
                      </label>
                    ) : (
                      <span className="text-gray-400 text-xs">—</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    {hasScheme ? (
                      <span className="text-blue-600 font-medium">
                        {line.free_quantity}
                      </span>
                    ) : (
                      <span className="text-gray-400">0</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-red-400 hover:text-red-600 p-1"
                      title="Remove line"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {lines.length === 0 && (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-400">
                  No line items. Select orders above or add products manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddProductRow products={inStockProducts} onAdd={addLine} />
    </div>
  );
}

function AddProductRow({
  products,
  onAdd,
}: {
  products: any[];
  onAdd: (p: any) => void;
}) {
  return (
    <Formik initialValues={{ newProduct: null as any }} onSubmit={() => {}}>
      {({ values, setFieldValue }) => (
        <div className="flex gap-2 items-end">
          <div className="flex-1">
            <SearchableSelect
              name="newProduct"
              placeholder="Search product to add..."
              options={products}
              getOptionLabel={(p: any) =>
                `${p.product_code ? `[${p.product_code}] ` : ""}${p.name} (stock ${p.available_quantity ?? 0})`
              }
              getOptionValue={(p: any) => p.id}
              onSelect={(p) => {
                if (p) {
                  onAdd(p);
                  setTimeout(() => setFieldValue("newProduct", null), 0);
                }
              }}
            />
          </div>
          <CustomButton
            type="button"
            variant="outline"
            className="border-dashed shrink-0 h-[44px]"
            onClick={() => {
              if (values.newProduct) {
                onAdd(values.newProduct);
                setFieldValue("newProduct", null);
              }
            }}
          >
            <Plus className="h-4 w-4 mr-1" /> Add
          </CustomButton>
        </div>
      )}
    </Formik>
  );
}

function InvoiceFormBody({
  firmId,
  customers,
  products,
  allOrders,
  navigate,
}: {
  firmId: string;
  customers: any[];
  products: any[];
  allOrders: any[];
  navigate: ReturnType<typeof useNavigate>;
}) {
  const [selectedOrderIds, setSelectedOrderIds] = useState<Set<string>>(
    new Set(),
  );
  const [lines, setLines] = useState<InvoiceLine[]>([]);

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => axios.post(`/firm/${firmId}/invoices/`, data),
    onSuccess: (res: any) => {
      toast.success("Invoice created successfully");
      queryClient.invalidateQueries({ queryKey: [`/firm/${firmId}/invoices/`] });
      navigate(`/dashboard/${firmId}/invoices/${res.data.data.id}`);
    },
    onError: (err: unknown) => {
      toast.error(getApiErrorMessage(err, "Failed to create invoice"));
    },
  });

  return (
    <Formik
      initialValues={{ customer: null as any }}
      validationSchema={Yup.object().shape({
        customer: Yup.object().nullable().required("Customer is required"),
      })}
      onSubmit={() => {
        if (selectedOrderIds.size === 0) {
          toast.error("Select at least one submitted order");
          return;
        }
        if (lines.length === 0) {
          toast.error("At least one line item is required");
          return;
        }
        mutate({
          retailer_order_ids: Array.from(selectedOrderIds),
          line_items: lines.map((l) => ({
            product: l.product.id,
            quantity: l.quantity,
            discount_percent: l.product.no_discount ? 0 : l.discount_percent,
            include_scheme: l.include_scheme,
            free_quantity: l.include_scheme ? l.free_quantity : 0,
          })),
        });
      }}
    >
      {() => (
        <InvoiceFormInner
          firmId={firmId}
          customers={customers}
          products={products}
          allOrders={allOrders}
          selectedOrderIds={selectedOrderIds}
          setSelectedOrderIds={setSelectedOrderIds}
          lines={lines}
          setLines={setLines}
          isPending={isPending}
          navigate={navigate}
        />
      )}
    </Formik>
  );
}

function InvoiceFormInner({
  firmId,
  customers,
  products,
  allOrders,
  selectedOrderIds,
  setSelectedOrderIds,
  lines,
  setLines,
  isPending,
  navigate,
}: {
  firmId: string;
  customers: any[];
  products: any[];
  allOrders: any[];
  selectedOrderIds: Set<string>;
  setSelectedOrderIds: React.Dispatch<React.SetStateAction<Set<string>>>;
  lines: InvoiceLine[];
  setLines: React.Dispatch<React.SetStateAction<InvoiceLine[]>>;
  isPending: boolean;
  navigate: ReturnType<typeof useNavigate>;
}) {
  const { values } = useFormikContext<{ customer: any }>();

  const submittedForCustomer = useMemo(() => {
    if (!values.customer) return [];
    return allOrders.filter(
      (o: any) =>
        o.customer === values.customer.id && o.status === "SUBMITTED",
    );
  }, [allOrders, values.customer]);

  useEffect(() => {
    setSelectedOrderIds(new Set());
    setLines([]);
  }, [values.customer?.id]);

  const productMap = useMemo(() => {
    const m = new Map<string, any>();
    for (const p of products) m.set(p.id, p);
    return m;
  }, [products]);

  const toggleOrder = useCallback(
    (orderId: string) => {
      setSelectedOrderIds((prev) => {
        const next = new Set(prev);
        if (next.has(orderId)) next.delete(orderId);
        else next.add(orderId);

        const selectedOrders = allOrders.filter((o: any) => next.has(o.id));
        const enriched = selectedOrders.map((o: any) => ({
          ...o,
          items: (o.items || []).map((item: any) => ({
            ...item,
            product_obj: productMap.get(item.product) || null,
          })),
        }));
        setLines(mergeOrderLines(enriched));
        return next;
      });
    },
    [allOrders, productMap, setSelectedOrderIds, setLines],
  );

  return (
    <Form className="space-y-6">
      <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-4">
              Retailer
            </h3>
            <SearchableSelect
              name="customer"
              label="Customer"
              placeholder="Search retailer..."
              options={customers}
              getOptionLabel={(c: any) =>
                `${c.reference_code ? `[${c.reference_code}] ` : ""}${c.business_name}`
              }
              getOptionValue={(c: any) => c.id}
              required
            />
          </div>
        </div>

        {values.customer && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Submitted orders
            </h3>
            <OrderSelector
              allOrders={submittedForCustomer}
              selectedIds={selectedOrderIds}
              toggle={toggleOrder}
            />
          </div>
        )}
      </div>

      {selectedOrderIds.size > 0 && (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-700">
              Invoice line items
            </h3>
            <p className="text-xs text-gray-500">
              Adjust quantities, discounts, and schemes before creating the invoice.
            </p>
          </div>
          <EditableLineItems
            lines={lines}
            setLines={setLines}
            products={products}
          />
        </div>
      )}

      <div className="flex justify-end gap-4">
        <CustomButton
          variant="outline"
          type="button"
          onClick={() => navigate(-1)}
        >
          Cancel
        </CustomButton>
        <CustomButton
          type="submit"
          isPending={isPending}
          disabled={
            isPending ||
            !values.customer ||
            selectedOrderIds.size === 0 ||
            lines.length === 0
          }
          className="min-w-[150px]"
        >
          Create invoice
        </CustomButton>
      </div>
    </Form>
  );
}

const InvoiceCreatePage = () => {
  const firmId = useFirmSlug();
  const navigate = useNavigate();

  const { data: customersRaw } = useQuery<any>({
    queryKey: [`/firm/${firmId}/customers/`, { limit: 500 }],
    select: (res: any) => res?.data?.data?.rows ?? [],
    enabled: !!firmId,
  });

  const { data: ordersRaw } = useQuery<any>({
    queryKey: [`/firm/${firmId}/retailer-orders/`, { limit: 500 }],
    select: (res: any) => res?.data?.data?.rows ?? [],
    enabled: !!firmId,
  });

  const { data: productsRaw } = useQuery<any>({
    queryKey: [`/firm/${firmId}/products/`, { limit: 500 }],
    select: (res: any) => res?.data?.data?.rows ?? [],
    enabled: !!firmId,
  });

  const customers = (customersRaw || []).filter((c: any) => c.is_active);
  const allOrders = ordersRaw || [];
  const products = productsRaw || [];

  return (
    <div className="mt-[150px] px-6 pb-20">
      <div className="flex items-center gap-4 mb-6">
        <CustomButton variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4" />
        </CustomButton>
        <AppBar
          title="Create invoice"
          subTitle="Select orders, then review and adjust line items before invoicing."
        />
      </div>

      {firmId && (
        <InvoiceFormBody
          firmId={firmId}
          customers={customers}
          products={products}
          allOrders={allOrders}
          navigate={navigate}
        />
      )}
    </div>
  );
};

export default InvoiceCreatePage;
