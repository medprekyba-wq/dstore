"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { TrashIcon } from "@/assets/icons";
import {
  confirmDialog,
  successDialog,
} from "@/utils/confirmDialog";
import toast from "react-hot-toast";
import { deleteCategory } from "@/app/actions/category";

type DeleteCategoryProps = {
  id: number;
  title?: string;
};

export default function DeleteCategory({
  id,
  title,
}: DeleteCategoryProps) {
  const [isPending, startTransition] =
    useTransition();

  const router = useRouter();

  const handleClick = async () => {
    const categoryName = title
      ? `"${title}"`
      : "this category";

    const isConfirmed =
      await confirmDialog(
        "Are you sure?",
        `Delete ${categoryName}?`
      );

    if (!isConfirmed) {
      return;
    }

    startTransition(async () => {
      try {
        const response =
          await deleteCategory(id);

        if (!response?.success) {
          toast.error(
            response?.message ||
              "Failed to delete category"
          );

          return;
        }

        const message =
          response.message ||
          "Category deleted successfully";

        await successDialog(message);

        // Refresh the current server component page
        // so the deleted category disappears immediately.
        router.refresh();
      } catch (error: any) {
        console.error(
          "Error deleting category:",
          error
        );

        toast.error(
          error?.message ||
            "Failed to delete category"
        );
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className="inline-flex size-8 items-center justify-center rounded-md border border-gray-3 p-1.5 text-gray-6 duration-200 hover:border-red hover:text-red disabled:cursor-not-allowed disabled:opacity-60"
      title={
        isPending
          ? "Deleting..."
          : "Delete category"
      }
      aria-label={
        isPending
          ? "Deleting category"
          : "Delete category"
      }
    >
      {isPending ? (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-blue"
          aria-hidden="true"
        />
      ) : (
        <TrashIcon />
      )}
    </button>
  );
}