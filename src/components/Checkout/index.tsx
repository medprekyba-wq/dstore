"use client";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useForm } from "react-hook-form";
import { CheckoutFormProvider, CheckoutInput } from "./form";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { EmptyCartIcon } from "@/assets/icons";
import CheckoutPaymentArea from "./CheckoutPaymentArea";
import CheckoutAreaWithoutStripe from "./CheckoutAreaWithoutStripe";

if (process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY === undefined) {
  throw new Error("NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined");
}
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

export default function CheckoutMain() {
  const session = useSession();
  const { register, formState, watch, control, handleSubmit, setValue } =
    useForm<CheckoutInput>({
      defaultValues: {
        shippingMethod: {
          name: "free",
          price: 0,
        },
        paymentMethod: "bank",
        couponDiscount: 0,
        couponCode: "",
        billing: {
          address: {
            street: "",
            apartment: "",
          },
          companyName: "",
          country: "",
          email: session.data?.user?.email || "",
          firstName: session.data?.user?.name || "",
          lastName: "",
          phone: "",
          regionName: "",
          town: "",
          createAccount: false,
        },
        shipping: {
          address: {
            street: "",
            apartment: "",
          },
          country: "",
          email: "",
          phone: "",
          town: "",
          countryName: "",
        },
        notes: "",
        shipToDifferentAddress: false,
      },
    });

  const { totalPrice = 0, cartDetails } = useCart();
  const cartIsEmpty = !cartDetails || Object.keys(cartDetails).length === 0;

  const shippingFee = watch("shippingMethod");
  const couponDiscount = ((watch("couponDiscount") || 0) * totalPrice) / 100;
  const amount = totalPrice - couponDiscount + (shippingFee?.price || 0);

  if (cartIsEmpty) {
    return (
      <div className="py-20 mt-40">
        <div className="flex items-center justify-center mb-5">
          <EmptyCartIcon className="mx-auto text-blue" />
        </div>
        <h2 className="pb-5 text-2xl font-medium text-center text-dark">
          No items found in your cart to checkout.
        </h2>
        <Link
          href="/shop"
          className="w-96 mx-auto flex justify-center font-medium text-white bg-blue py-[13px] px-6 rounded-md ease-out duration-200 hover:bg-blue-dark"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return amount > 0 ? (
    <Elements
      stripe={stripePromise}
      options={{
        mode: "payment",
        amount: convertToSubcurrency(amount),
        currency: "usd",
      }}
    >
      <CheckoutFormProvider
        value={{
          register,
          watch,
          control,
          setValue,
          errors: formState.errors,
          handleSubmit,
        }}
      >
        <CheckoutPaymentArea amount={amount} />
      </CheckoutFormProvider>
    </Elements>
  ) : (
    <CheckoutFormProvider
      value={{
        register,
        watch,
        control,
        setValue,
        errors: formState.errors,
        handleSubmit,
      }}
    >
      <CheckoutAreaWithoutStripe amount={amount} />
    </CheckoutFormProvider>
  );
}
