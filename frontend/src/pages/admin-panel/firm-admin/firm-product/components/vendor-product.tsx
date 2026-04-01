import CustomButton from "@/components/ui/custom/custom-button";
import { Drawer } from "@/components/ui/custom/custom-drawer";
import CustomInput from "@/components/ui/custom/custom-input";
import CustomSelect from "@/components/ui/custom/custom-select";
import { getApiErrorMessage } from "@/config/api-error";
import { axios } from "@/config/axios";
import { queryClient } from "@/config/query-client";
import { useQuery } from "@/hooks/useQuerry";
import { useMutation } from "@tanstack/react-query";
import { Form, Formik, useFormikContext } from "formik";
import { useEffect, useMemo, useState } from "react";
import { useFirmSlug } from "@/hooks/useFirmSlug";
import { toast } from "sonner";
import * as Yup from "yup";

const activeOptions = [
  { id: "true", name: "Active" },
  { id: "false", name: "Inactive" },
];

const noDiscountOptions = [
  { id: "false", name: "Allow discount" },
  { id: "true", name: "No discount (locked)" },
];

const SAME_PRODUCT_SENTINEL = "__SAME__";

const schemeTypeOptions = [
  { id: "NONE", name: "No scheme" },
  { id: "BUY_X_GET_Y", name: "Buy X Get Y Free (same or different product)" },
  { id: "FLAT_DISCOUNT", name: "Flat discount" },
];

function SchemeFields({ products }: { products: any[] }) {
  const { values } = useFormikContext<any>();
  const schemeType = values.scheme_type?.id || "NONE";

  if (schemeType === "NONE") return null;

  const freeProductOptions = [
    { id: SAME_PRODUCT_SENTINEL, name: "Same product (self)" },
    ...products.map((p: any) => ({
      ...p,
      name: `${p.product_code ? `[${p.product_code}] ` : ""}${p.name}`,
    })),
  ];

  return (
    <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-4 space-y-3">
      <p className="text-xs font-semibold text-blue-700 uppercase tracking-wide">
        Scheme details
      </p>
      {schemeType === "BUY_X_GET_Y" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <CustomInput
              name="scheme_buy_qty"
              label="Buy quantity"
              type="number"
              placeholder="e.g. 10"
            />
            <CustomInput
              name="scheme_free_qty"
              label="Free quantity"
              type="number"
              placeholder="e.g. 1"
            />
          </div>
          <CustomSelect
            name="scheme_free_product"
            label="Free product"
            placeholder="Same product (self)"
            options={freeProductOptions}
            getOptionLabel={(p: any) => p.name}
            getOptionValue={(p: any) => String(p.id)}
          />
          <p className="text-xs text-blue-600">
            Pick "Same product" for BOGO, or select a different product to give
            free with this purchase.
          </p>
        </>
      )}
      {schemeType === "FLAT_DISCOUNT" && (
        <CustomInput
          name="scheme_discount_percent"
          label="Scheme discount %"
          type="number"
          placeholder="e.g. 10"
        />
      )}
    </div>
  );
}

