"use client";

import { useCart } from "@/hooks/useCart";
import convertToSubcurrency from "@/lib/convertToSubcurrency";
import { useElements, useStripe } from "@stripe/react-stripe-js";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
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
  snapshot: string;
  paymentIntentId?: string;
};

const CheckoutPaymentArea = ({ amount }: { amount: number }) => {
  const { handleSubmit } = useCheckoutForm();
  const { data: session } = useSession();
  const { cartDetails } = useCart();

  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loading, setLoading] = useState(false);

  const submittingRef = useRef(false);
  const pendingOrderRef = useRef<PendingOrder | null>(null);
  const submissionBlockedRef = useRef(false);
  const intentAmountRef = useRef<number | null>(null);

  // Prevent further submission while navigation is in progress.
  const navigatingRef = useRef(false);

  const goToOrder = (orderId: string) => {
    navigatingRef.current = true;
    router.push(`/order/${orderId}`);
  };

  // A PaymentIntent is created only after the buyer submits valid details.
  // Keep the intent for retries so one order cannot create multiple intents.
  const initializePayment = async () => {
    if (clientSecret && paymentIntentId) {
      if (intentAmountRef.current !== amount) {
        throw new Error(
          "The checkout total changed after payment was initiated. " +
          "Please reload checkout before trying again."
        );
      }
      return { clientSecret, paymentIntentId };
    }

    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: convertToSubcurrency(amount) }),
    });
    const result = await response.json();
    if (
      !response.ok ||
      typeof result?.clientSecret !== "string" ||
      typeof result?.paymentIntentId !== "string"
    ) {
      throw new Error(result?.error || "Unable to initialize payment.");
    }
    intentAmountRef.current = amount;
    setClientSecret(result.clientSecret);
    setPaymentIntentId(result.paymentIntentId);
    return {
      clientSecret: result.clientSecret as string,
      paymentIntentId: result.paymentIntentId as string,
    };
  };

  const getProducts = () =>
    Object.values(cartDetails ?? {}).map((item) => ({
      id: item.id,
      slug: item.slug || item.id,
      image: item.image || "",
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      color: item?.color || "",
      size: item?.size || "",
      attribute: item?.attribute || "",
    }));

  const createOrder = async (
    data: CheckoutInput,
    snapshot: string,
    intentId?: string
  ): Promise<string> => {
    const existingOrder = pendingOrderRef.current;

    if (existingOrder) {
      if (
        existingOrder.snapshot !== snapshot ||
        existingOrder.paymentIntentId !== intentId
      ) {
        throw new Error(
          `Order ${existingOrder.id} already exists. ` +
            "Restore the original checkout details or contact support to change this order."
        );
      }

      return existingOrder.id;
    }

    if (submissionBlockedRef.current) {
      throw new Error(
        "Your previous order submission could not be confirmed. " +
          "Please contact support before submitting another order."
      );
    }

    // A lost response does not prove that order creation failed.
    submissionBlockedRef.current = true;

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
        products: getProducts(),
      }),
    });

    const result = await response.json();

    if (
      !response.ok ||
      !result?.success ||
      typeof result?.data?.id !== "string"
    ) {
      // The supplied order API returns 400 before saving an order.
if (response.status === 400 || response.status === 409) {
  submissionBlockedRef.current = false;
}

      throw new Error(
        result?.message ||
          "Order submission could not be confirmed. Please contact support before trying again."
      );
    }

    const orderId = result.data.id;

    pendingOrderRef.current = {
      id: orderId,
      snapshot,
      paymentIntentId: intentId,
    };

    submissionBlockedRef.current = false;

    return orderId;
  };

  const handleCheckout = async (data: CheckoutInput) => {
    if (submittingRef.current || navigatingRef.current) {
      return;
    }

    submittingRef.current = true;
    setLoading(true);
    setErrorMessage("");

    try {
      if (data.billing.createAccount && !session?.user) {
        throw new Error(
          "Please register using the account registration page, " +
            "or uncheck Create Account to continue as a guest."
        );
      }

      const products = getProducts();

      if (products.length === 0) {
        throw new Error("Your cart is empty.");
      }

      const snapshot = JSON.stringify({
        data,
        amount,
        products,
      });

      if (data.paymentMethod === "cod") {
        const orderId = await createOrder(data, snapshot);

        toast.success("Order created successfully.");
        goToOrder(orderId);
        return;
      }

      if (!stripe || !elements) {
        throw new Error("Payment system is not ready. Please try again.");
      }

      // Validate the Payment Element before creating anything in Stripe.
      const { error: submitError } = await elements.submit();
      if (submitError) {
        throw new Error(
          submitError.message || "Please check your payment details."
        );
      }

      const intent = await initializePayment();
      const activeSecret = intent.clientSecret;
      const activeIntentId = intent.paymentIntentId;

      // Check whether a previous attempt already completed payment.
      const current = await stripe.retrievePaymentIntent(activeSecret);

      if (current.error || !current.paymentIntent) {
        throw new Error(
          current.error?.message || "Unable to check payment status."
        );
      }

      const currentIntent = current.paymentIntent;

      if (
        currentIntent.status === "succeeded" ||
        currentIntent.status === "processing"
      ) {
        const existingOrder = pendingOrderRef.current;

        if (!existingOrder) {
          throw new Error(
            "This payment has already been submitted. " +
              `Please contact support with payment reference ${activeIntentId}.`
          );
        }

        goToOrder(existingOrder.id);
        return;
      }

      if (currentIntent.status === "canceled") {
        throw new Error(
          "This payment was canceled. Please contact support before placing another order."
        );
      }

      if (currentIntent.status === "requires_capture") {
        throw new Error(
          "This payment is awaiting capture. Please contact support."
        );
      }

      if (intentAmountRef.current !== amount) {
        throw new Error(
          "The checkout total has changed. If an order already exists, " +
            "restore the original total or contact support to amend it."
        );
      }

      const existingOrder = pendingOrderRef.current;

      if (
        existingOrder &&
        (existingOrder.snapshot !== snapshot ||
          existingOrder.paymentIntentId !== activeIntentId)
      ) {
        throw new Error(
          `Order ${existingOrder.id} already exists. ` +
            "Restore the original checkout details or contact support to change this order."
        );
      }

      const orderId = await createOrder(
        data,
        snapshot,
        activeIntentId
      );

      const { paymentIntent, error } = await stripe.confirmPayment({
        elements,
        clientSecret: activeSecret,
        confirmParams: {
          return_url: `${window.location.origin}/order/${orderId}`,
        },
        redirect: "if_required",
      });

      if (error) {
        // Check status before treating confirmation as failed.
        // A successful payment can produce an unexpected-state error
        // if it was confirmed again.
        const latest = await stripe.retrievePaymentIntent(activeSecret);

        if (
          latest.paymentIntent?.status === "succeeded" ||
          latest.paymentIntent?.status === "processing"
        ) {
          goToOrder(orderId);
          return;
        }

        console.error("Stripe payment confirmation failed:", {
          code: error.code,
          message: error.message,
        });

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

        // Payment status is updated by the server webhook.
        goToOrder(orderId);
        return;
      }

      throw new Error(
        `Payment has not completed. Your order reference is ${orderId}.`
      );
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Order processing failed. Please try again.";

      setErrorMessage(message);
    } finally {
      submittingRef.current = false;

      if (!navigatingRef.current) {
        setLoading(false);
      }
    }
  };

  return (
    <section className="pb-20 overflow-hidden bg-gray-2">
      <div className="w-full gap-6 px-4 mx-auto max-w-7xl sm:px-8 xl:px-0">
        {!session?.user && (
          <div className="mb-6">
            <Login />
          </div>
        )}

        <form onSubmit={handleSubmit(handleCheckout)}>
          <div className="grid gap-6 lg:grid-cols-5">
            <div className="w-full space-y-6 lg:col-span-3">
              <Billing />
              <Shipping />
              <Notes />
            </div>

            <div className="w-full space-y-6 lg:col-span-2">
              <Orders />
              <Coupon />
              <ShippingMethod />
              <PaymentMethod amount={amount} />

              <button
                type="submit"
                disabled={loading}
                className="
                  flex justify-center w-full px-6 py-3
                  font-medium text-white duration-200 ease-out
                  rounded-md bg-blue hover:bg-blue-dark
                  disabled:opacity-50 disabled:cursor-not-allowed
                "
              >
                {loading
                  ? "Processing..."
                  : `Pay $${amount.toFixed(2)}`}
              </button>

            </div>
          </div>

          {errorMessage && (
            <p role="alert" className="mt-2 text-center text-red">
              {errorMessage}
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default CheckoutPaymentArea;