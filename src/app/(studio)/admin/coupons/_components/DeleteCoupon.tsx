"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "@/assets/icons";
import { confirmDialog, successDialog } from "@/utils/confirmDialog";
import toast from "react-hot-toast";
import { deleteCoupon } from "@/app/actions/coupon";

export default function DeleteCoupon({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      try {
        const isConfirmed = await confirmDialog(
          "Are you sure?",
          "Delete this coupon?"
        );

        if (!isConfirmed) {
          return;
        }
        const response = await deleteCoupon(id);
        if (response?.success) {
          const msg = response?.message || "Coupon deleted successfully";
          successDialog(msg);
        } else {
          toast.error(response?.message || "Failed to delete coupon");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete coupon");
        setError("Failed to delete coupon");
      }
    });
  };

  return (
    <button
      aria-label="button for favorite select"
      onClick={handleClick}
      disabled={isPending}
      className="p-1.5 border rounded-md text-gray-7  hover:bg-red-light-6 hover:border-red-light-4 hover:text-red size-8 inline-flex items-center justify-center border-gray-3"
      title="Delete"
    >
      {isPending ? (
        <span className="w-5 h-5 border-2 border-gray-300 rounded-full border-blue animate-spin" />
      ) : (
        <TrashIcon />
      )}
    </button>
  );
}
