import Link from "next/link";
import { PlusIcon } from "@/assets/icons";
import DeleteCoupon from "./_components/DeleteCoupon";
import { getCoupons } from "@/get-api-data/coupon";
import { EditIcon } from "../_components/Icons";

export default async function CouponPage() {
  const couponData = await getCoupons();
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex items-center justify-between gap-5 px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">All Coupons</h2>
        <Link
          href="/admin/coupons/add"
          className="inline-flex items-center gap-2 px-5 py-3 text-sm font-normal text-white duration-200 ease-out rounded-lg bg-dark hover:bg-darkLight"
        >
          <PlusIcon className="w-3 h-3" /> Add Coupon
        </Link>
      </div>

      {couponData && (
        <div className="overflow-x-auto rounded-xl">
          <table className="min-w-full text-left bg-white">
            <thead>
              <tr className="text-sm border-b border-gray-3 ">
                <th className="px-6 py-3 font-medium text-gray-6">Name</th>
                <th className="px-6 py-3 font-medium text-gray-6">Code</th>
                <th className="px-6 py-3 font-medium text-gray-6">
                  Percentage
                </th>
                <th className="px-6 py-3 font-medium text-right text-gray-6">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-3">
              {couponData.length > 0 ? (
                couponData.map((coupon) => (
                  <tr key={coupon.id}>
                    <td className="px-6 py-3 text-sm">{coupon.name}</td>
                    <td className="px-6 py-3 text-sm font-medium text-dark">
                      {coupon.code}
                    </td>
                    <td className="px-6 py-3 text-sm font-medium text-dark">
                      {coupon.discount}%
                    </td>
                    <td className="px-6 py-3 text-right">
                      <div className="flex justify-end gap-2.5">
                        {/* delete coupon */}
                        <DeleteCoupon id={coupon.id} />
                        {/* edit coupon */}
                        <Link
                          href={`/admin/coupons/edit/${coupon.id}`}
                          aria-label="Edit coupon"
                          className="p-1.5 border rounded-md text-gray-7 bg-transparent hover:bg-blue-light-5 hover:text-blue size-8 inline-flex items-center justify-center border-gray-3"
                        >
                          <EditIcon />
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-red">
                    No coupon found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
