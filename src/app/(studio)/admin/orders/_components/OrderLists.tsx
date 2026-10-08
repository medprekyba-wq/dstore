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

  const toggleModal = (status: boolean, orderItem?: any) => {
    setShowDetails(status);
    setShowEdit(status);
    if (status && orderItem) {
      setSelectedOrder(orderItem);
    }
  };

  const filteredData = orderData?.filter((order: any) => {
    const email = order?.user?.email || order?.billing?.email || "";
    return email.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const { currentItems, handlePageClick, pageCount } = usePagination(
    filteredData,
    10
  );

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-5 gap-4">
        <h2 className="text-base font-semibold text-dark">All Orders</h2>
        <div className="w-full sm:max-w-xs">
          <input
            type="text"
            placeholder="Search by email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 px-4 text-sm font-normal duration-200 border rounded-lg border-gray-3 focus:border-blue focus:outline-0 focus:ring-0 placeholder:text-gray-5 text-dark"
          />
        </div>
      </div>
      <div className="w-full ">
        {currentItems?.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              {/* <!-- order item --> */}
              <thead>
                <tr className="border-y border-gray-3">
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Order
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Name
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Email
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Date
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Status
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Payment Method
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-left text-sm">
                    Total
                  </th>
                  <th className="font-medium px-6 py-3.5 whitespace-nowrap text-right text-sm">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-3">
                {currentItems?.length > 0 &&
                  currentItems.map((orderItem: any, key: number) => (
                    <SingleOrder
                      key={key}
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
            {/* Pagination */}
            {filteredData?.length > 10 && (
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
              {orderData?.length > 0
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
          toggleModal={(status: boolean) => toggleModal(status)}
          order={selectedOrder}
        />
      )}
    </>
  );
}
