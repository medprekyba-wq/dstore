
"use client";

import { useAppSelector } from "@/redux/store";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useCart } from "@/hooks/useCart";
import {
  CheckoutFormProvider,
  CheckoutInput,
} from "../Checkout/form";
import Breadcrumb from "../Common/Breadcrumb";
import Discount from "./Discount";
import OrderSummary from "./OrderSummary";
import SingleItem from "./SingleItem";

const Cart = () => {
  const {
    cartCount,
    shouldDisplayCart,
    handleCartClick,
    cartDetails,
    totalPrice,
    clearCart,
  } = useCart();

  const cartItems = useAppSelector(
    (state) => state.cartReducer.items
  );

  const {
    register,
    formState,
    watch,
    control,
    handleSubmit,
    setValue,
    clearErrors,
  } = useForm<CheckoutInput>({
    defaultValues: {
      billing: {
        firstName: "",
        lastName: "",
        companyName: "",
        regionName: "",
        address: {
          street: "",
          apartment: "",
        },
        town: "",
        country: "",
        postcode: "",
        phone: "",
        email: "",
        createAccount: false,
      },
      shippingMethod: {
        name: "free",
        price: 0,
      },
      paymentMethod: "cod",
      couponDiscount: 0,
    },
  });

  const { data: session } = useSession();

  function handleCheckout(data: CheckoutInput) {
    // Handle the checkout logic here
    console.log(data);
  }

  return (
    <>
      {cartCount ? (
        <section className="pb-20 overflow-hidden bg-gray-2">
          <div className="w-full px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
            <div className="flex flex-wrap items-center justify-between gap-5 mb-7.5">
              <h2 className="text-xl font-medium text-dark">
                Your Cart
              </h2>

              <button
                type="button"
                onClick={() => clearCart()}
                className="text-blue"
              >
                Clear Shopping Cart
              </button>
            </div>

            <div className="bg-white rounded-[10px] shadow-1">
              <div className="w-full overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-gray-3">
                      <td className="py-5.5 px-7.5 whitespace-nowrap">
                        <p className="text-dark">
                          Product
                        </p>
                      </td>

                      <td className="py-5.5 px-7.5 whitespace-nowrap">
                        <p className="text-dark">
                          Price
                        </p>
                      </td>

                      <td className="py-5.5 px-7.5 whitespace-nowrap">
                        <p className="text-dark">
                          Quantity
                        </p>
                      </td>

                      <td className="py-5.5 px-7.5 whitespace-nowrap">
                        <p className="text-dark">
                          Subtotal
                        </p>
                      </td>

                      <td className="py-5.5 px-7.5 whitespace-nowrap">
                        <p className="text-right text-dark">
                          Action
                        </p>
                      </td>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-3">
                    {Object.values(
                      cartDetails ?? {}
                    ).map((item, key) => (
                      <SingleItem
                        key={item.id ?? key}
                        item={item}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <CheckoutFormProvider
              value={{
                register,
                watch,
                control,
                setValue,
                clearErrors,
                errors: formState.errors,
                handleSubmit,
              }}
            >
              <form
                className="contents"
                onSubmit={handleSubmit(
                  handleCheckout
                )}
              >
                <div className="grid grid-cols-1 gap-6 mt-6 lg:grid-cols-12">
                  <Discount />
                  <OrderSummary />
                </div>
              </form>
            </CheckoutFormProvider>
          </div>
        </section>
      ) : (
        <div className="mt-8 mb-10 text-center">
          <div className="mx-auto pb-7.5">
            <svg
              className="mx-auto"
              width="100"
              height="100"
              viewBox="0 0 100 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="50"
                cy="50"
                r="50"
                fill="#F3F4F6"
              />

              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M36.1693 36.2421C36.8308 38.3831 37.9311 39.1325 38.6865 39.6734C39.0192 41.0726 39.0208 42.751 39.0208 46.5361C39.0208 48.4735 39.0207 50.0352 39.1859 51.2634C39.3573 52.5385 39.7241 53.6122 40.5768 54.4649C41.4295 55.3176 42.5032 55.6844 43.7783 55.8558C45.0065 56.0209 46.5681 56.0209 48.5055 56.0209H59.9166C60.5034 56.0209 60.9791 55.5452 60.9791 54.9584C60.9791 54.3716 60.5034 53.8959 59.9166 53.8959H48.5833C46.5498 53.8959 45.1315 53.8936 44.0615 53.7498C43.022 53.61 42.4715 53.3544 42.0794 52.9623C41.9424 52.8253 41.8221 52.669 41.7175 52.4792H55.7495C56.3846 52.4792 56.9433 52.4793 57.4072 52.4292C57.9093 52.375 58.3957 52.2546 58.8534 51.9528C59.3111 51.651 59.6135 51.2513 59.8611 50.8111C60.0898 50.4045 60.3099 49.891 60.56 49.3072L61.2214 47.7641C61.766 46.4933 62.2217 45.4302 62.4498 44.5655C62.6878 43.6634 62.7497 42.7216 62.1884 41.8704C61.627 41.0191 60.737 40.705 59.8141 40.5684C58.9295 40.4374 57.7729 40.4375 56.3903 40.4375L41.0845 40.4375Z"
                fill="#8D93A5"
              />

              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M40.4375 60.625C40.4375 62.3855 41.8646 63.8125 43.625 63.8125C45.3854 63.8125 46.8125 62.3855 46.8125 60.625C46.8125 58.8646 45.3854 57.4375 43.625 57.4375C41.8646 57.4375 40.4375 58.8646 40.4375 60.625ZM43.625 61.6875C43.0382 61.6875 42.5625 61.2118 42.5625 60.625C42.5625 60.0382 43.0382 59.5625 43.625 59.5625C44.2118 59.5625 44.6875 60.0382 44.6875 60.625C44.6875 61.2118 44.2118 61.6875 43.625 61.6875Z"
                fill="#8D93A5"
              />

              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M56.375 63.8126C54.6146 63.8126 53.1875 62.3856 53.1875 60.6251C53.1875 58.8647 54.6146 57.4376 56.375 57.4376C58.1354 57.4376 59.5625 58.8647 59.5625 60.6251C59.5625 62.3856 58.1354 63.8126 56.375 63.8126ZM55.3125 60.6251C55.3125 61.212 55.7882 61.6876 56.375 61.6876C56.9618 61.6876 57.4375 61.212 57.4375 60.6251C57.4375 60.0383 56.9618 59.5626 56.375 59.5626C55.7882 59.5626 55.3125 60.0383 55.3125 60.6251Z"
                fill="#8D93A5"
              />
            </svg>
          </div>

          <p className="pb-6">
            Your cart is empty!
          </p>

          <Link
            href="/shop"
            className="w-96 mx-auto flex justify-center font-medium text-white bg-dark py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-opacity-95"
          >
            Continue Shopping
          </Link>
        </div>
      )}
    </>
  );
};

export default Cart;