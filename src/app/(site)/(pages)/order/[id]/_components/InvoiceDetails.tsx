"use client";

import { formatPrice } from "@/utils/formatePrice";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { useReactToPrint } from "react-to-print";
import InvoiceActions from "./InvoiceActions";
import { InvoiceDownload, InvoiceDownloadRef } from "./InvoiceDownload";

const InvoiceDetails = ({ data }: { data: any }) => {
  const componentRef = useRef<HTMLDivElement>(null);
  const downloadRef = useRef<InvoiceDownloadRef>(null);

  const trackingId = `CC-${data.id.slice(-8).toUpperCase()}-${(data.billing?.city || "LOC").slice(0, 3).toUpperCase()}`;

  const handlePrint = useReactToPrint({
    contentRef: componentRef,
    documentTitle: `Invoice-${data.id.slice(-8).toUpperCase()}`,
  });

  const handleDownloadPDF = () => {
    if (downloadRef.current) {
      downloadRef.current.download();
    }
  };

  return (
    <div className="min-h-screen py-10 bg-[#F6F7FB]">
      <div className="max-w-5xl px-4 mx-auto sm:px-6 lg:px-8">
        <div ref={componentRef} className="bg-white rounded-lg shadow-sm">
          {/* Header section */}
          <div className="flex flex-col items-start justify-between p-8 border-b border-gray-2 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 uppercase">
                Invoice
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-sm font-medium text-dark">Status:</span>
                <span
                  className={`inline-block text-xs py-1 px-3 rounded-full capitalize font-medium ${
                    data.status === "delivered"
                      ? "text-success-500 bg-success-50"
                      : data.status === "pending"
                        ? "text-yellow-500 bg-yellow-50"
                        : data.status === "processing"
                          ? "text-blue bg-blue-light-5"
                          : data.status === "cancel"
                            ? "text-red-500 bg-red-50"
                            : "text-gray-7 bg-gray-2"
                  }`}
                >
                  {data.status}
                </span>
              </div>
            </div>
            <div className="mt-4 text-left sm:text-right sm:mt-0">
              <div className="flex items-center gap-2 sm:justify-end">
                {data.logo ? (
                  <Image
                    src={data.logo}
                    alt="Logo"
                    width={148}
                    height={36}
                    style={{ width: "auto", height: "auto" }}
                    priority
                  />
                ) : (
                  <span className="text-lg font-bold text-dark">{data.storeName || "CozyCommerce"}</span>
                )}
              </div>
              <p className="mt-1 text-sm text-dark">
                Pimjo LLC - 30 N Gould St Ste R Sheridan, WY 82801
              </p>
            </div>
          </div>

          {/* Invoice Info section */}
          <div className="grid grid-cols-1 gap-8 p-8 border-b border-gray-2 sm:grid-cols-3">
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-dark uppercase">
                Date
              </h3>
              <p className="mt-2 text-sm text-dark">{data.date}</p>
            </div>
            <div>
              <h3 className="text-xs font-semibold tracking-wider text-dark uppercase">
                Invoice No.
              </h3>
              <p className="mt-2 text-sm text-dark">
                #{data.id.slice(-8).toUpperCase()}
              </p>
            </div>
            <div className="text-left sm:text-right">
              <h3 className="text-xs font-semibold tracking-wider text-dark uppercase">
                Invoice To.
              </h3>
              <div className="mt-2 text-sm text-dark">
                <p className="font-medium">{data.userName}</p>
                <p className="text-dark">{data.userEmail}</p>
                {data.billing?.address1 && (
                  <p className="text-dark">{data.billing?.address1}</p>
                )}
                {data.billing?.city && (
                  <p className="text-dark">
                    {data.billing?.city}, {data.billing?.country}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#F8F9FB] border-y border-[#E5E7EB]">
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-dark uppercase">
                    Sr.
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-dark uppercase">
                    Product Name
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-dark uppercase">
                    Quantity
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-center text-dark uppercase">
                    Item Price
                  </th>
                  <th className="px-6 py-4 text-xs font-semibold tracking-wider text-right text-dark uppercase">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.products.map((item: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4 text-sm text-dark">{i + 1}</td>
                    <td className="px-6 py-4 text-sm font-medium text-dark">
                      {item?.name}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-dark">
                      {item?.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-center text-dark">
                      {formatPrice(item?.price)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-right text-dark">
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
          <div className="bg-[#F8F9FB] p-8 border-y border-gray-2 mt-4">
            <div className="grid grid-cols-1 gap-8 sm:grid-cols-4">
              <div>
                <h3 className="text-xs font-semibold tracking-wider text-dark uppercase">
                  Payment Method
                </h3>
                <p className="mt-2 text-sm font-medium text-dark">
                  {data.paymentMethod}
                </p>
              </div>
              <div className="sm:text-center">
                <h3 className="text-xs font-semibold tracking-wider text-dark uppercase">
                  Shipping Cost
                </h3>
                <p className="mt-2 text-sm font-medium text-dark">
                  {formatPrice(data.shippingCost)}
                </p>
              </div>
              <div className="sm:text-center">
                <h3 className="text-xs font-semibold tracking-wider text-dark uppercase">
                  Discount
                </h3>
                <p className="mt-2 text-sm font-medium text-gray-7">
                  {formatPrice(data.discount)}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <h3 className="text-xs font-semibold tracking-wider text-dark uppercase">
                  Total Amount
                </h3>
                <p className="mt-2 text-2xl font-bold text-red-600">
                  {formatPrice(data.totalAmount)}
                </p>
              </div>
            </div>
          </div>

          {/* Tracking Section */}
          <div className="flex flex-col items-start justify-between p-8 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 rounded">
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
                  className="text-dark"
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
                <p className="text-xs text-dark uppercase">Tracking ID</p>
                <p className="text-sm font-bold text-dark">
                  CC-{data.id.slice(-8).toUpperCase()}-
                  {(data.billing?.city || "LOC").slice(0, 3).toUpperCase()}
                </p>
              </div>
            </div>
            <Link
               href={`/track/${trackingId}`}
               className="px-6 py-2.5 mt-4 sm:mt-0 text-sm font-medium text-white transition-colors bg-[#0E1726] rounded-md hover:bg-gray-7 inline-block"
              >
              Track Order
            </Link>
          </div>
        </div>

        <InvoiceDownload ref={downloadRef} data={data} logo={data.logo} storeName={data.storeName} />

        {/* Action Buttons */}
        <InvoiceActions onPrint={handlePrint} onDownload={handleDownloadPDF} />
      </div>
    </div>
  );
};

export default InvoiceDetails;
