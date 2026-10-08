"use client";

import { useState, useTransition } from "react";
import { TrashIcon } from "@/assets/icons";
import { confirmDialog, successDialog } from "@/utils/confirmDialog";
import toast from "react-hot-toast";
import { deleteProduct } from "@/app/actions/product";

export default function DeleteProduct({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {

    startTransition(async () => {
      try {
        const isConfirmed = await confirmDialog(
          "Are you sure?",
          "Delete this product?"
        );

        if (!isConfirmed) {
          return;
        }
        const response = await deleteProduct(id);
        if (response && response.success) {
          const msg = response.message || "Product deleted successfully";
          successDialog(msg);
        } else {
          toast.error(response?.message || "Failed to delete product");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete product");
        setError("Failed to delete product");
      }
    });
  };

  return (
    <button
      aria-label="button for favorite select"
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center w-10 h-10 rounded-lg shadow-1 ease-out duration-200 text-dark hover:bg-red-light-6 hover:border-red-light-4 hover:text-red border border-gray-3 bg-white`}
      title="Delete"
    >
      {isPending ? (
        <span className="w-5 h-5 border-2 border-gray-300 rounded-full border-blue animate-spin"></span>
      ) : (
        <TrashIcon />
      )}
    </button>
  );
}
