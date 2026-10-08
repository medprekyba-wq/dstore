import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { useCart } from "@/hooks/useCart";
import cn from "@/utils/cn";
import { MinusIcon, PlusIcon, TrashIcon } from "@/assets/icons";
import { formatPrice } from "@/utils/formatePrice";

const SingleItem = ({ item }: any) => {
  const { incrementItem, decrementItem, removeItem } = useCart();

  const handleRemoveFromCart = () => {
    removeItem(item.id);
  };

  const handleIncreaseQuantity = () => {
    if (item.quantity < item?.availableQuantity) {
      incrementItem(item.id);
    } else {
      toast.error("You cannot add more than available stock!");
    }
  };

  const handleDecreaseQuantity = () => {
    if (item.quantity > 1) {
      decrementItem(item.id);
    }
  };

  return (
    <tr>
      <td className="py-5 px-7.5 whitespace-nowrap">
        <div className="flex items-center gap-5">
          <div className="rounded-md bg-gray-2 shrink-0">
            <Image
              width={80}
              height={80}
              src={item.image}
              alt={item.name || "product"}
            />
          </div>
          <div>
            <h3 className="duration-200 ease-out text-dark hover:text-blue">
              <Link href={`/products/${item.slug}`}> {item.name} </Link>
            </h3>
          </div>
        </div>
      </td>

      <td className="py-5 px-7.5 whitespace-nowrap">
        <p className="text-dark">{formatPrice(item.price)}</p>
      </td>

      <td className="py-5 px-7.5  whitespace-nowrap">
        <div className="flex items-center border rounded-md w-max border-gray-3">
          <button
            onClick={() => handleDecreaseQuantity()}
            aria-label="button for remove product"
            className={cn(
              "flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue",
              {
                "opacity-50 pointer-events-none": item.quantity === 1,
              }
            )}
            disabled={item.quantity === 1}
          >
            <MinusIcon />
          </button>

          <span className="flex items-center justify-center w-16 h-11.5 border-x border-gray-4">
            {item.quantity}
          </span>

          <button
            onClick={() => handleIncreaseQuantity()}
            aria-label="button for add product"
            className="flex items-center justify-center w-11.5 h-11.5 ease-out duration-200 hover:text-blue"
          >
            <PlusIcon />
          </button>
        </div>
      </td>

      <td className="py-5 px-7.5 whitespace-nowrap">
        <p className="text-dark">${item.price * item.quantity}</p>
      </td>

      <td className="py-5 px-7.5 whitespace-nowrap text-right">
        <div className="flex justify-end">
          <button
            onClick={() => handleRemoveFromCart()}
            aria-label="button for remove product from cart"
            className="flex items-center justify-center rounded-lg max-w-[38px] w-full h-9.5 bg-gray-2 border border-gray-3 text-dark ease-out duration-200 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
          >
            <TrashIcon />
          </button>
        </div>
      </td>
    </tr>
  );
};

export default SingleItem;
