"use client";
import { ModalProvider } from "../../context/QuickViewModalContext";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../../context/PreviewSliderContext";
import CartProvider from "@/components/Providers/CartProvider";
import { SessionProvider } from "next-auth/react";
import { ReduxProvider } from "@/redux/provider";


const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider>
      <SessionProvider>
        <CartProvider>
          <ModalProvider>
            <PreviewSliderProvider>
              {children}
              <CartSidebarModal />
            </PreviewSliderProvider>
          </ModalProvider>
        </CartProvider>
      </SessionProvider>
    </ReduxProvider>
  );
};

export default Providers;
