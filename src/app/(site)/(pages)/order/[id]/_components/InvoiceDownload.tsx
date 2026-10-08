"use client";

import { formatPrice } from "@/utils/formatePrice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import Image from "next/image";
import { useImperativeHandle, useRef, Ref } from "react";

export interface InvoiceDownloadRef {
  download: () => void;
}

export const InvoiceDownload = ({
  data,
  logo,
  storeName,
  ref,
}: {
  data: any;
  logo?: string | null;
  storeName?: string;
  ref?: Ref<InvoiceDownloadRef | null>;
}) => {
    const pdfRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      download: async () => {
        const element = pdfRef.current;
        if (!element) return;

        try {
          // Temporarily position it for correct rendering
          const originalStyle = element.style.cssText;
          element.style.position = "absolute";
          element.style.left = "0";
          element.style.top = "0";
          element.style.zIndex = "-9999";
          element.style.opacity = "1";

          const canvas = await html2canvas(element, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true,
            backgroundColor: "#ffffff",
          });

          element.style.cssText = originalStyle;

          const imgData = canvas.toDataURL("image/png");
          const pdf = new jsPDF("p", "mm", "a4");
          const imgProps = pdf.getImageProperties(imgData);
          const pdfWidth = pdf.internal.pageSize.getWidth();
          const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

          pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
          pdf.save(`Invoice-${data.id.slice(-8).toUpperCase()}.pdf`);
        } catch (error) {
          console.error("Error generating PDF:", error);
        }
      },
    }));

    const getStatusStyle = (status: string) => {
      switch (status) {
        case "delivered": return { color: "#10b981"};
        case "pending": return { color: "#f59e0b"};
        case "processing": return { color: "#3b82f6"};
        case "cancel": return { color: "#ef4444"};
        default: return { color: "#6b7280"};
      }
    };

    return (
      <div className="absolute left-[-9999px] top-[-9999px] opacity-0 pointer-events-none overflow-hidden">
        <div ref={pdfRef} className="bg-white w-[800px] text-[#1E293B] font-sans p-8">
          <div className="flex flex-row items-center justify-between pb-7">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-[#1E293B] uppercase mb-2">
                  Invoice
                </h1>
                <div className="flex flex-row items-center gap-1.5">
                  <span className="text-sm font-medium text-[#1E293B]">Status:</span>
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 600,
                      textTransform: "capitalize",
                      whiteSpace: "nowrap",
                      ...getStatusStyle(data.status),
                    }}
                  >
                    {data.status}
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="flex justify-end mb-1">
                  {logo ? (
                    <Image
                      src={logo}
                      alt="Logo"
                      width={148}
                      height={36}
                      style={{ width: "auto", height: "auto" }}
                      unoptimized
                    />
                  ) : (
                    <span style={{ fontSize: "20px", fontWeight: 700, color: "#1E293B" }}>
                      {storeName || "CozyCommerce"}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[#1E293B]">
                  Pimjo LLC - 30 N Gould St Ste R Sheridan, WY 82801
                </p>
              </div>
            </div>

            {/* Invoice Info section (forced grid-cols-3) */}
            <div className="grid grid-cols-3 gap-8 py-8">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                  Date
                </h3>
                <p className="mt-2 text-sm text-[#1E293B]">{data.date}</p>
              </div>
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                  Invoice No.
                </h3>
                <p className="mt-2 text-sm font-bold text-[#1E293B]">
                  #{data.id.slice(-8).toUpperCase()}
                </p>
              </div>
              <div className="text-right">
                <h3 className="text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                  Invoice To.
                </h3>
                <div className="mt-2 text-sm text-[#1E293B]">
                  <p className="font-medium">{data.userName}</p>
                  <p className="text-[#1E293B]">{data.userEmail}</p>
                  {data.billing?.address1 && (
                    <p className="text-[#1E293B]">{data.billing?.address1}</p>
                  )}
                  {data.billing?.city && (
                    <p className="text-[#1E293B]">
                      {data.billing?.city}, {data.billing?.country}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Products Table */}
            <div className="w-full pt-4">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F8F9FB] border-y border-[#E5E7EB]">
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-[#1E293B] uppercase text-left">
                      SR.
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                      Product Name
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-[#1E293B] uppercase">
                      Quantity
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-center text-[#1E293B] uppercase">
                      Item Price
                    </th>
                    <th className="px-4 py-4 text-xs font-semibold tracking-wider text-right text-[#1E293B] uppercase">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {data.products.map((item: any, i: number) => (
                    <tr key={i} className="bg-white">
                      <td className="px-4 py-4 text-sm text-[#1E293B]">{i + 1}</td>
                      <td className="px-4 py-4 text-sm font-medium text-[#1E293B]">
                        {item?.name}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-[#1E293B]">
                        {item?.quantity}
                      </td>
                      <td className="px-4 py-4 text-sm text-center text-[#1E293B]">
                        {formatPrice(item?.price)}
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-right text-[#1E293B]">
                        {formatPrice(
                          parseInt(item?.quantity || "0") * parseInt(item?.price || "0")
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Section */}
            <div className="bg-[#F8F9FB] p-8 border-y border-gray-2 mt-4 rounded-b">
              <div className="grid grid-cols-4 gap-6">
                <div>
                  <h3 className="text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                    Payment Method
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#1E293B]">
                    {data.paymentMethod}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                    Shipping Cost
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#1E293B]">
                    {formatPrice(data.shippingCost)}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                    Discount
                  </h3>
                  <p className="mt-2 text-sm font-medium text-[#1E293B]">
                    {formatPrice(data.discount)}
                  </p>
                </div>
                <div className="text-right">
                  <h3 className="text-xs font-semibold tracking-wider text-[#1E293B] uppercase">
                    Total Amount
                  </h3>
                  <p className="mt-2 text-2xl font-bold text-red-600">
                    {formatPrice(data.totalAmount)}
                  </p>
                </div>
              </div>
            </div>

            {/* Tracking Section (forced flex-row) */}
            <div className="flex flex-row items-center justify-between mt-8">
              <div className="flex flex-row items-center gap-3">
                <div className="p-2 border border-gray-2 rounded">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-[#1E293B]"
                  >
                    <rect width="16" height="16" x="4" y="4" rx="2" />
                    <rect width="6" height="6" x="9" y="9" rx="1" />
                    <path d="M12 4v5" />
                    <path d="M12 15v5" />
                    <path d="M4 12h5" />
                    <path d="M15 12h5" />
                  </svg>
                </div>
                <div>
                  <p className="text-xs text-[#1E293B] uppercase">Tracking ID</p>
                  <p className="text-sm font-bold text-[#1E293B]">
                    CC-{data.id.slice(-8).toUpperCase()}-
                    {(data.billing?.city || "LOC").slice(0, 3).toUpperCase()}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
    );
};

InvoiceDownload.displayName = "InvoiceDownload";