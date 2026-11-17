
"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { RadioInput } from "../ui/input/radio";
import { useCheckoutForm } from "./form";
import { useCart } from "@/hooks/useCart";

// SHIPPING SETTINGS
// false = Hide FedEx and DHL
// true  = Show FedEx and DHL
const SHOW_EXPRESS_SHIPPING = false;

// Shipping price based on order value
function calculateShippingPrice(orderTotal: number): number {
  if (orderTotal < 100) {
    return 8.95;
  }

  if (orderTotal <= 150) {
    return 14.95;
  }

  return 19.95;
}

const SHIPPING_METHODS = {
  regular: {
    name: "Regular Shipping (Tracked Airmail)",
  },
  fedex: {
    name: "FedEx",
    price: 65.0,
    image: "/images/checkout/fedex.svg",
  },
  dhl: {
    name: "DHL",
    price: 90.0,
    image: "/images/checkout/dhl.svg",
  },
};

export default function ShippingMethod() {
  const { errors, control, setValue } = useCheckoutForm();
  const { totalPrice = 0 } = useCart();

  const shippingPrice = calculateShippingPrice(totalPrice);

  // Automatically update shipping price when cart total changes
  useEffect(() => {
    if (!SHOW_EXPRESS_SHIPPING) {
      setValue("shippingMethod", {
        name: "regular",
        price: shippingPrice,
      });
    } else {
      // Update regular shipping price only when regular is selected
      // Existing express selection is preserved by the form
      // unless the customer selects regular shipping.
    }
  }, [shippingPrice, setValue]);

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div className="px-6 py-5 border-b border-gray-3">
        <h3 className="text-lg font-medium text-dark">
          Shipping Method
        </h3>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4">

          {/* REGULAR SHIPPING */}
          <Controller
            name="shippingMethod"
            control={control}
            render={({ field }) => (
              <RadioInput
                name={field.name}
                value="regular"
                label={
                  <RegularShippingCard
                    price={shippingPrice}
                  />
                }
                checked={field.value?.name === "regular"}
                onChange={() =>
                  field.onChange({
                    name: "regular",
                    price: shippingPrice,
                  })
                }
              />
            )}
          />

          {/* OPTIONAL EXPRESS SHIPPING */}
          {SHOW_EXPRESS_SHIPPING && (
            <>
              {/* FEDEX */}
              <Controller
                name="shippingMethod"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    name={field.name}
                    value="fedex"
                    label={
                      <ShippingMethodsCard method="fedex" />
                    }
                    checked={field.value?.name === "fedex"}
                    onChange={() =>
                      field.onChange({
                        name: "fedex",
                        price: SHIPPING_METHODS.fedex.price,
                      })
                    }
                  />
                )}
              />

              {/* DHL */}
              <Controller
                name="shippingMethod"
                control={control}
                render={({ field }) => (
                  <RadioInput
                    name="shippingMethod"
                    value="dhl"
                    label={
                      <ShippingMethodsCard method="dhl" />
                    }
                    checked={field.value?.name === "dhl"}
                    onChange={() =>
                      field.onChange({
                        name: "dhl",
                        price: SHIPPING_METHODS.dhl.price,
                      })
                    }
                  />
                )}
              />
            </>
          )}
        </div>

        {/* SHIPPING INFORMATION */}
        <p className="mt-4 text-sm text-gray-6">
          Shipping costs are calculated based on
          your order value.
        </p>

        {/* VALIDATION ERROR */}
        {errors.shippingMethod && (
          <p className="mt-2 text-sm text-red">
            Please select a shipping method
          </p>
        )}
      </div>
    </div>
  );
}

// REGULAR SHIPPING CARD
function RegularShippingCard({
  price,
}: {
  price: number;
}) {
  return (
    <div className="rounded-md border-[0.5px] shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2">
      <div>
        <p className="font-semibold text-dark">
          ${price.toFixed(2)}
        </p>

        <p className="text-custom-xs">
          Regular Shipping (Tracked Airmail)
        </p>
      </div>
    </div>
  );
}

// EXPRESS SHIPPING CARD
function ShippingMethodsCard({
  method,
}: {
  method: "fedex" | "dhl";
}) {
  const data = SHIPPING_METHODS[method];

  return (
    <div className="rounded-md border-[0.5px] shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2">
      <div className="flex items-center">
        <div className="pr-4">
          <Image
            src={data.image}
            alt={"Logo of " + data.name}
            width={64}
            height={18}
          />
        </div>

        <div className="pl-4 border-l border-gray-4">
          <p className="font-semibold text-dark">
            ${data.price.toFixed(2)}
          </p>

          <p className="text-custom-xs">
            Express Shipping
          </p>
        </div>
      </div>
    </div>
  );
}