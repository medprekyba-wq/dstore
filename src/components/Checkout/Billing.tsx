"use client";

import { useMemo } from "react";
import { CheckMarkIcon } from "@/assets/icons";
import { Controller, useWatch } from "react-hook-form";
import { InputGroup } from "../ui/input";
import { useCheckoutForm } from "./form";
import { useSession } from "next-auth/react";
import { Country, State } from "country-state-city";
import Select, { type StylesConfig } from "react-select";
import PhoneInput, {
  isValidPhoneNumber,
} from "react-phone-number-input";
import type { Country as PhoneCountry } from "react-phone-number-input";
import "react-phone-number-input/style.css";

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

export default function Billing() {
  const {
    register,
    control,
    setValue,
    clearErrors,
  } = useCheckoutForm();

  const { data: session } = useSession();

  // Selected billing country
  const selectedCountry = useWatch({
    control,
    name: "billing.regionName",
  });

  // Dynamic states / provinces
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

  // Phone country follows billing country
  const phoneCountry = selectedCountry
    ? (selectedCountry as PhoneCountry)
    : undefined;

  return (
    <div className="bg-white shadow-1 rounded-[10px]">
      {/* Header */}
      <div className="p-6 py-5 border-b border-gray-3">
        <h2 className="text-lg font-medium text-dark">
          Billing details
        </h2>
      </div>

      <div className="p-6 space-y-5">
        {/* First Name / Last Name */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Controller
            control={control}
            name="billing.firstName"
            rules={{
              required: "First name is required",
              validate: (value) =>
                !!value?.trim() || "First name is required",
            }}
            render={({ field, fieldState }) => (
              <InputGroup
                label="First Name"
                placeholder="John"
                required
                error={!!fieldState.error}
                errorMessage={fieldState.error?.message}
                name={field.name}
                value={field.value ?? ""}
                onChange={field.onChange}
              />
            )}
          />

          <Controller
            control={control}
            name="billing.lastName"
            rules={{
              required: "Last name is required",
              validate: (value) =>
                !!value?.trim() || "Last name is required",
            }}
            render={({ field, fieldState }) => (
              <InputGroup
                label="Last Name"
                placeholder="Doe"
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

        {/* Company Name */}
        <Controller
          control={control}
          name="billing.companyName"
          render={({ field }) => (
            <InputGroup
              label="Company Name"
              placeholder="Company name (optional)"
              name={field.name}
              value={field.value ?? ""}
              onChange={field.onChange}
            />
          )}
        />

        {/* Country / Region */}
        <div>
          <label
            htmlFor="billing-country"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Country / Region
            <span className="text-red">*</span>
          </label>

          <Controller
            control={control}
            name="billing.regionName"
            rules={{
              required: "Please select a country",
              validate: (value) =>
                countryOptions.some(
                  (country) => country.value === value
                ) || "Please select a valid country",
            }}
            render={({ field, fieldState }) => (
              <>
                <Select<SelectOption, false>
                  instanceId="billing-country"
                  inputId="billing-country"
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
                    setValue("billing.country", "", {
                      shouldDirty: true,
                      shouldValidate: false,
                    });

                    // Reset phone number for new country
                    setValue("billing.phone", "", {
                      shouldDirty: true,
                      shouldValidate: false,
                    });

                    clearErrors("billing.country");
                    clearErrors("billing.phone");
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
              htmlFor="billing-state"
              className="block mb-1.5 text-sm text-gray-6"
            >
              State / Province
              <span className="text-red">*</span>
            </label>

            <Controller
              control={control}
              name="billing.country"
              rules={{
                validate: (value) =>
                  !hasStates ||
                  stateOptions.some(
                    (state) => state.value === value
                  ) ||
                  "Please select a valid state/province",
              }}
              render={({ field, fieldState }) => (
                <>
                  <Select<SelectOption, false>
                    instanceId="billing-state"
                    inputId="billing-state"
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
            name="billing.address.street"
            rules={{
              required: "Street address is required",
              validate: (value) =>
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
              name="billing.address.apartment"
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
          name="billing.town"
          rules={{
            required: "Town/City is required",
            validate: (value) =>
              !!value?.trim() || "Town/City is required",
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
          name="billing.postcode"
          rules={{
            required: "Postal code is required",
            validate: (value) =>
              !!value?.trim() || "Postal code is required",
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
            htmlFor="billing-phone"
            className="block mb-1.5 text-sm text-gray-6"
          >
            Phone Number
            <span className="text-red">*</span>
          </label>

          <Controller
            control={control}
            name="billing.phone"
            rules={{
              required: "Phone number is required",
              validate: (value) =>
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
                    id: "billing-phone",
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
          name="billing.email"
          rules={{
            required: "Email is required",
            pattern: {
              value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              message: "Please enter a valid email address",
            },
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

        {/* Create Account */}
        {!session?.user?.email && (
          <div>
            <label
              htmlFor="create-account-checkbox"
              className="flex items-center space-x-2 text-sm cursor-pointer text-gray-6"
            >
              <input
                type="checkbox"
                {...register("billing.createAccount")}
                id="create-account-checkbox"
                className="sr-only peer"
              />

              <div className="rounded border size-4 text-white flex items-center justify-center border-gray-4 peer-checked:bg-blue peer-checked:border-blue [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100">
                <CheckMarkIcon />
              </div>

              <span>Create an Account</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}