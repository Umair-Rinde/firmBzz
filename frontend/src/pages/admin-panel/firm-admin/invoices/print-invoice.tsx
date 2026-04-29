import { axios } from "@/config/axios";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useFirmSlug } from "@/hooks/useFirmSlug";

function numberToWords(num: number): string {
  if (num === 0) return "Zero";
  const ones = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine",
    "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
  const tens = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? " " + ones[n % 10] : "");
    if (n < 1000) return ones[Math.floor(n / 100)] + " Hundred" + (n % 100 ? " and " + convert(n % 100) : "");
    if (n < 100000) return convert(Math.floor(n / 1000)) + " Thousand" + (n % 1000 ? " " + convert(n % 1000) : "");
    if (n < 10000000) return convert(Math.floor(n / 100000)) + " Lakh" + (n % 100000 ? " " + convert(n % 100000) : "");
    return convert(Math.floor(n / 10000000)) + " Crore" + (n % 10000000 ? " " + convert(n % 10000000) : "");
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let words = "Rupees " + convert(rupees);
  if (paise > 0) words += " and " + convert(paise) + " Paise";
  return words + " Only";
}

const fmtINR = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

export default function PrintInvoicePage() {
  const params = useParams();
  const firmId = useFirmSlug();
  const id = params.id;
  const hasPrinted = useRef(false);
  const [markingPrinted, setMarkingPrinted] = useState(false);
  const [copyMode, setCopyMode] = useState<"both" | "original" | "duplicate">("both");

  const invoiceUrl = firmId && id ? `/firm/${firmId}/invoices/${id}/` : null;
  const firmUrl = firmId ? `/firm/${firmId}/` : null;

  const { data: invoiceData, isLoading } = useQuery({
    queryKey: ["print-invoice", firmId, id],
    queryFn: () => axios.get(invoiceUrl!),
    enabled: !!invoiceUrl,
  });

  const { data: firmData } = useQuery({
    queryKey: ["print-firm", firmId],
    queryFn: () => axios.get(firmUrl!),
    enabled: !!firmUrl,
  });

  const { mutate: markPrinted } = useMutation({
    mutationFn: () => axios.post(`/firm/${firmId}/invoices/${id}/print/`),
  });

  const invoice = invoiceData?.data?.data;
  const firm = firmData?.data?.data;

  useEffect(() => {
    if (!invoice || hasPrinted.current) return;
    hasPrinted.current = true;

    const timer = setTimeout(() => {
      if (!invoice.is_printed) {
        setMarkingPrinted(true);
        markPrinted(undefined, {
          onSettled: () => {
            setMarkingPrinted(false);
            window.print();
          },
        });
      } else {
        window.print();
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [invoice]);

  if (!firmId || !id) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500 text-lg">Invalid URL — missing firm or invoice ID.</p>
      </div>
    );
  }

  if (isLoading || !invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">Loading invoice...</p>
      </div>
    );
  }

  const items: any[] = invoice.items || [];
  const total = Number(invoice.total_amount ?? 0);
  const amountPaid = Number(invoice.amount_paid ?? 0);
  const amountPending = Number(invoice.amount_pending ?? 0);

  let subtotal = 0;
  let totalGst = 0;
  let totalDiscount = 0;
  for (const item of items) {
    const qty = Number(item.quantity);
    const rate = Number(item.rate);
    const disc = Number(item.discount_percent ?? 0);
    const gst = Number(item.gst_percent ?? 0);
    const base = qty * rate;
    const discAmt = base * (disc / 100);
    const afterDisc = base - discAmt;
    const gstAmt = afterDisc * (gst / 100);
    subtotal += base;
    totalDiscount += discAmt;
    totalGst += gstAmt;
  }

  return (
    <>
      <style>{`
        @media print {
          @page { size: A4; margin: 12mm 10mm; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          .no-print { display: none !important; }
          .page-break { break-after: page; page-break-after: always; }
          .copy-label { display: block !important; }
          .mode-original .copy-duplicate { display: none !important; }
          .mode-duplicate .copy-original { display: none !important; }
          /* When printing only one copy, don't force a blank page */
          .mode-original .page-break { display: none !important; }
          .mode-duplicate .page-break { display: none !important; }
        }
        .copy-label { display: none; }
      `}</style>

      <div className="no-print fixed top-0 left-0 right-0 bg-white border-b z-50 px-6 py-3 flex items-center justify-between shadow-sm">
        <span className="text-sm text-gray-500">
          {markingPrinted ? "Marking as printed..." : "Print preview ready"}
        </span>
        <div className="flex gap-3">
          <button
            onClick={() => setCopyMode("both")}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              copyMode === "both" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Both Copies
          </button>
          <button
            onClick={() => setCopyMode("original")}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              copyMode === "original" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Original Only
          </button>
          <button
            onClick={() => setCopyMode("duplicate")}
            className={`px-3 py-2 rounded-lg text-sm font-medium border ${
              copyMode === "duplicate" ? "bg-gray-900 text-white border-gray-900" : "bg-white text-gray-700 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Duplicate Only
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Print Again
          </button>
          <button
            onClick={() => window.close()}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>

      <div
        className={`max-w-[210mm] mx-auto bg-white ${copyMode === "original" ? "mode-original" : copyMode === "duplicate" ? "mode-duplicate" : ""}`}
        style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
      >
        <div className="px-8 pt-16 pb-8" style={{ fontSize: "11px", lineHeight: "1.4" }}>

          {(() => {
            const InvoiceCopy = ({ label, className }: { label: string; className: string }) => (
              <div className={className}>
                <div className="copy-label text-center mb-2">
                  <span className="inline-block px-3 py-1 border border-black text-[10px] font-bold uppercase tracking-widest">
                    {label}
                  </span>
                </div>

                {/* Header */}
                <div className="border-2 border-black">
                  <div className="text-center py-3 border-b-2 border-black bg-gray-50">
                    <h1 className="text-xl font-bold tracking-wide uppercase">
                      {firm?.legal_name || firm?.name || ""}
                    </h1>
                    {firm?.code && (
                      <p className="text-xs text-gray-600 mt-0.5">Code: {firm.code}</p>
                    )}
                    {(firm?.address || firm?.gstin || firm?.fssai_number || firm?.email || firm?.phone || firm?.state || firm?.state_code) && (
                      <div className="mt-1 text-[10px] text-gray-700 leading-snug">
                        {firm?.address && <p className="whitespace-pre-line">{firm.address}</p>}
                        <p className="mt-0.5">
                          {firm?.gstin && <span className="mr-2"><span className="font-semibold">GSTIN</span>: {firm.gstin}</span>}
                          {firm?.fssai_number && <span className="mr-2"><span className="font-semibold">FSSAI</span>: {firm.fssai_number}</span>}
                        </p>
                        <p>
                          {firm?.email && <span className="mr-2"><span className="font-semibold">Email</span>: {firm.email}</span>}
                          {firm?.phone && <span className="mr-2"><span className="font-semibold">Phone</span>: {firm.phone}</span>}
                        </p>
                        {(firm?.state || firm?.state_code) && (
                          <p>
                            <span className="font-semibold">State</span>: {firm?.state || "—"}
                            {firm?.state_code ? <span> ({firm.state_code})</span> : null}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-center py-2 border-b border-black">
                    <h2 className="text-base font-bold tracking-widest uppercase">TAX INVOICE</h2>
                  </div>

                  {/* Invoice meta */}
                  <div className="grid grid-cols-2 border-b border-black">
                    <div className="p-3 border-r border-black">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="font-semibold pr-2 py-0.5 whitespace-nowrap">Invoice No:</td>
                            <td className="py-0.5 font-bold">{invoice.invoice_number || "—"}</td>
                          </tr>
                          <tr>
                            <td className="font-semibold pr-2 py-0.5 whitespace-nowrap">Date:</td>
                            <td className="py-0.5">{invoice.created_on ? fmtDate(invoice.created_on) : "—"}</td>
                          </tr>
                          <tr>
                            <td className="font-semibold pr-2 py-0.5 whitespace-nowrap">Status:</td>
                            <td className="py-0.5">{invoice.status_display || invoice.status}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <div className="p-3">
                      <table className="w-full">
                        <tbody>
                          <tr>
                            <td className="font-semibold pr-2 py-0.5 whitespace-nowrap">Created By:</td>
                            <td className="py-0.5">{invoice.created_by_name || "—"}</td>
                          </tr>
                          {invoice.approved_by_name && (
                            <tr>
                              <td className="font-semibold pr-2 py-0.5 whitespace-nowrap">Approved By:</td>
                              <td className="py-0.5">{invoice.approved_by_name}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bill To */}
                  <div className="p-3 border-b border-black">
                    <p className="font-bold mb-1 text-xs uppercase tracking-wide">Bill To:</p>
                    <p className="font-bold text-sm">{invoice.customer_name}</p>
                    <p className="text-gray-700">
                      Type: {invoice.customer_type === "SUPER_SELLER" ? "Super Seller" : "Distributor"}
                      {invoice.customer_reference_code && <span> &middot; Ref: {invoice.customer_reference_code}</span>}
                    </p>
                  </div>

                  {/* Items table */}
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border-b border-r border-black p-2 text-left w-8">#</th>
                        <th className="border-b border-r border-black p-2 text-left">Product</th>
                        <th className="border-b border-r border-black p-2 text-left w-16">HSN</th>
                        <th className="border-b border-r border-black p-2 text-right w-12">Qty</th>
                        <th className="border-b border-r border-black p-2 text-right w-12">Free</th>
                        <th className="border-b border-r border-black p-2 text-right w-20">Rate (₹)</th>
                        <th className="border-b border-r border-black p-2 text-right w-14">Disc %</th>
                        <th className="border-b border-r border-black p-2 text-right w-14">GST %</th>
                        <th className="border-b border-black p-2 text-right w-24">Amount (₹)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, idx: number) => {
                        const lineAmt = item.line_total != null ? Number(item.line_total) : Number(item.quantity) * Number(item.rate);
                        return (
                          <tr key={item.id || idx} className={idx % 2 === 0 ? "" : "bg-gray-50"}>
                            <td className="border-b border-r border-black p-2 text-center">{idx + 1}</td>
                            <td className="border-b border-r border-black p-2">
                              {item.product_name || item.product}
                              {item.batch_expiry && (
                                <span className="text-gray-500 ml-1">(Exp: {item.batch_expiry})</span>
                              )}
                            </td>
                            <td className="border-b border-r border-black p-2">{item.hsn_code || "—"}</td>
                            <td className="border-b border-r border-black p-2 text-right">{item.quantity}</td>
                            <td className="border-b border-r border-black p-2 text-right">
                              {item.free_quantity > 0 ? item.free_quantity : "—"}
                            </td>
                            <td className="border-b border-r border-black p-2 text-right">{fmtINR(Number(item.rate))}</td>
                            <td className="border-b border-r border-black p-2 text-right">
                              {Number(item.discount_percent) > 0 ? `${Number(item.discount_percent).toFixed(1)}` : "—"}
                            </td>
                            <td className="border-b border-r border-black p-2 text-right">
                              {Number(item.gst_percent) > 0 ? `${Number(item.gst_percent).toFixed(1)}` : "—"}
                            </td>
                            <td className="border-b border-black p-2 text-right font-medium">{fmtINR(lineAmt)}</td>
                          </tr>
                        );
                      })}

                      {/* Padding rows to fill page if few items */}
                      {items.length < 5 && Array.from({ length: 5 - items.length }).map((_, i) => (
                        <tr key={`pad-${i}`}>
                          <td className="border-b border-r border-black p-2">&nbsp;</td>
                          <td className="border-b border-r border-black p-2"></td>
                          <td className="border-b border-r border-black p-2"></td>
                          <td className="border-b border-r border-black p-2"></td>
                          <td className="border-b border-r border-black p-2"></td>
                          <td className="border-b border-r border-black p-2"></td>
                          <td className="border-b border-r border-black p-2"></td>
                          <td className="border-b border-r border-black p-2"></td>
                          <td className="border-b border-black p-2"></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Totals */}
                  <div className="grid grid-cols-2 border-t border-black">
                    <div className="p-3 border-r border-black">
                      <p className="font-semibold text-xs mb-1">Amount in Words:</p>
                      <p className="italic text-xs">{numberToWords(total)}</p>
                    </div>
                    <div>
                      <table className="w-full">
                        <tbody>
                          <tr className="border-b border-black">
                            <td className="p-2 font-semibold border-r border-black">Sub Total</td>
                            <td className="p-2 text-right">₹{fmtINR(subtotal)}</td>
                          </tr>
                          {totalDiscount > 0 && (
                            <tr className="border-b border-black">
                              <td className="p-2 font-semibold border-r border-black">Discount</td>
                              <td className="p-2 text-right text-red-600">- ₹{fmtINR(totalDiscount)}</td>
                            </tr>
                          )}
                          <tr className="border-b border-black">
                            <td className="p-2 font-semibold border-r border-black">GST</td>
                            <td className="p-2 text-right">₹{fmtINR(totalGst)}</td>
                          </tr>
                          <tr className="bg-gray-100 border-b border-black">
                            <td className="p-2 font-bold border-r border-black text-sm">Grand Total</td>
                            <td className="p-2 text-right font-bold text-sm">₹{fmtINR(total)}</td>
                          </tr>
                          {amountPaid > 0 && (
                            <tr className="border-b border-black">
                              <td className="p-2 font-semibold border-r border-black text-green-700">Paid</td>
                              <td className="p-2 text-right text-green-700">₹{fmtINR(amountPaid)}</td>
                            </tr>
                          )}
                          {amountPending > 0 && (
                            <tr>
                              <td className="p-2 font-bold border-r border-black text-red-700">Balance Due</td>
                              <td className="p-2 text-right font-bold text-red-700">₹{fmtINR(amountPending)}</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Footer / Signatures */}
                  <div className="grid grid-cols-2 border-t-2 border-black" style={{ minHeight: "80px" }}>
                    <div className="p-4 border-r border-black">
                      <p className="font-semibold text-xs mb-6">Customer Signature</p>
                      <div className="border-b border-gray-400 w-3/4 mt-8"></div>
                    </div>
                    <div className="p-4 text-right">
                      <p className="font-semibold text-xs mb-1">For {firm?.name || ""}</p>
                      <div className="border-b border-gray-400 w-3/4 ml-auto mt-8"></div>
                      <p className="text-xs mt-1 text-gray-600">Authorised Signatory</p>
                    </div>
                  </div>
                </div>
              </div>
            );

            return (
              <>
                <InvoiceCopy label="Original Copy" className="copy-original" />
                <div className="page-break" />
                <InvoiceCopy label="Customer Copy (Duplicate)" className="copy-duplicate" />
              </>
            );
          })()}

          {/* Terms footer (outside border) */}
          <div className="mt-4 text-center text-gray-500" style={{ fontSize: "9px" }}>
            <p>This is a computer-generated invoice. Goods once sold will not be taken back or exchanged.</p>
            <p>Subject to jurisdiction of local courts. E. & O.E.</p>
          </div>
        </div>
      </div>
    </>
  );
}
