'use client';
import { deleteUser } from "@/app/actions/user";
import { TrashIcon } from "@/assets/icons";
import { confirmDialog, successDialog } from "@/utils/confirmDialog";
import { User } from "@prisma/client";
import { useState, useTransition } from "react";
import toast from "react-hot-toast";

export default function CustomerItem({ user }: { user: User }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleClick = () => {
    startTransition(async () => {
      try {
        const isConfirmed = await confirmDialog(
          "Are you sure?",
          "Delete this user?"
        );

        if (!isConfirmed) {
          return;
        }
       
        const response = await deleteUser(user.id);
        if (response?.success) {
          const msg = response?.message || "user deleted successfully";
          successDialog(msg);
        } else {
          toast.error(response?.message || "Failed to delete user");
        }
      } catch (err: any) {
        toast.error(err?.message || "Failed to delete user");
        setError("Failed to delete user");
      }
    });
  };
  return (
    <tr key={user.id}>
      <td className="px-6 py-3 whitespace-nowrap">#{user?.id?.slice(-6)}</td>
      <td className="px-6 py-3 whitespace-nowrap">
        {new Date(user.createdAt).toDateString()}
      </td>
      <td className="px-6 py-3 whitespace-nowrap">{user.name}</td>
      <td className="px-6 py-3 whitespace-nowrap">{user.email}</td>
      <td className="px-6 py-3">
        <div className="flex items-center justify-end gap-2.5">
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
        </div>
      </td>
    </tr>
  )
}
