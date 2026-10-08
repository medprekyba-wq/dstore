import { useCart } from "@/hooks/useCart";
import { useCheckoutForm } from "./form";
import { formatPrice } from "@/utils/formatePrice";

export default function Orders() {
  const { watch } = useCheckoutForm();
  const { cartCount, cartDetails, totalPrice = 0 } = useCart();

  const shippingFee = watch("shippingMethod");
  const couponDiscount = ((watch("couponDiscount") || 0) * totalPrice) / 100;

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <h3 className="px-4 py-5 text-lg font-medium border-b text-dark border-gray-3 sm:px-6">
        Your Order
      </h3>

      <div className="px-6 pt-1 pb-6">
        <table className="w-full text-dark">
          <thead>
            <tr className="border-b border-gray-3">
              <th className="py-5 text-base font-medium text-left">Product</th>
              <th className="py-5 text-base font-medium text-right">
                Subtotal
              </th>
            </tr>
          </thead>

          <tbody>
            {cartCount && cartCount > 0 ? (
              Object.values(cartDetails ?? {}).map((product, key) => (
                <tr key={key} className="border-b border-gray-3">
                  <td className="py-5 text-sm truncate">{product.name}</td>
                  <td className="py-5 text-sm text-right">
                    {formatPrice(product.price)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="py-5 text-center" colSpan={2}>
                  No items in cart
                </td>
              </tr>
            )}

            <tr className="border-b border-gray-3">
              <td className="py-5">Shipping Fee</td>
              <td className="py-5 text-right">
                {formatPrice(shippingFee?.price || 0)}
              </td>
            </tr>

            {!!couponDiscount && (
              <tr className="border-b border-gray-3">
                <td className="py-5">
                  Coupon Discount ({watch("couponDiscount")}%)
                </td>
                <td className="py-5 text-right">
                  - {formatPrice(couponDiscount)}
                </td>
              </tr>
            )}
          </tbody>

          <tfoot>
            <tr>
              <td className="pt-5 text-base font-medium">Total</td>

              <td className="pt-5 text-base font-medium text-right">
                {formatPrice(totalPrice - couponDiscount + shippingFee.price)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
