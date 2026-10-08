"use client";

import Image from "next/image";
import { useEffect } from "react";
import { Controller } from "react-hook-form";
import { RadioInput } from "../ui/input/radio";
import { useCheckoutForm } from "./form";
import { useCart } from "@/hooks/useCart";

const FREE_SHIPPING_THRESHOLD = 100;

const SHIPPING_METHODS = {
  regular: {
    name: "Regular Shipping (Tracked Airmail)",
    price: 14.95,
  },
  fedex: {
    name: "Fedex",
    price: 65.00,
    image: "/images/checkout/fedex.svg",
  },
  dhl: {
    name: "DHL",
    price: 90.00,
    image: "/images/checkout/dhl.svg",
  },
};

export default function ShippingMethod() {
  const { errors, control, setValue } = useCheckoutForm();
  const { totalPrice = 0 } = useCart();

  const qualifiesForFreeShipping =
    totalPrice >= FREE_SHIPPING_THRESHOLD;

  useEffect(() => {
    if (qualifiesForFreeShipping) {
      setValue("shippingMethod", {
        name: "free",
        price: 0,
      });
    } else {
      setValue("shippingMethod", {
        name: "regular",
        price: SHIPPING_METHODS.regular.price,
      });
    }
  }, [qualifiesForFreeShipping, setValue]);

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      <div className="px-6 py-5 border-b border-gray-3">
        <h3 className="text-lg font-medium text-dark">
          Shipping Method
        </h3>
      </div>

      <div className="p-6">
        <div className="flex flex-col gap-4">

          {qualifiesForFreeShipping ? (
            <Controller
              name="shippingMethod"
              control={control}
              render={({ field }) => (
                <RadioInput
                  name={field.name}
                  label="Free Shipping - Tracked Airmail"
                  value="free"
                  checked={field.value?.name === "free"}
                  onChange={(e) =>
                    field.onChange({
                      name: e.currentTarget.value,
                      price: 0,
                    })
                  }
                />
              )}
            />
          ) : (
            <Controller
              name="shippingMethod"
              control={control}
              render={({ field }) => (
                <RadioInput
                  name={field.name}
                  value="regular"
                  label={<RegularShippingCard />}
                  checked={field.value?.name === "regular"}
                  onChange={(e) =>
                    field.onChange({
                      name: e.currentTarget.value,
                      price: SHIPPING_METHODS.regular.price,
                    })
                  }
                />
              )}
            />
          )}

          <Controller
            name="shippingMethod"
            control={control}
            render={({ field }) => (
              <RadioInput
                name={field.name}
                value="fedex"
                label={<ShippingMethodsCard method="fedex" />}
                checked={field.value?.name === "fedex"}
                onChange={(e) =>
                  field.onChange({
                    name: e.currentTarget.value,
                    price: SHIPPING_METHODS.fedex.price,
                  })
                }
              />
            )}
          />

          <Controller
            name="shippingMethod"
            control={control}
            render={({ field }) => (
              <RadioInput
                name={field.name}
                value="dhl"
                label={<ShippingMethodsCard method="dhl" />}
                checked={field.value?.name === "dhl"}
                onChange={(e) =>
                  field.onChange({
                    name: e.currentTarget.value,
                    price: SHIPPING_METHODS.dhl.price,
                  })
                }
              />
            )}
          />
        </div>

        {!qualifiesForFreeShipping && (
          <p className="mt-4 text-sm text-gray-6">
            Free tracked airmail shipping on orders of $100 or more.
          </p>
        )}

        {errors.shippingMethod && (
          <p className="mt-2 text-sm text-red">
            Please select a shipping method
          </p>
        )}
      </div>
    </div>
  );
}

function RegularShippingCard() {
  return (
    <div className="rounded-md border-[0.5px] shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2">
      <div>
        <p className="font-semibold text-dark">
          ${SHIPPING_METHODS.regular.price.toFixed(2)}
        </p>

        <p className="text-custom-xs">
          Regular Shipping (Tracked Airmail)
        </p>
      </div>
    </div>
  );
}

function ShippingMethodsCard({
  method,
}: {
  method: "fedex" | "dhl";
}) {
  const data = SHIPPING_METHODS;

  return (
    <div className="rounded-md border-[0.5px] shadow-1 border-gray-4 py-3.5 px-5 ease-out duration-200 hover:bg-gray-2 hover:border-transparent hover:shadow-none peer-checked:shadow-none peer-checked:border-transparent peer-checked:bg-gray-2">
      <div className="flex items-center">
        <div className="pr-4">
          <Image
            src={data[method].image}
            alt={"Logo of " + data[method].name}
            width={64}
            height={18}
          />
        </div>

        <div className="pl-4 border-l border-gray-4">
          <p className="font-semibold text-dark">
            ${data[method].price.toFixed(2)}
          </p>

          <p className="text-custom-xs">
            Standard Shipping
          </p>
        </div>
      </div>
    </div>
  );
}