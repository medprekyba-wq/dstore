import { formatPrice } from "@/utils/formatePrice";
import OrderActions from "./OrderActions";

type IProps = {
  orderItem: any;
  onViewDetails: (orderItem: any) => void;
  onEdit: (orderItem: any) => void;
  showAll?: boolean;
};

const SingleOrder = ({ orderItem, onViewDetails, onEdit, showAll }: IProps) => {
  return (
    <>
      <tr>
        <td className="px-6 py-3.5 whitespace-nowrap">
          <p className="font-medium text-custom-sm text-dark">
            #{orderItem?.id?.slice(-8)}
          </p>
        </td>
        <td className="px-6 py-3.5">
          <p className="text-custom-sm text-gray-6 whitespace-nowrap">
            {new Date(orderItem.createdAt).toDateString()}
          </p>
        </td>
        <td className="px-6 py-3.5 whitespace-nowrap">
          <p
            className={`inline-block text-xs py-0.5 px-2.5 rounded-full capitalize ${
              orderItem.shippingStatus === "delivered"
                ? "text-success-500 bg-success-50"
                : orderItem.shippingStatus === "pending"
                ? "text-yellow-500 bg-yellow-50"
                : orderItem.shippingStatus === "processing"
                ? "text-blue bg-blue-light-5"
                : orderItem.shippingStatus === "cancel"
                ? "text-red-500 bg-red-50"
                : "text-gray-7 bg-gray-2"
            }`}
          >
            {orderItem.shippingStatus}
          </p>
        </td>

        {showAll && (
        <td className="px-6 py-3.5">
          <p className="text-custom-sm text-gray-6 whitespace-nowrap">
            {orderItem?.user?.name ||
              orderItem?.billing?.firstName +
                " " +
                orderItem?.billing?.lastName}
          </p>
        </td>
        )}
        {showAll && (
          <td className="px-6 py-3.5">
            <p className="text-custom-sm text-gray-6 whitespace-nowrap">
              {orderItem?.user?.email || orderItem?.billing?.email}
            </p>
          </td>
        )}

        <td className="px-6 py-3.5 whitespace-nowrap">
          <p className="text-custom-sm text-gray-6">
            {orderItem?.paymentMethod}
          </p>
        </td>

        <td className="px-6 py-3.5 whitespace-nowrap">
          <p className="text-custom-sm text-gray-6">
            {formatPrice(Number(orderItem?.totalAmount))}
          </p>
        </td>

        <td className="whitespace-nowrap px-6 py-3.5 text-right">
          <div className={`flex items-center justify-${showAll ? "end" : "start"  } gap-5`}>
            <OrderActions
              toggleDetails={() => onViewDetails(orderItem)}
              toggleEdit={() => onEdit(orderItem)}
            />
          </div>
        </td>
      </tr>
    </>
  );
};

export default SingleOrder;
