export default function WishListTableHeader() {
  return (
    <tr className="border-b border-gray-3">
      <th
        colSpan={2}
        className="py-5.5 px-6 font-medium whitespace-nowrap text-sm text-gray-6 text-left"
      >
        <p className="text-dark">Product</p>
      </th>

      <th className="py-5.5 px-6 font-medium text-left whitespace-nowrap text-sm text-gray-6">
        <p className="text-dark">Unit Price</p>
      </th>

      <th className="py-5.5 px-6 font-medium text-left whitespace-nowrap text-sm text-gray-6">
        <p className="text-dark">Stock Status</p>
      </th>

      <th className="py-5.5 px-6 font-medium whitespace-nowrap text-sm text-gray-6 text-left">
        <p className=" text-dark">Action</p>
      </th>
      <th>
        <p className="relative sr-only">Remove</p>
      </th>
    </tr>
  );
}
