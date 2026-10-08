import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/redux/store";
import { removeItemFromWishlist } from "@/redux/features/wishlist-slice";
import { useCart } from "@/hooks/useCart";
import { CircleCheckIcon, CircleXIcon } from "./icons";
import { WishlistItem } from "@/types/wishlistItem";
import { formatPrice } from "@/utils/formatePrice";

const SingleItem = ({ item }: { item: WishlistItem }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { addItem } = useCart();

  const handleRemoveFromWishlist = () => {
    dispatch(removeItemFromWishlist(item.id));
  };

  const cartItem = {
    id: item.id,
    name: item.title,
    price: item.price,
    currency: "usd",
    image: item?.image ? item.image : "",
    slug: item?.slug,
    availableQuantity: item.quantity,
    color: item?.color ? item.color : "",
  };

  const handleAddToCart = () => {
    if (item.quantity > 0) {
      // @ts-ignore
      addItem(cartItem);
      toast.success("Product added to cart!");
    } else {
      toast.error("This product is out of stock!");
    }
  };

  return (
    <tr>
      <td className="px-6 py-4.5 whitespace-nowrap">
        <div className="flex items-center gap-5 ">
          <div className="flex justify-center w-20 h-20 rounded-lg size-20 bg-gray-2 item-center shrink-0">
            <Image
              src={item?.image ? item.image : ""}
              alt={item?.title || "product-image"}
              width={80}
              height={80}
            />
          </div>
          <div>
            <h3 className="break-words duration-200 ease-out text-dark hover:text-blue">
              <Link href={`/products/${item.slug}`} className="line-clamp-1">
                {" "}
                {item.title}{" "}
              </Link>
            </h3>
          </div>
        </div>
      </td>

      <td className="px-6 py-4.5 whitespace-nowrap">
        <p className="text-dark">{formatPrice(item.price)}</p>
      </td>

      <td className="px-6 py-4.5 whitespace-nowrap">
        {item?.quantity ? (
          <div className="flex items-center gap-1.5 text-green">
            <CircleCheckIcon />

            <span> In Stock </span>
          </div>
        ) : (
          <span className="text-red"> Out of Stock </span>
        )}
      </td>

      <td className="px-6 py-4.5 whitespace-nowrap">
        <button
          onClick={() => handleAddToCart()}
          disabled={item.quantity < 1}
          className="inline-flex text-dark hover:text-white bg-gray-1 border
        border-gray-3 py-2.5 px-6 rounded-lg ease-out duration-200 hover:bg-blue"
        >
          {item.quantity < 1 ? "Out of Stock" : "Add to Cart"}
        </button>
      </td>

      <td className="px-6 py-4.5 whitespace-nowrap relative">
        <button
          onClick={() => handleRemoveFromWishlist()}
          className="flex items-center justify-center duration-200 ease-out border rounded-lg h-9 w-9 bg-gray-2 border-gray-3 hover:bg-red-light-6 hover:border-red-light-4 hover:text-red"
        >
          <span className="sr-only">Remove from wishlist</span>
          <CircleXIcon />
        </button>
      </td>
    </tr>
  );
};

export default SingleItem;
