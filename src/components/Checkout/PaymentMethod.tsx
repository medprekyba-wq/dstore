import Image from "next/image";
import { Controller } from "react-hook-form";
import { RadioInput } from "../ui/input/radio";
import { useCheckoutForm } from "./form";
import { PaymentElement } from "@stripe/react-stripe-js";

const PaymentMethod = ({ amount }: { amount: number }) => {
  const { errors, control, watch } = useCheckoutForm();
  const paymentMethod = watch("paymentMethod");

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div className="px-6 py-5 border-b border-gray-3">
        <h3 className="text-lg font-medium text-dark">
          Payment Method
        </h3>
      </div>

      <div className="p-6">
        {amount > 0 && (
          <Controller
            name="paymentMethod"
            control={control}
            defaultValue="bank"
            render={({ field }) => (
              <RadioInput
                {...field}
                value="bank"
                checked={field.value === "bank"}
                label={<PaymentMethodCard />}
              />
            )}
          />
        )}

        {errors.paymentMethod && (
          <p className="mt-2 text-sm text-red">
            Please select a payment method
          </p>
        )}

        {paymentMethod === "bank" && amount > 0 && (
          <div className="mt-5">
            <PaymentElement />
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentMethod;

function PaymentMethodCard() {
  return (
    <div className="rounded-md border-[0.5px] flex items-center shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2 min-w-[240px]">
      <div className="pr-2.5">
        <Image
          src="/images/checkout/stripe.svg"
          className="shrink-0"
          alt="Stripe"
          width={75}
          height={20}
        />
      </div>

      <p className="border-l border-gray-4 pl-2.5">
        Stripe
      </p>
    </div>
  );
}