const VendorProductDrawer = ({
  handleClose,
  id,
  row,
  open,
}: {
  handleClose: () => void;
  id?: string;
  row?: any;
  open: boolean;
}) => {
  const slug = useFirmSlug();

  const validationSchema = useMemo(
    () =>
      Yup.object().shape({
        name: Yup.string().required("Name is required"),
        gst_percent: Yup.number().min(0).nullable(),
        liters: Yup.number().min(0).nullable(),
        pack: Yup.number().min(0).nullable(),
        mrp: Yup.number().min(0).nullable(),
        purchase_rate: Yup.number().min(0).nullable(),
        purchase_rate_per_unit: Yup.number().min(0).nullable(),
        sale_rate: Yup.number().min(0).nullable(),
        rate_per_unit: Yup.number().min(0).nullable(),
        product_discount: Yup.number().min(0).max(100).nullable(),
      }),
    [],
  );

  const { data: SingleProductData } = useQuery<any>({
    queryKey: [`/firm/${slug}/products/${id}/`],
    select: (data: any) => data?.data?.data,
    enabled: !!id && !!slug && open,
  });

  const { data: productsData } = useQuery<any>({
    queryKey: [`/firm/${slug}/products/`, { limit: 500 }],
    select: (res: any) => res?.data?.data?.rows ?? [],
    enabled: !!slug && open,
  });

  const allProducts: any[] = productsData || [];

  const productsListKey = `/firm/${slug}/products/`;

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) =>
      id
        ? axios.put(`/firm/${slug}/products/${id}/`, data)
        : axios.post(`/firm/${slug}/products/`, data),
    onSuccess(data) {
      toast.success(data?.data?.message || "Saved");
      handleClose();
      queryClient.invalidateQueries({ queryKey: [productsListKey] });
    },
    onError: (resp: unknown) => {
      toast.error(getApiErrorMessage(resp, "Something went wrong!"));
    },
  });

  const findSchemeType = (val: string | undefined) =>
    schemeTypeOptions.find((o) => o.id === (val || "NONE")) || schemeTypeOptions[0];

  const sameProductOption = {
    id: SAME_PRODUCT_SENTINEL,
    name: "Same product (self)",
  };

  const empty = {
    product_code: "",
    name: "",
    description: "",
    category: "",
    hsn_code: "",
    gst_percent: "",
    liters: "",
    pack: "",
    mrp: "",
    purchase_rate: "",
    purchase_rate_per_unit: "",
    sale_rate: "",
    rate_per_unit: "",
    product_discount: "",
    no_discount: noDiscountOptions[0],
    scheme_type: schemeTypeOptions[0],
    scheme_buy_qty: "",
    scheme_free_qty: "",
    scheme_free_product: sameProductOption,
    scheme_discount_percent: "",
    is_active: activeOptions[0],
  };

  const [initialValues, setInitialValues] = useState(empty);

  useEffect(() => {
    if (SingleProductData) {
      const a = SingleProductData.is_active !== false;
      let freeProductOption = sameProductOption;
      if (SingleProductData.scheme_free_product) {
        const found = allProducts.find(
          (p: any) => p.id === SingleProductData.scheme_free_product,
        );
        freeProductOption = found
          ? {
              id: found.id,
              name: `${found.product_code ? `[${found.product_code}] ` : ""}${found.name}`,
            }
          : { id: SingleProductData.scheme_free_product, name: "Unknown" };
      }
      setInitialValues({
        product_code: SingleProductData.product_code ?? "",
        name: SingleProductData.name || "",
        description: SingleProductData.description || "",
        category: SingleProductData.category || "",
        hsn_code: SingleProductData.hsn_code || "",
        gst_percent: SingleProductData.gst_percent ?? "",
        liters: SingleProductData.liters ?? "",
        pack: SingleProductData.pack ?? "",
        mrp: SingleProductData.mrp ?? "",
        purchase_rate: SingleProductData.purchase_rate ?? "",
        purchase_rate_per_unit: SingleProductData.purchase_rate_per_unit ?? "",
        sale_rate: SingleProductData.sale_rate ?? "",
        rate_per_unit: SingleProductData.rate_per_unit ?? "",
        product_discount: SingleProductData.product_discount ?? "",
        no_discount: SingleProductData.no_discount
          ? noDiscountOptions[1]
          : noDiscountOptions[0],
        scheme_type: findSchemeType(SingleProductData.scheme_type),
        scheme_buy_qty: SingleProductData.scheme_buy_qty || "",
        scheme_free_qty: SingleProductData.scheme_free_qty || "",
        scheme_free_product: freeProductOption,
        scheme_discount_percent: SingleProductData.scheme_discount_percent ?? "",
        is_active: a ? activeOptions[0] : activeOptions[1],
      });
    } else if (!id) {
      setInitialValues(empty);
    }
  }, [SingleProductData, id, allProducts]);

  const toNum = (v: unknown) => {
    if (v === "" || v === null || v === undefined) return 0;
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return (
    <div>
      <Drawer open={open} onOpenChange={handleClose} width="520px">
        <div className="h-full overflow-y-auto">
          <div className="h-[3.75rem] w-full absolute top-0 z-50 border-b px-[20px] bg-white border-[#D0D0D7] text-[18px] font-bold py-[16px]">
            {row ? "Update product" : "Add product"}
          </div>

          <Formik
            initialValues={initialValues}
            validateOnMount
            validationSchema={validationSchema}
            onSubmit={(values: any) => {
              const st = values.scheme_type?.id || "NONE";
              const payload: Record<string, unknown> = {
                product_code: values.product_code?.trim() || null,
                name: values.name,
                description: values.description || null,
                category: values.category || null,
                hsn_code: values.hsn_code || null,
                gst_percent: toNum(values.gst_percent),
                liters: toNum(values.liters),
                pack: toNum(values.pack),
                mrp: toNum(values.mrp),
                purchase_rate: toNum(values.purchase_rate),
                purchase_rate_per_unit: toNum(values.purchase_rate_per_unit),
                sale_rate: toNum(values.sale_rate),
                rate_per_unit: toNum(values.rate_per_unit),
                product_discount: toNum(values.product_discount),
                no_discount: values.no_discount?.id === "true",
                scheme_type: st,
                scheme_buy_qty:
                  st === "BUY_X_GET_Y" ? toNum(values.scheme_buy_qty) : 0,
                scheme_free_qty:
                  st === "BUY_X_GET_Y" ? toNum(values.scheme_free_qty) : 0,
                scheme_free_product:
                  st === "BUY_X_GET_Y" &&
                  values.scheme_free_product?.id &&
                  values.scheme_free_product.id !== SAME_PRODUCT_SENTINEL
                    ? values.scheme_free_product.id
                    : null,
                scheme_discount_percent:
                  st === "FLAT_DISCOUNT"
                    ? toNum(values.scheme_discount_percent)
                    : 0,
                is_active: values.is_active?.id !== "false",
              };
              mutate(payload);
            }}
            enableReinitialize
          >
            {() => (
              <Form>
                <div className="flex flex-col gap-4 py-20 px-[20px]">
                  {/* Identity */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-1">
                    Identity
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <CustomInput
                      name="product_code"
                      label="Code"
                      placeholder="P001"
                      className="w-full"
                    />
                    <div className="col-span-2">
                      <CustomInput
                        name="name"
                        label="Item name"
                        required
                        className="w-full"
                      />
                    </div>
                  </div>
                  <CustomInput
                    name="description"
                    label="Description"
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CustomInput
                      name="category"
                      label="Category"
                      className="w-full"
                    />
                    <CustomInput
                      name="hsn_code"
                      label="HSN"
                      className="w-full"
                    />
                  </div>

                  {/* Tax & UOM */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
                    Tax &amp; UOM
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <CustomInput
                      name="gst_percent"
                      label="GST %"
                      type="number"
                      className="w-full"
                    />
                    <CustomInput
                      name="liters"
                      label="Liters"
                      type="number"
                      className="w-full"
                    />
                    <CustomInput
                      name="pack"
                      label="Pack"
                      type="number"
                      className="w-full"
                    />
                  </div>

                  {/* Pricing */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
                    Pricing
                  </p>
                  <CustomInput
                    name="mrp"
                    label="MRP"
                    type="number"
                    className="w-full"
                  />
                  <div className="grid grid-cols-2 gap-3">
                    <CustomInput
                      name="purchase_rate"
                      label="Purchase rate"
                      type="number"
                      className="w-full"
                    />
                    <CustomInput
                      name="purchase_rate_per_unit"
                      label="Purchase rate / unit"
                      type="number"
                      className="w-full"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <CustomInput
                      name="sale_rate"
                      label="Sale rate"
                      type="number"
                      className="w-full"
                    />
                    <CustomInput
                      name="rate_per_unit"
                      label="Rate / unit"
                      type="number"
                      className="w-full"
                    />
                  </div>

                  {/* Discount */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
                    Discount
                  </p>
                  <div className="grid grid-cols-2 gap-3">
                    <CustomInput
                      name="product_discount"
                      label="Default discount %"
                      type="number"
                      className="w-full"
                    />
                    <CustomSelect
                      name="no_discount"
                      label="Discount policy"
                      options={noDiscountOptions}
                      getOptionLabel={(o: any) => o.name}
                      getOptionValue={(o: any) => o.id}
                    />
                  </div>

                  {/* Scheme */}
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide pt-2">
                    Scheme / offer
                  </p>
                  <CustomSelect
                    name="scheme_type"
                    label="Scheme type"
                    options={schemeTypeOptions}
                    getOptionLabel={(o: any) => o.name}
                    getOptionValue={(o: any) => o.id}
                  />
                  <SchemeFields products={allProducts} />

                  {/* Status */}
                  <CustomSelect
                    name="is_active"
                    label="Status"
                    options={activeOptions}
                    getOptionLabel={(o: any) => o.name}
                    getOptionValue={(o: any) => o.id}
                    placeholder="Status"
                  />
                </div>

                <div className="mx-[28px] bg-white w-full flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
                  <div className="flex absolute bg-white bottom-0 right-0 border-t w-full justify-end items-center px-[28px] py-[16px] gap-5">
                    <CustomButton
                      variant="outline"
                      type="button"
                      onClick={() => handleClose()}
                    >
                      Cancel
                    </CustomButton>
                    <CustomButton
                      type="submit"
                      isPending={isPending}
                      disabled={isPending}
                    >
                      {id ? "Update" : "Add"}
                    </CustomButton>
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </Drawer>
    </div>
  );
};

export default VendorProductDrawer;
