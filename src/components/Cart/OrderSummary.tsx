import Link from "next/link";
import { useCart } from "@/hooks/useCart";
import { formatPrice } from "@/utils/formatePrice";
import { useCheckoutForm } from "../Checkout/form";

const OrderSummary = () => {
  const { watch } = useCheckoutForm();
  const { cartCount, cartDetails, totalPrice = 0 } = useCart();
  const couponDiscount = ((watch("couponDiscount") || 0) * totalPrice) / 100;
  return (
    <div className="w-full lg:col-span-4">
      {/* <!-- order list box --> */}
      <div className="bg-white shadow-1 rounded-[10px]">
        <div className="px-6 py-5 border-b border-gray-3">
          <h3 className="text-lg font-medium text-dark">Order Summary</h3>
        </div>

        <div className="p-6">
          {/* <!-- title --> */}
          <div className="flex items-center justify-between pb-5 border-b border-gray-3">
            <div>
              <h4 className="font-medium text-dark">Product</h4>
            </div>
            <div>
              <h4 className="font-medium text-right text-dark">Subtotal</h4>
            </div>
          </div>

          {/* <!-- product item --> */}
          {cartCount && (
            <>
              {Object.values(cartDetails ?? {}).map((product, key) => (
                <div
                  key={key}
                  className="flex items-center justify-between py-5 border-b border-gray-3"
                >
                  <div>
                    <p className="text-sm text-dark">{product.name}</p>
                  </div>
                  <div>
                    <p className="text-right text-dark">
                      {formatPrice(product.price * product.quantity)}
                    </p>
                  </div>
                </div>
              ))}
            </>
          )}

          {!!couponDiscount && (
            <div className="flex items-center justify-between py-5 border-b border-gray-3">
              <div>
                <p className="text-dark">
                  Coupon Discount ({watch("couponDiscount")}%)
                </p>
              </div>
              <div>
                <p className="text-right text-dark">
                  - {formatPrice(couponDiscount)}
                </p>
              </div>
            </div>
          )}

          {/* <!-- total --> */}
          <div className="flex items-center justify-between pt-5">
            <div>
              <p className="text-lg font-medium text-dark">Total</p>
            </div>
            <div>
              <p className="text-lg font-medium text-right text-dark">
                {formatPrice(totalPrice && (totalPrice - couponDiscount))}
              </p>
            </div>
          </div>

          {/* <!-- checkout button --> */}
          <Link
            href="/checkout"
            className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5"
          >
            Process to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
