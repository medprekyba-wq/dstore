"use client";
import { useAppSelector } from "@/redux/store";
import WishListEmpty from "./WishListEmpty";
import WishListTable from "./WishListTable";
import WishListTopbar from "./WishListTopbar";

export const Wishlist = () => {
  const wishlistItems = useAppSelector((state) => state.wishlistReducer.items);

  return (
    <>
      <section className="pb-20 overflow-hidden bg-gray-2">
        {wishlistItems.length > 0 ? (
          <div className="px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
            <WishListTopbar />
            <WishListTable wishlistItems={wishlistItems} />
          </div>
        ) : (
          <WishListEmpty />
        )}
      </section>
    </>
  );
};
