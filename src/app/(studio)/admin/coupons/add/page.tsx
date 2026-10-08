import CouponForm from "../_components/CouponForm";

function AddCouponPage() {
  return (
    <div className="w-full max-w-3xl mx-auto bg-white border rounded-xl shadow-1 border-gray-3">
      <div className="flex items-center justify-between gap-5 px-6 py-5 border-b border-gray-3">
        <h1 className="text-base font-semibold text-dark ">Add Coupon</h1>
      </div>

      <div className="p-6">
        <CouponForm />
      </div>
    </div>
  );
}

export default AddCouponPage;
