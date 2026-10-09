import { createContext, useContext } from "react";
import type { ReactNode } from "react";

import type {
  Control,
  FieldErrors,
  UseFormHandleSubmit,
  UseFormRegister,
  UseFormSetValue,
  UseFormWatch,
  UseFormClearErrors,
} from "react-hook-form";

export type CheckoutInput = {
  // Billing information
  billing: {
    firstName: string;
    lastName?: string;
    companyName?: string;

    // Country ISO code: LT, US, GB, etc.
    regionName: string;

    // State / Province ISO code: CA, NY, etc.
    country?: string;

    address: {
      street: string;
      apartment?: string;
    };

    town: string;

    // Postal / ZIP code
    postcode: string;

    phone: string;
    email: string;
    createAccount?: boolean;
  };

  // Ship to a different address
  shipToDifferentAddress: boolean;

  // Shipping information
  // Required fields are validated when
  // shipToDifferentAddress is true.
  shipping?: {
    // Country ISO code
    countryName: string;

    // State / Province ISO code
    country?: string;

    address: {
      street: string;
      apartment?: string;
    };

    town: string;

    // Postal / ZIP code
    postcode: string;

    phone: string;
    email: string;
  };

  // Shipping method
  shippingMethod: {
    name: string;
    price: number;
  };

  // Payment method
  paymentMethod: string;

  // Additional order information
  notes?: string;

  // Coupon information
  couponDiscount?: number;
  couponCode?: string;

  // Cart products
  products: {
    id: string;
    price: number;
    quantity: number;
  }[];
};

type FormContextType = {
  register: UseFormRegister<CheckoutInput>;
  errors: FieldErrors<CheckoutInput>;
  watch: UseFormWatch<CheckoutInput>;
  control: Control<CheckoutInput>;
  setValue: UseFormSetValue<CheckoutInput>;
  clearErrors: UseFormClearErrors<CheckoutInput>;
  handleSubmit: UseFormHandleSubmit<CheckoutInput>;
};

const FormContext = createContext<FormContextType | null>(
  null
);

type PropsType = {
  children: ReactNode;
  value: FormContextType;
};

export function CheckoutFormProvider({
  children,
  value,
}: PropsType) {
  return (
    <FormContext.Provider value={value}>
      {children}
    </FormContext.Provider>
  );
}

export function useCheckoutForm(): FormContextType {
  const formContext = useContext(FormContext);

  if (!formContext) {
    throw new Error(
      "useCheckoutForm must be used within a CheckoutFormProvider"
    );
  }

  return formContext;
}