import Link from "next/link";
import { HeartFolderIcon } from "./icons";

export default function WishListEmpty() {
  return (
    <div className="py-20 bg-white">
      <div className="flex items-center justify-center mb-5">
        <HeartFolderIcon className="w-20 h-20 text-blue" />
      </div>

      <h2 className="pb-5 text-2xl font-medium text-center text-dark">
        Your wishlist is empty!
      </h2>
      <Link
        href="/shop"
        className="w-96 mx-auto flex justify-center font-medium text-white bg-blue py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
      >
        Continue Shopping
      </Link>
    </div>
  );
}
