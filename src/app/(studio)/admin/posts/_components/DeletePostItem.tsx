"use client";
import { useState, useTransition } from "react";
import { TrashIcon } from "@/assets/icons";
import { confirmDialog, successDialog } from "@/utils/confirmDialog";
import toast from "react-hot-toast";
import { deletePost } from "@/app/actions/post";

export default function DeletePost({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      try {
        const isConfirmed = await confirmDialog(
          "Are you sure?",
          "Delete this post?"
        );
        
        if (!isConfirmed) {
          return;
        }
       
        const response = await deletePost(id);
        if (response?.success) {
          const msg = response?.message || "post category deleted successfully";
          successDialog(msg);
        } else {
          toast.error(response?.message || "Failed to delete post category");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete post");
        setError("Failed to delete post");
      }
    });
  };

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={`p-1.5 border rounded-md text-gray-6 hover:text-red hover:bg-red-light-5 hover:border-transparent size-8 inline-flex items-center justify-center border-gray-3`}
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
