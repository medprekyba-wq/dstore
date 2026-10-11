"use client";

import { useCart } from "@/hooks/useCart";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
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

type PendingOrder = {
  id: string;
  checkoutSnapshot: string;
  paymentIntentId?: string;
};

const CheckoutArea = ({ amount }: { amount: number }) => {
  const { handleSubmit } = useCheckoutForm();
  const { data: session } = useSession();

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const { cartDetails } = useCart();

  const [errorMessage, setErrorMessage] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [paymentLoading, setPaymentLoading] = useState(true);

  // Refs prevent duplicate submission before React updates state.
  const submittingRef = useRef(false);
  const pendingOrderRef = useRef<PendingOrder | null>(null);
  const orderSubmissionBlockedRef = useRef(false);
  const intentAmountRef = useRef<number | null>(null);

  useEffect(() => {
    // Preserve the PaymentIntent associated with an existing order.
    if (pendingOrderRef.current || orderSubmissionBlockedRef.current) {
      return;
    }

    let active = true;
    const controller = new AbortController();

    setClientSecret("");
    setPaymentIntentId("");
    intentAmountRef.current = null;
    setErrorMessage("");

    const createPaymentIntent = async () => {
      setPaymentLoading(true);

      try {
        const response = await fetch("/api/create-payment-intent", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: convertToSubcurrency(amount),
          }),
          signal: controller.signal,
        });

        const result = await response.json();

        if (
          !response.ok ||
          !result?.clientSecret ||
          !result?.paymentIntentId
        ) {
          throw new Error(
            result?.error || "Unable to initialize payment."
          );
        }

        if (active) {
          intentAmountRef.current = amount;
          setClientSecret(result.clientSecret);
          setPaymentIntentId(result.paymentIntentId);
        }
      } catch (error) {
        if (!active) return;

        console.error("PaymentIntent creation error:", error);
        setErrorMessage(
          "Unable to initialize Stripe payment. Please try again."
        );
      } finally {
        if (active) {
          setPaymentLoading(false);
        }
      }
    };

    if (Number.isFinite(amount) && amount > 0) {
      void createPaymentIntent();
    } else {
      setPaymentLoading(false);
    }

    return () => {
      active = false;
      controller.abort();
    };
  }, [amount]);

  const createOrder = async (
    data: CheckoutInput,
    checkoutSnapshot: string,
    intentId?: string
  ): Promise<string> => {
    const existingOrder = pendingOrderRef.current;

    if (existingOrder) {
      if (
        existingOrder.checkoutSnapshot !== checkoutSnapshot ||
        existingOrder.paymentIntentId !== intentId
      ) {
        throw new Error(
          `Order ${existingOrder.id} has already been created. ` +
            "Please restore the original checkout details or contact support to change the order."
        );
      }

      return existingOrder.id;
    }

    if (orderSubmissionBlockedRef.current) {
      throw new Error(
        "A previous order submission could not be confirmed. " +
          "Please contact support before placing another order."
      );
    }

    // Keep submission blocked if the response is lost or the server
    // returns an error: the order might already have been saved.
    orderSubmissionBlockedRef.current = true;

    const response = await fetch("/api/order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        totalAmount: amount,
        paymentIntentId: intentId,
        couponCode: data.couponCode,
        products: Object.values(cartDetails ?? {}).map((item) => ({
          id: item.id,
          name: item.name,
          slug: item.slug || item.id,
          image: item.image || "",
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    });

    const result = await response.json();

    if (!response.ok || !result?.success || !result?.data?.id) {
      // The supplied order route returns 400 before creating an order.
      if (response.status === 400) {
        orderSubmissionBlockedRef.current = false;
      }

      throw new Error(
        result?.message ||
          "Order submission could not be confirmed. Please contact support before trying again."
      );
    }

    const orderId = result.data.id as string;

    pendingOrderRef.current = {
      id: orderId,
      checkoutSnapshot,
      paymentIntentId: intentId,
    };

    orderSubmissionBlockedRef.current = false;

    return orderId;
  };

  const handleCheckout = async (data: CheckoutInput) => {
    if (submittingRef.current) return;

    submittingRef.current = true;
    setLoading(true);
    setErrorMessage("");

    try {
      /*
       * The original registration code assigned every customer
       * the same password. Require a proper registration flow instead.
       */
      if (data.billing.createAccount && !session?.user) {
        throw new Error(
          "Please create your account using the registration page, " +
            "or uncheck Create Account to continue as a guest."
        );
      }

      const products = Object.values(cartDetails ?? {}).map((item) => ({
        id: item.id,
        name: item.name,
        slug: item.slug || item.id,
        image: item.image || "",
        price: item.price,
        quantity: item.quantity,
      }));

      if (products.length === 0) {
        throw new Error("Your cart is empty.");
      }

      const checkoutSnapshot = JSON.stringify({
        data,
        amount,
        products,
      });

      // Cash on Delivery does not require Stripe to be ready.
      if (data.paymentMethod === "cod") {
        const orderId = await createOrder(data, checkoutSnapshot);

        toast.success("Order created successfully.");
        router.push(`/order/${orderId}`);
        return;
      }

      if (
        !stripe ||
        !elements ||
        !clientSecret ||
        !paymentIntentId ||
        paymentLoading ||
        intentAmountRef.current !== amount
      ) {
        throw new Error(
          "Payment system is not ready. Please wait and try again."
        );
      }

      // Validate payment details before reserving stock.
      const { error: submitError } = await elements.submit();

      if (submitError) {
        throw new Error(
          submitError.message || "Please check your payment details."
        );
      }

      // Save the pending order and attach its ID to Stripe first.
      const orderId = await createOrder(
        data,
        checkoutSnapshot,
        paymentIntentId
      );

      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        console.error("Stripe payment error:", error);

        // A network error can occur after payment succeeds.
        // Retrieve the current status before offering another attempt.
        try {
          const current = await stripe.retrievePaymentIntent(clientSecret);
          const status = current.paymentIntent?.status;

          if (status === "succeeded" || status === "processing") {
            router.push(`/order/${orderId}`);
            return;
          }
        } catch (statusError) {
          console.error("Unable to retrieve payment status:", statusError);
        }

        throw new Error(
          `${error.message || "Unable to confirm payment."} ` +
            `Your order reference is ${orderId}.`
        );
      }

      if (
        paymentIntent?.status === "succeeded" ||
        paymentIntent?.status === "processing"
      ) {
        toast.success(
          paymentIntent.status === "processing"
            ? "Payment is processing."
            : "Payment submitted successfully."
        );

        // The webhook updates paymentStatus on the server.
        router.push(`/order/${orderId}`);
        return;
      }

      if (paymentIntent?.status === "canceled") {
        throw new Error(
          `Payment was canceled. Please contact support about order ${orderId}.`
        );
      }

      throw new Error(
        `Payment has not completed. Your order reference is ${orderId}.`
      );
    } catch (error) {
      console.error("Checkout processing error:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Order processing failed. Please try again."
      );
    } finally {
      submittingRef.current = false;
      setLoading(false);
    }
  };

  return (
    <section className="pb-20 overflow-hidden bg-gray-2">
      <div className="w-full mx-auto max-w-7xl">
        {!session?.user && <Login />}

        <form
          className="contents"
          onSubmit={handleSubmit(handleCheckout)}
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
            {loading ? "Processing..." : `Pay $${amount.toFixed(2)}`}
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