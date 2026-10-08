"use client";
import { useState, useTransition } from "react";
import { TrashIcon } from "@/assets/icons";
import { confirmDialog, successDialog } from "@/utils/confirmDialog";
import toast from "react-hot-toast";
import { deleteReview } from "@/app/actions/review";


export default function DeleteReview({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {

    startTransition(async () => {
      try {
        const isConfirmed = await confirmDialog(
          "Are you sure?",
          "Delete this review?"
        );
        
        if (!isConfirmed) {
          return;
        }
        
        const response = await deleteReview(id);
        if (response?.success) {
          const msg = response?.message || "Review deleted successfully";
          successDialog(msg);
        } else {
          toast.error(response?.message || "Failed to delete review");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete review");
        setError("Failed to delete review");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`flex items-center justify-center size-8 rounded-md shadow-1 ease-out duration-200 text-gray-6 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red border border-gray-3`}
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
