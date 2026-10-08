"use client";

import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

interface TrackingEvent {
  id: string;
  status: string;
  message: string;
  location: string | null;
  createdAt: string;
}

interface TrackingPageProps {
  data: {
    orderId: string;
    trackingId: string;
    date: string;
    status: string;
    paymentMethod: string;
    totalAmount: number;
    billing: any;
    userName: string;
    userEmail: string;
    products: { name: string; quantity: number; price: number }[];
    trackings: TrackingEvent[];
  };
}

const statusIcons: Record<string, JSX.Element> = {
  "order placed": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
    </svg>
  ),
  confirmed: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  processing: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
    </svg>
  ),
  "on the way": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
    </svg>
  ),
  "out for delivery": (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14"/><path d="M12 5l7 7-7 7"/>
    </svg>
  ),
  delivered: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  cancelled: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  ),
};

const statusColors: Record<string, { color: string; bg: string; border: string }> = {
  "order placed": { color: "#6366f1", bg: "#eef2ff", border: "#c7d2fe" },
  confirmed:       { color: "#3b82f6", bg: "#eff6ff", border: "#bfdbfe" },
  processing:      { color: "#8b5cf6", bg: "#f5f3ff", border: "#ddd6fe" },
  "on the way":    { color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  "out for delivery": { color: "#f97316", bg: "#fff7ed", border: "#fed7aa" },
  delivered:       { color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
  cancelled:       { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
  cancel:          { color: "#ef4444", bg: "#fef2f2", border: "#fecaca" },
};

const getStatusColors = (status: string) => {
  return statusColors[status.toLowerCase()] || { color: "#6b7280", bg: "#f3f4f6", border: "#e5e7eb" };
};

const getStatusIcon = (status: string) => {
  return statusIcons[status.toLowerCase()] || (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10"/>
    </svg>
  );
};

const getOrderStatusClass = (status: string) => {
  const s = status.toLowerCase();
  if (s === "delivered") return "text-success-500 bg-success-50";
  if (s === "pending") return "text-yellow-500 bg-yellow-50";
  if (s === "processing") return "text-blue bg-blue-light-5";
  if (s === "cancel") return "text-red-500 bg-red-50";
  return "text-dark bg-gray-2";
};

export default function TrackingPage({ data }: TrackingPageProps) {
  const deliveryAddress = [
    data.billing?.address?.street,
    data.billing?.town,
    data.billing?.country,
  ].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-[#F6F7FB] py-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Back link */}
        <Link
          href={`/order/${data.orderId}`}
          className="inline-flex items-center gap-2 text-sm text-dark hover:text-dark transition-colors mb-6 group"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="group-hover:-translate-x-0.5 transition-transform">
            <path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/>
          </svg>
          Back to Invoice
        </Link>

        {/* Page title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dark">Track Your Order</h1>
          <p className="text-dark mt-1">
            Tracking ID:{" "}
            <span className="font-semibold text-dark">{data.trackingId}</span>
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-1 p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-dark font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>
                Invoice
              </p>
              <p className="text-sm font-bold text-dark">#{data.orderId.slice(-8).toUpperCase()}</p>
            </div>
            <div>
              <p className="text-xs text-dark font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                Order Date
              </p>
              <p className="text-sm font-semibold text-dark">{data.date}</p>
            </div>
            <div>
              <p className="text-xs text-dark font-semibold uppercase tracking-wider mb-1.5">Status</p>
              <span className={`inline-block text-xs font-bold px-3 py-1 rounded-full capitalize border ${getOrderStatusClass(data.status)}`}>
                {data.status}
              </span>
            </div>
            <div>
              <p className="text-xs text-dark font-semibold uppercase tracking-wider mb-1.5">Total</p>
              <p className="text-sm font-bold text-dark">${data.totalAmount.toLocaleString()}</p>
            </div>
          </div>

          {deliveryAddress && (
            <div className="mt-5 pt-5 border-t border-gray-1">
              <p className="text-xs text-dark font-semibold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                Delivery Address
              </p>
              <p className="text-sm text-dark">{deliveryAddress}</p>
            </div>
          )}
        </div>

        {/* Main content: timeline + order items */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Tracking Timeline */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-1 p-6">
            <h2 className="text-base font-bold text-dark flex items-center gap-2 mb-6">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
              </svg>
              Tracking History
            </h2>

            {data.trackings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="1.5">
                    <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
                  </svg>
                </div>
                <p className="text-sm font-semibold text-dark">No tracking updates yet</p>
                <p className="text-xs text-dark mt-1 max-w-xs">Tracking information will appear here once your order starts moving.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Vertical connector line */}
                <div className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-gray-200 via-gray-2 to-transparent" />

                <div className="space-y-7">
                  {data.trackings.map((event, idx) => {
                    const cfg = getStatusColors(event.status);
                    const icon = getStatusIcon(event.status);
                    const isFirst = idx === 0;

                    return (
                      <div key={event.id} className="flex gap-4 relative">
                        {/* Icon */}
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 transition-all"
                          style={{
                            color: cfg.color,
                            backgroundColor: isFirst ? cfg.color : cfg.bg,
                            border: `2px solid ${cfg.border}`,
                          }}
                        >
                          <span style={{ color: isFirst ? "#fff" : cfg.color }}>
                            {icon}
                          </span>
                        </div>

                        {/* Content */}
                        <div className="flex-1 pt-1.5">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className={`text-sm font-bold capitalize ${isFirst ? "text-dark" : "text-dark"}`}>
                                {event.status}
                              </p>
                              <p className="text-sm text-dark mt-0.5 leading-snug">{event.message}</p>
                              {event.location && (
                                <p className="text-xs text-dark mt-1.5 flex items-center gap-1">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
                                  </svg>
                                  {event.location}
                                </p>
                              )}
                              <p className="text-xs text-dark mt-1">
                                {new Date(event.createdAt).toLocaleString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                                  hour: "numeric", minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <span className="text-xs text-dark whitespace-nowrap shrink-0">
                              {formatDistanceToNow(new Date(event.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Order Items */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-2 p-6 h-fit">
            <h2 className="text-base font-bold text-dark mb-4">
              Order Items ({data.products.length})
            </h2>
            <div className="divide-y divide-gray-2">
              {data.products.map((product, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="flex-1 min-w-0 pr-3">
                    <p className="text-sm text-dark leading-snug">{product.name}</p>
                    {product.price && (
                      <p className="text-xs text-dark mt-0.5">${product.price}</p>
                    )}
                  </div>
                  <span className="text-xs font-semibold text-dark bg-gray-2 px-2 py-0.5 rounded shrink-0">
                    x{product.quantity}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-1">
              <div className="flex items-center justify-between">
                <span className="text-sm text-dark">Payment</span>
                <span className="text-sm font-semibold text-dark capitalize">{data.paymentMethod}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-dark">Total</span>
                <span className="text-base font-bold text-red-600">${data.totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
