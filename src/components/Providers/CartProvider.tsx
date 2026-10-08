"use client";
import React from "react";

function CartProvider({ children }: { children: React.ReactNode }) {
  // Cart state is now managed by Redux
  // This component is kept for backward compatibility
  return <>{children}</>;
}

export default CartProvider;

