"use client";
import { ModalProvider } from "../context/QuickViewModalContext";
import { ReduxProvider } from "@/redux/provider";
import QuickViewModal from "@/components/Common/QuickViewModal";
import CartSidebarModal from "@/components/Common/CartSidebarModal";
import { PreviewSliderProvider } from "../context/PreviewSliderContext";
import PreviewSliderModal from "@/components/Common/PreviewSlider";
import CartProvider from "@/components/Providers/CartProvider";
import CartHydration from "@/components/Providers/CartHydration";
import { SessionProvider } from "next-auth/react";
import WishlistLoader from "@/components/Wishlist/WishlistLoader";


const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider>
      <CartHydration />
      <SessionProvider>
        <CartProvider>
          <ModalProvider>
            <PreviewSliderProvider>
              {children}
              <WishlistLoader />
              <QuickViewModal />
              <CartSidebarModal />
              <PreviewSliderModal />
            </PreviewSliderProvider>
          </ModalProvider>
        </CartProvider>
      </SessionProvider>
    </ReduxProvider>
  );
};

export default Providers;
