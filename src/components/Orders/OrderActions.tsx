import { EyeIcon, PencilIcon } from "@/assets/icons";
import { useSession } from "next-auth/react";

const OrderActions = ({ toggleEdit, toggleDetails }: any) => {
  const { data: session } = useSession();

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={toggleDetails}
        className="p-1.5 border rounded-md text-gray-6 hover:text-blue hover:bg-blue-light-5 size-8 inline-flex items-center justify-center border-gray-3"
      >
        <EyeIcon width={18} height={16} />
      </button>

      {session?.user?.role === "ADMIN" && (
        <button
          onClick={toggleEdit}
          className="p-1.5 border rounded-md text-gray-6 hover:text-blue hover:bg-blue-light-5 size-8 inline-flex items-center justify-center border-gray-3"
        >
          <PencilIcon />
        </button>
      )}
    </div>
  );
};

export default OrderActions;
