import { WishlistItem } from "@/types/wishlistItem";
import SingleItem from "./SingleItem";

export default function WishListTable({
  wishlistItems,
}: {
  wishlistItems: WishlistItem[];
}) {
  return (
    <div className="overflow-x-auto bg-white border rounded-xl border-gray-3">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-3">
            <th className="px-6 py-4 text-sm font-medium text-left text-gray-6 whitespace-nowrap">
              <p className="break-word">Product</p>
            </th>

            <th className="px-6 py-4 text-sm font-medium text-left text-gray-6 whitespace-nowrap">
              <p>Unit Price</p>
            </th>

            <th className="px-6 py-4 text-sm font-medium text-left text-gray-6 whitespace-nowrap">
              <p>Stock Status</p>
            </th>

            <th className="px-6 py-4 text-sm font-medium text-left text-gray-6 whitespace-nowrap">
              <p>Action</p>
            </th>
            <th>
              <div className="relative">
                <p className="sr-only ">Remove</p>
              </div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-3">
          {wishlistItems.map((item: any, key: any) => (
            <SingleItem item={item} key={key} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
