"use client";
import React from "react";
import toast from "react-hot-toast";

export default function PaymentStatusSelect({
  id,
  paymentStatus,
}: {
  id: string;
  paymentStatus: string;
}) {
  const [currentStatus, setCurrentStatus] = React.useState(paymentStatus);
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const target = e.target as HTMLSelectElement;
    setCurrentStatus(target.value);
    const res = await fetch(`/api/order/payment-status/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: target.value }),
    });
    const data = await res.json();
    if (data?.success) {
      toast.success(data?.message || "Payment status updated successfully");
    } else {
      toast.error(data?.message || "Failed to update payment status");
    }
  };

  return (
    <div className="w-full">
      <div className="relative">
        <select
          name="paymentStatus"
          id="paymentStatus"
          required
          onChange={(e) => handleChange(e)}
          value={currentStatus}
          className="rounded-lg border placeholder:text-sm text-sm placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-4 duration-200  focus:ring-0"
        >
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
        </select>
      </div>
    </div>
  );
}
