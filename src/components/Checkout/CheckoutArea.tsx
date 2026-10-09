"use client";

import { useCart } from "@/hooks/useCart";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Billing from "./Billing";
import Coupon from "./Coupon";
import Login from "./Login";
import Notes from "./Notes";
import PaymentMethod from "./PaymentMethod";
import Shipping from "./Shipping";
import ShippingMethod from "./ShippingMethod";
import { useCheckoutForm } from "./form";
import type { CheckoutInput } from "./form";
import Orders from "./orders";

const CheckoutArea = ({ amount }: { amount: number }) => {
  const { handleSubmit } = useCheckoutForm();

  const { data: session } = useSession();

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const { cartDetails } = useCart();

  const [errorMessage, setErrorMessage] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);

  // Create Stripe PaymentIntent
  useEffect(() => {
    let active = true;

    const createPaymentIntent = async () => {
      setPaymentLoading(true);
      setClientSecret("");
      setErrorMessage("");

      try {
        const response = await fetch(
          "/api/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: convertToSubcurrency(amount),
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Unable to initialize payment."
          );
        }

        const result = await response.json();

        if (!result?.clientSecret) {
          throw new Error(
            "Payment initialization failed."
          );
        }

        if (active) {
          setClientSecret(result.clientSecret);
        }
      } catch (error) {
        console.error(
          "PaymentIntent creation error:",
          error
        );

        if (active) {
          setErrorMessage(
            "Unable to initialize Stripe payment. Please try again."
          );
        }
      } finally {
        if (active) {
          setPaymentLoading(false);
        }
      }
    };

    if (amount > 0) {
      createPaymentIntent();
    } else {
      setPaymentLoading(false);
    }

    return () => {
      active = false;
    };
  }, [amount]);

  // Register customer account
  const registerCustomer = async (
    data: CheckoutInput
  ): Promise<boolean> => {
    if (!data.billing.createAccount) {
      return true;
    }

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.billing.email,
          name: [
            data.billing.firstName,
            data.billing.lastName,
          ]
            .filter(Boolean)
            .join(" "),
          password: "12345678",
        }),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        toast.error(
          result?.message ||
            "Failed to create account"
        );
        return false;
      }

      return true;
    } catch (error) {
      console.error(
        "Account registration error:",
        error
      );

      toast.error(
        "Unable to create account."
      );

      return false;
    }
  };

  // Create order
  const createOrder = async (
    data: CheckoutInput,
    paymentStatus: "pending" | "paid",
    paymentIntentId?: string
  ): Promise<boolean> => {
    const orderData = {
      ...data,

      totalAmount: amount,

      userId: session?.user?.id || null,

      paymentStatus,

      paymentIntentId,

      couponCode: data.couponCode,

      products: Object.values(
        cartDetails ?? {}
      ).map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug || item.id,
        image: item.image || "",
        price: item.price,
        quantity: item.quantity,
      })),
    };

    try {
      const response = await fetch("/api/order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        toast.error(
          result?.message ||
            "Failed to create order"
        );
        return false;
      }

      toast.success(
        "Order created successfully"
      );

      router.push(
        `/order/${result?.data?.id}`
      );

      return true;
    } catch (error) {
      console.error(
        "Order creation error:",
        error
      );

      toast.error(
        "Failed to create order."
      );

      return false;
    }
  };

  // Handle checkout
  const handleCheckout = async (
    data: CheckoutInput
  ) => {
    if (loading) return;

    setLoading(true);
    setErrorMessage("");

    try {
      // Register account if requested
      const accountCreated =
        await registerCustomer(data);

      if (!accountCreated) {
        return;
      }

      // Cash on Delivery
      if (data.paymentMethod === "cod") {
        await createOrder(
          data,
          "pending"
        );
        return;
      }

      // Stripe readiness check
      if (
        !stripe ||
        !elements ||
        !clientSecret
      ) {
        setErrorMessage(
          "Payment system is not ready. Please try again."
        );
        return;
      }

      // Validate Stripe Payment Element
      const { error: submitError } =
        await elements.submit();

      if (submitError) {
        setErrorMessage(
          submitError.message ||
            "Please check your payment details."
        );
        return;
      }

      const siteUrl =
        window.location.origin;

      // Confirm Stripe payment
      const {
        paymentIntent,
        error,
      } = await stripe.confirmPayment({
        elements,
        clientSecret,

        confirmParams: {
          return_url:
            `${siteUrl}/success?amount=${amount}`,
        },

        redirect: "if_required",
      });

      if (error) {
        console.error(
          "Stripe payment error:",
          error
        );

        setErrorMessage(
          error.message ||
            "Payment failed. Please try again."
        );

        return;
      }

      if (
        paymentIntent?.status ===
        "succeeded"
      ) {
        const orderCreated =
          await createOrder(
            data,
            "paid",
            paymentIntent.id
          );

        if (!orderCreated) {
          setErrorMessage(
            "Your payment was successful, but your order could not be saved. Please contact support with your payment reference."
          );

          console.error(
            "Payment succeeded but order creation failed:",
            paymentIntent.id
          );
        }

        return;
      }

      if (
        paymentIntent?.status ===
        "processing"
      ) {
        toast.success(
          "Payment is processing."
        );
        return;
      }

      setErrorMessage(
        "Payment was not completed. Please try again."
      );
    } catch (error) {
      console.error(
        "Checkout processing error:",
        error
      );

      setErrorMessage(
        "Order processing failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="pb-20 overflow-hidden bg-gray-2">
      <div className="w-full mx-auto max-w-7xl">
        {!session?.user && <Login />}

        <form
          className="contents"
          onSubmit={handleSubmit(
            handleCheckout
          )}
        >
          <Billing />

          <Shipping />

          <Notes />

          <Orders />

          <Coupon />

          <ShippingMethod />

          <PaymentMethod amount={amount} />

          <button
            type="submit"
            disabled={loading}
            className="
              w-full
              flex
              justify-center
              font-medium
              text-white
              bg-blue
              py-3
              px-6
              rounded-md
              ease-out
              duration-200
              hover:bg-blue-dark
              mt-7.5
              disabled:opacity-50
              disabled:cursor-not-allowed
            "
          >
            {loading
              ? "Processing..."
              : `Pay $${amount.toFixed(2)}`}
          </button>

          {paymentLoading && (
            <p className="mt-3 text-center text-sm text-gray-6">
              Initializing payment...
            </p>
          )}

          {errorMessage && (
            <p
              role="alert"
              className="mt-3 text-center text-red"
            >
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default CheckoutArea;