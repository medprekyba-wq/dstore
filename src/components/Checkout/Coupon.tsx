import CouponForm from "./CouponForm";

export default function Coupon() {
  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div className="px-6 py-5 border-b border-gray-3">
        <h3 className="text-lg font-medium text-dark">Have any Coupon Code?</h3>
      </div>

      <div className="p-6">
        <div className="flex gap-4">
          <CouponForm />
        </div>
      </div>
    </div>
  );
}
