"use client";

import { useEffect, useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useSession } from "next-auth/react";
import { Country, State } from "country-state-city";
import Select, { type StylesConfig } from "react-select";
import PhoneInput, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import type { Country as PhoneCountry } from "react-phone-number-input";
import "react-phone-number-input/style.css";

import { InputGroup } from "../ui/input";
import { useCheckoutForm } from "./form";
import { ChevronDown } from "./icons";

type SelectOption = {
  value: string;
  label: string;
};

const selectStyles: StylesConfig<SelectOption, false> = {
  control: (base, state) => ({
    ...base,
    minHeight: "44px",
    borderRadius: "8px",
    borderColor: state.isFocused ? "#3C50E0" : "#E5E7EB",
    boxShadow: "none",
    fontSize: "14px",
    "&:hover": {
      borderColor: "#3C50E0",
    },
  }),

  placeholder: (base) => ({
    ...base,
    color: "#6B7280",
    fontSize: "14px",
  }),

  singleValue: (base) => ({
    ...base,
    color: "#111827",
    fontSize: "14px",
  }),

  input: (base) => ({
    ...base,
    color: "#111827",
    fontSize: "14px",
  }),

  menu: (base) => ({
    ...base,
    zIndex: 50,
  }),
};

const countryOptions: SelectOption[] =
  Country.getAllCountries().map((country) => ({
    value: country.isoCode,
    label: country.name,
  }));

