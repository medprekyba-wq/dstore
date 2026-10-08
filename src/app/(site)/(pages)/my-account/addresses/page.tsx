"use client";

import { useSession } from "next-auth/react";
import { BillingAddress } from "./_components/billing-address";
import { ShippingAddress } from "./_components/shipping-address";

export default function Page() {
  const { data: session } = useSession();

  return (
    <div className="">
      <div className="grid gap-6 sm:grid-cols-2">
        <ShippingAddress userId={session?.user.id} />
        <BillingAddress userId={session?.user.id} />
      </div>
    </div>
  );
}
