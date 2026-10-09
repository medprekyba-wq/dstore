
"use client";

import { useEffect } from "react";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { useForm } from "react-hook-form";
import type { CheckoutInput } from "./form";
import { CheckoutFormProvider } from "./form";
import { useCart } from "@/hooks/useCart";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { EmptyCartIcon } from "@/assets/icons";
import CheckoutPaymentArea from "./CheckoutPaymentArea";
import CheckoutAreaWithoutStripe from "./CheckoutAreaWithoutStripe";

// Stripe initialization
const stripePublishableKey =
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error(
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined"
  );
}

const stripePromise = loadStripe(stripePublishableKey);

export default function CheckoutMain() {
  const { data: session } = useSession();

  const {
    register,
    formState: { errors },
    watch,
    control,
    handleSubmit,
    setValue,
    clearErrors,
    getValues,
  } = useForm<CheckoutInput>({
    mode: "onSubmit",
    reValidateMode: "onChange",

    defaultValues: {
      // Shipping method
      shippingMethod: {
        name: "free",
        price: 0,
      },

      // Payment method
      paymentMethod: "bank",

      // Coupon
      couponDiscount: 0,
      couponCode: "",

      // Billing address
      billing: {
        firstName: "",
        lastName: "",
        companyName: "",

        // Country ISO code (LT, US, GB, etc.)
        regionName: "",

        // State / Province ISO code
        country: "",

        address: {
          street: "",
          apartment: "",
        },

        town: "",
        postcode: "",
        phone: "",
        email: "",
        createAccount: false,
      },

      // Shipping address
      shipping: {
        // Country ISO code (LT, US, GB, etc.)
        countryName: "",

        // State / Province ISO code
        country: "",

        address: {
          street: "",
          apartment: "",
        },

        town: "",
        postcode: "",
        phone: "",
        email: "",
      },

      // Additional information
      notes: "",
      shipToDifferentAddress: false,

      // Products
      products: [],
    },
  });

  // Fill customer information after session loads.
  // Existing manually entered information is preserved.
  useEffect(() => {
    if (!session?.user) return;

    // Populate email
    if (
      session.user.email &&
      !getValues("billing.email")
    ) {
      setValue("billing.email", session.user.email);
    }

    // Populate first name and last name separately
    if (session.user.name) {
      const fullName = session.user.name.trim();

      const nameParts = fullName.split(/\s+/);

      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ");

      // Only populate First Name if empty
      if (
        firstName &&
        !getValues("billing.firstName")
      ) {
        setValue("billing.firstName", firstName);
      }

      // Only populate Last Name if empty
      if (
        lastName &&
        !getValues("billing.lastName")
      ) {
        setValue("billing.lastName", lastName);
      }
    }
  }, [session, getValues, setValue]);

  // Cart information
  const {
    totalPrice = 0,
    cartDetails,
  } = useCart();

  const cartIsEmpty =
    !cartDetails ||
    Object.keys(cartDetails).length === 0;

  // Shipping cost
  const shippingMethod = watch("shippingMethod");

  const shippingPrice = Number(
    shippingMethod?.price ?? 0
  );

  // Coupon discount percentage
  const discountPercentage = Number(
    watch("couponDiscount") ?? 0
  );

  const validDiscountPercentage = Math.min(
    100,
    Math.max(0, discountPercentage)
  );

  const couponDiscount =
    (validDiscountPercentage * totalPrice) / 100;

  // Final checkout amount
  const amount = Math.max(
    0,
    totalPrice - couponDiscount + shippingPrice
  );

  // Shared form context for billing and shipping
  const formContextValue = {
    register,
    watch,
    control,
    setValue,
    clearErrors,
    errors,
    handleSubmit,
  };

  // Empty cart
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

  // Stripe checkout
  if (amount > 0) {
    return (
      <Elements
        stripe={stripePromise}
        options={{
          mode: "payment",
          amount: convertToSubcurrency(amount),
          currency: "usd",
        }}
      >
        <CheckoutFormProvider value={formContextValue}>
          <CheckoutPaymentArea amount={amount} />
        </CheckoutFormProvider>
      </Elements>
    );
  }

  // Checkout without Stripe (zero-value orders)
  return (
    <CheckoutFormProvider value={formContextValue}>
      <CheckoutAreaWithoutStripe amount={amount} />
    </CheckoutFormProvider>
  );
}