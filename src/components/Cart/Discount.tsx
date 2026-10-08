import CouponForm from "../Checkout/CouponForm";

const Discount = () => {
  return (
    <div className="w-full lg:col-span-8">
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="border-b border-gray-3 py-5 px-4 sm:px-5.5">
          <h3 className="">Have any discount code?</h3>
        </div>

        <div className="py-8 px-4 sm:px-8.5">
          <div className="flex gap-5">
            <CouponForm />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Discount;
