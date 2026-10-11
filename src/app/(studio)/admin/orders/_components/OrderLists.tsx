"use client";

import Pagination from "@/components/Common/Pagination";
import OrderModal from "@/components/Orders/OrderModal";
import SingleOrder from "@/components/Orders/SingleOrder";
import usePagination from "@/hooks/usePagination";
import { useState } from "react";

export default function OrderLists({ orderData }: any) {
  const [showDetails, setShowDetails] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const toggleModal = (status: boolean) => {
    if (!status) {
      setShowDetails(false);
      setShowEdit(false);
      setSelectedOrder(null);
    }
  };

  const orders = Array.isArray(orderData) ? orderData : [];

  const filteredData = orders
    .filter((order: any) => {
      const email =
        order?.user?.email || order?.billing?.email || "";

      return String(email)
        .toLowerCase()
        .includes(searchQuery.trim().toLowerCase());
    })
    .sort(
      (a: any, b: any) =>
        Number(b.orderNumber ?? 0) - Number(a.orderNumber ?? 0)
    );

  const { currentItems, handlePageClick, pageCount } = usePagination(
    filteredData,
    10
  );

  const columns = [
    "Order",
    "Date",
    "Status",
    "Payment Status",
    "Name",
    "Email",
    "Total",
  ];

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 gap-4">
        <h2 className="text-base font-semibold text-dark">
          All Orders
        </h2>

        <div className="w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by email..."
            aria-label="Search orders by email"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            className="w-full h-11 px-4 text-sm font-normal duration-200 border rounded-lg border-gray-3 focus:border-blue focus:outline-0 focus:ring-0 placeholder:text-gray-5 text-dark"
          />
        </div>
      </div>

      <div className="w-full">
        {currentItems?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-y border-gray-3">
                  {columns.map((column) => (
                    <th
                      key={column}
                      scope="col"
                      className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm"
                    >
                      {column}
                    </th>
                  ))}

                  <th
                    scope="col"
                    className="font-medium px-6 py-3.5 whitespace-nowrap text-right text-sm"
                  >
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-3">
                {currentItems.map((orderItem: any) => (
                  <SingleOrder
                    key={orderItem.id}
                    orderItem={orderItem}
                    onViewDetails={(order) => {
                      setSelectedOrder(order);
                      setShowDetails(true);
                      setShowEdit(false);
                    }}
                    onEdit={(order) => {
                      setSelectedOrder(order);
                      setShowEdit(true);
                      setShowDetails(false);
                    }}
                    showAll={true}
                  />
                ))}
              </tbody>
            </table>

            {filteredData.length > 10 && (
              <div className="flex justify-center pb-6 pagination">
                <Pagination
                  handlePageClick={handlePageClick}
                  pageCount={pageCount}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-gray-5">
            <p className="text-sm">
              {orders.length > 0
                ? "No orders found matching this search."
                : "You don't have any orders!"}
            </p>
          </div>
        )}
      </div>

      {selectedOrder && (
        <OrderModal
          showDetails={showDetails}
          showEdit={showEdit}
          toggleModal={toggleModal}
          order={selectedOrder}
        />
      )}
    </>
  );
}