export default function Shipping() {
  const {
    control,
    setValue,
    clearErrors,
    watch,
  } = useCheckoutForm();

  const { data: session } = useSession();

  const shipToDifferentAddress = useWatch({
    control,
    name: "shipToDifferentAddress",
  });

  const selectedCountry = useWatch({
    control,
    name: "shipping.countryName",
  });

  // Populate the shipping email for registered users.
  // Do not overwrite an email already entered by the customer.
  useEffect(() => {
    const userEmail = session?.user?.email;

    if (!userEmail || !shipToDifferentAddress) return;

    const currentEmail = watch("shipping.email");

    if (!currentEmail?.trim()) {
      setValue("shipping.email", userEmail, {
        shouldDirty: false,
        shouldValidate: false,
      });
    }
  }, [
    session?.user?.email,
    shipToDifferentAddress,
    setValue,
    watch,
  ]);

  // State / province options depend on the shipping country
  const stateOptions = useMemo<SelectOption[]>(() => {
    if (!selectedCountry) return [];

    return State.getStatesOfCountry(selectedCountry).map(
      (state) => ({
        value: state.isoCode,
        label: state.name,
      })
    );
  }, [selectedCountry]);

  const hasStates = stateOptions.length > 0;

  // Automatically match the phone country
  const phoneCountry = selectedCountry
    ? (selectedCountry as PhoneCountry)
    : undefined;

  const toggleShipping = () => {
    const nextValue = !shipToDifferentAddress;

    setValue("shipToDifferentAddress", nextValue, {
      shouldDirty: true,
      shouldValidate: true,
    });

    if (!nextValue) {
      clearErrors("shipping");
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] break-inside-avoid">
      {/* Shipping toggle */}
      <button
        type="button"
        onClick={toggleShipping}
        aria-expanded={!!shipToDifferentAddress}
        className="w-full cursor-pointer flex items-center justify-between gap-2.5 font-medium text-lg text-dark py-5 px-6 text-left"
      >
        <span>Ship to a different address?</span>

        <ChevronDown
          className={`fill-current ease-out duration-200 ${
            shipToDifferentAddress ? "rotate-180" : ""
          }`}
          aria-hidden
        />
      </button>

      {shipToDifferentAddress && (
        <div className="p-6 border-t border-gray-3 space-y-5">
          {/* Country / Region */}
          <div>
            <label
              htmlFor="shipping-country"
              className="block mb-1.5 text-sm text-gray-6"
            >
              Country / Region
              <span className="text-red">*</span>
            </label>

            <Controller
              control={control}
              name="shipping.countryName"
              rules={{
                validate: (value) =>
                  !shipToDifferentAddress ||
                  countryOptions.some(
                    (country) => country.value === value
                  ) ||
                  "Please select a valid country",
              }}
              render={({ field, fieldState }) => (
                <>
                  <Select<SelectOption, false>
                    instanceId="shipping-country"
                    inputId="shipping-country"
                    classNamePrefix="checkout-select"
                    options={countryOptions}
                    value={
                      countryOptions.find(
                        (country) =>
                          country.value === field.value
                      ) ?? null
                    }
                    onChange={(option) => {
                      const countryCode = option?.value ?? "";

                      field.onChange(countryCode);

                      // Reset state / province
                      setValue("shipping.country", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });

                      // Reset phone number for new country
                      setValue("shipping.phone", "", {
                        shouldDirty: true,
                        shouldValidate: false,
                      });

                      clearErrors("shipping.country");
                      clearErrors("shipping.phone");
                    }}
                    onBlur={field.onBlur}
                    placeholder="Select your country"
                    isSearchable
                    isClearable
                    styles={selectStyles}
                  />

                  {fieldState.error && (
                    <p className="text-sm text-red mt-1.5">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* State / Province */}
          {hasStates && (
            <div>
              <label
                htmlFor="shipping-state"
                className="block mb-1.5 text-sm text-gray-6"
              >
                State / Province
                <span className="text-red">*</span>
              </label>

              <Controller
                control={control}
                name="shipping.country"
                rules={{
                  validate: (value) =>
                    !shipToDifferentAddress ||
                    !hasStates ||
                    stateOptions.some(
                      (state) => state.value === value
                    ) ||
                    "Please select a valid state/province",
                }}
                render={({ field, fieldState }) => (
                  <>
                    <Select<SelectOption, false>
                      instanceId="shipping-state"
                      inputId="shipping-state"
                      classNamePrefix="checkout-select"
                      options={stateOptions}
                      value={
                        stateOptions.find(
                          (state) =>
                            state.value === field.value
                        ) ?? null
                      }
                      onChange={(option) =>
                        field.onChange(option?.value ?? "")
                      }
                      onBlur={field.onBlur}
                      placeholder="Select state / province"
                      isSearchable
                      isClearable
                      styles={selectStyles}
                    />

                    {fieldState.error && (
                      <p className="text-sm text-red mt-1.5">
                        {fieldState.error.message}
                      </p>
                    )}
                  </>
                )}
              />
            </div>
          )}

          {/* Street Address */}
          <div>
            <Controller
              control={control}
              name="shipping.address.street"
              rules={{
                validate: (value) =>
                  !shipToDifferentAddress ||
                  !!value?.trim() ||
                  "Street address is required",
              }}
              render={({ field, fieldState }) => (
                <InputGroup
                  label="Street Address"
                  placeholder="House number and street name"
                  required
                  error={!!fieldState.error}
                  errorMessage={fieldState.error?.message}
                  name={field.name}
                  value={field.value ?? ""}
                  onChange={field.onChange}
                />
              )}
            />

            {/* Apartment / Suite */}
            <div className="mt-5">
              <Controller
                control={control}
                name="shipping.address.apartment"
                render={({ field }) => (
                  <InputGroup
                    label="Apartment / Suite (optional)"
                    placeholder="Apartment, suite, unit, etc."
                    name={field.name}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </div>

          {/* Town / City */}
          <Controller
            control={control}
            name="shipping.town"
            rules={{
              validate: (value) =>
                !shipToDifferentAddress ||
                !!value?.trim() ||
                "Town / City is required",
            }}
            render={({ field, fieldState }) => (
              <InputGroup
                label="Town / City"
                placeholder="Enter your city"
                required
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />

          {/* Postal / ZIP Code */}
          <Controller
            control={control}
            name="shipping.postcode"
            rules={{
              validate: (value) =>
                !shipToDifferentAddress ||
                !!value?.trim() ||
                "Postal code is required",
            }}
            render={({ field, fieldState }) => (
              <InputGroup
                label="Postal / ZIP Code"
                placeholder="Postal / ZIP code"
                required
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />

          {/* Phone Number */}
          <div>
            <label
              htmlFor="shipping-phone"
              className="block mb-1.5 text-sm text-gray-6"
            >
              Phone Number
              <span className="text-red">*</span>
            </label>

            <Controller
              control={control}
              name="shipping.phone"
              rules={{
                validate: (value) =>
                  !shipToDifferentAddress ||
                  (value && isValidPhoneNumber(value)) ||
                  "Please enter a valid phone number",
              }}
              render={({ field, fieldState }) => (
                <>
                  <PhoneInput
                    key={selectedCountry || "default"}
                    international
                    defaultCountry={phoneCountry}
                    withCountryCallingCode
                    countryCallingCodeEditable={false}
                    value={field.value || undefined}
                    onChange={(value) =>
                      field.onChange(value ?? "")
                    }
                    onBlur={field.onBlur}
                    numberInputProps={{
                      id: "shipping-phone",
                      name: field.name,
                      "aria-label": "Phone Number",
                      placeholder: "Phone number",
                    }}
                    className="
                      checkout-phone
                      rounded-lg border border-gray-3
                      h-11 px-4 text-sm
                      focus-within:border-blue
                      [&_.PhoneInputInput]:border-0
                      [&_.PhoneInputInput]:outline-none
                      [&_.PhoneInputInput]:ring-0
                      [&_.PhoneInputInput]:shadow-none
                      [&_.PhoneInputInput]:bg-transparent
                      [&_.PhoneInputInput]:text-sm
                      [&_.PhoneInputInput:focus]:outline-none
                      [&_.PhoneInputInput:focus]:ring-0
                    "
                  />

                  {fieldState.error && (
                    <p className="text-sm text-red mt-1.5">
                      {fieldState.error.message}
                    </p>
                  )}
                </>
              )}
            />
          </div>

          {/* Email Address */}
          <Controller
            control={control}
            name="shipping.email"
            rules={{
              validate: (value) =>
                !shipToDifferentAddress ||
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                  value || ""
                ) ||
                "Please enter a valid email address",
            }}
            render={({ field, fieldState }) => (
              <InputGroup
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                required
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />
        </div>
      )}
    </div>
  );
}