"use client";

import { deleteOrder } from "@/app/actions/order";
import { EyeIcon, PencilIcon, TrashIcon } from "@/assets/icons";
import { confirmDialog, successDialog } from "@/utils/confirmDialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import toast from "react-hot-toast";

type OrderActionsProps = {
  toggleEdit: () => void;
  toggleDetails: () => void;
  orderId: string;
  orderNumber?: number;
};

const OrderActions = ({
  toggleEdit,
  toggleDetails,
  orderId,
  orderNumber,
}: OrderActionsProps) => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      try {
        const reference = orderNumber ?? orderId;

        const isConfirmed = await confirmDialog(
          "Are you sure?",
          `Delete order ${reference}? This will not refund payment or restore stock.`
        );

        if (!isConfirmed) return;

        const response = await deleteOrder(orderId);

        if (response.success) {
          router.refresh();
          successDialog(
            response.message || "Order deleted successfully."
          );
        } else {
          toast.error(response.message || "Failed to delete order.");
        }
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Failed to delete order."
        );
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={toggleDetails}
        disabled={isPending}
        aria-label="View order"
        title="View"
        className="p-1.5 border rounded-md text-gray-6 hover:text-blue hover:bg-blue-light-5 size-8 inline-flex items-center justify-center border-gray-3 disabled:opacity-50"
      >
        <EyeIcon width={18} height={16} />
      </button>

      {session?.user?.role === "ADMIN" && (
        <>
          <button
            type="button"
            onClick={toggleEdit}
            disabled={isPending}
            aria-label="Edit order"
            title="Edit"
            className="p-1.5 border rounded-md text-gray-6 hover:text-blue hover:bg-blue-light-5 size-8 inline-flex items-center justify-center border-gray-3 disabled:opacity-50"
          >
            <PencilIcon />
          </button>

          <button
            type="button"
            onClick={handleDelete}
            disabled={isPending}
            aria-label="Delete order"
            title="Delete"
            className="p-1.5 border rounded-md text-gray-7 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red size-8 inline-flex items-center justify-center border-gray-3 disabled:cursor-not-allowed"
          >
            {isPending ? (
              <span className="w-5 h-5 border-2 border-gray-300 rounded-full border-t-blue animate-spin" />
            ) : (
              <TrashIcon />
            )}
          </button>
        </>
      )}
    </div>
  );
};

export default OrderActions;