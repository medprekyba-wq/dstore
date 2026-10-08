"use client";
import Link from "next/link";
import { formatPrice } from "@/utils/formatePrice";

type EnumShippingStatus = "pending" | "processing" | "delivered" | "cancel";

interface Product {
  id: string;
  title: string;
  image: string | null;
  category: string;
  quantity: number;
  price: number;
}

interface RecentOrdersProps {
  orders: {
    id: string;
    createdAt: Date;
    totalAmount: number;
    paymentStatus: string;
    shippingStatus: EnumShippingStatus;
    products: (Product | null)[] | null;
  }[];
  viewAllLink?: string;
}

const RecentOrders = ({ orders, viewAllLink = "/admin/orders" }: RecentOrdersProps) => {
  return (
    <div className="w-full mt-5 bg-white border rounded-2xl border-gray-3">
      <div className="flex items-center justify-between px-6 py-4">
        <h2 className="text-base font-semibold text-dark">Recent Orders</h2>
        <Link
          href={viewAllLink}
          className="inline-flex items-center px-5 py-2 text-sm font-medium duration-200 ease-out border rounded-lg hover:border-blue hover:bg-blue text-dark hover:text-white border-gray-3"
        >
          View All
        </Link>
      </div>

      {orders.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-y border-gray-3">
                <td className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                  Order
                </td>
                <td className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                  Date
                </td>
                <td className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                  Status
                </td>
                <td className="px-6 py-3 font-medium text-custom-sm text-gray-6">
                  Total
                </td>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {orders.length > 0 &&
                orders.map((orderItem, key) => (
                  <tr key={key}>
                    <td className="px-6 py-4">
                      <p className="text-custom-sm text-gray-7">
                        #{orderItem?.id?.slice(-8)}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-custom-sm text-dark">
                        {new Date(orderItem.createdAt).toDateString()}
                      </p>
                    </td>

                    <td className="px-6 py-3.5">
                      <p
                        className={`inline-block text-xs py-0.5 px-2.5 rounded-full capitalize ${
                          orderItem.shippingStatus === "delivered"
                            ? "text-success-500 bg-success-50"
                            : orderItem.shippingStatus === "pending"
                            ? "text-yellow-500 bg-yellow-50"
                            : orderItem.shippingStatus === "processing"
                            ? "text-blue bg-blue-light-5"
                            : orderItem.shippingStatus === "cancel"
                            ? "text-red-500 bg-red-50"
                            : "text-gray-7 bg-gray-2"
                        }`}
                      >
                        {orderItem.shippingStatus}
                      </p>
                    </td>

                    <td className="px-6 py-4">
                      <p className="text-custom-sm text-dark">
                        {formatPrice(Number(orderItem?.totalAmount))}
                      </p>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-9.5 px-4 sm:px-7.5 xl:px-10">
          You don&apos;t have any orders!
        </p>
      )}
    </div>
  );
};

export default RecentOrders;
