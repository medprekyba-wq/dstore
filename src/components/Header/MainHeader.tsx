"use client";

import { useCart } from "@/hooks/useCart";
import { useAppSelector } from "@/redux/store";
import { HeaderSetting } from "@prisma/client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import GlobalSearchModal from "../Common/GlobalSearch";
import DesktopMenu from "./DesktopMenu";
import {
  CartIcon,
  CloseIcon,
  HeartIcon,
  MenuIcon,
  SearchIcon,
  UserIcon,
} from "./icons";
import { menuData } from "./menuData";
import MobileMenu from "./MobileMenu";

type IProps = {
  headerData?: HeaderSetting | null;
};

const MainHeader = ({ headerData }: IProps) => {
  const [hasMounted, setHasMounted] = useState(false);
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  const { data: session } = useSession();
  const { handleCartClick, cartCount, totalPrice } = useCart();
  const wishlistCount = useAppSelector((state) => state.wishlistReducer).items
    ?.length;

  const handleOpenCartModal = () => {
    handleCartClick();
  };

  // Sticky menu
  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1280) {
        setNavigationOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <>
      <header
        className={`fixed left-0 bg-white top-0 w-full z-50 transition-all  ease-in-out duration-300 ${stickyMenu && "shadow-sm"
          }`}
      >
        {/* Topbar */}
        <div className="bg-dark py-2.5">
          <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0">
            <div className="flex justify-between">
              <div className="hidden lg:block">
                <p className="text-sm font-medium text-white">
                  {headerData?.headerText ||
                    "Get free delivery on orders over $100"}
                </p>
              </div>
              <div className="flex divide-x divide-white/20">
                {hasMounted && session?.user ? (
                  <p className="pr-3 text-sm font-medium text-white transition cursor-pointer hover:text-blue-300">
                    {headerData?.headerTextTwo || "Welcome Back"}{" "}
                    {session?.user.name?.split(" ")[0]}
                  </p>
                ) : (
                  <Link
                    href="/signup"
                    className="pr-3 text-sm font-medium text-white transition hover:text-blue-300"
                  >
                    Create an account
                  </Link>
                )}
                {hasMounted ? (
                  <Link
                    href={
                      session?.user?.role === "ADMIN"
                        ? "/admin/dashboard"
                        : session?.user?.role === "USER"
                          ? "/my-account"
                          : "/signin"
                    }
                    className="pl-3 text-sm font-medium text-white transition hover:text-blue-300"
                  >
                    {session?.user?.name?.split(" ")[0] || "Sign In"}
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    className="pl-3 text-sm font-medium text-white transition hover:text-blue-300"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Header */}
        <div className="px-4 mx-auto max-w-7xl sm:px-6 xl:px-0 b ">
          <div className="flex items-center justify-between py-4 xl:py-0">
            {/* Logo */}
            <div>
              <Link className="block shrink-0" href="/">
                <Image
                  src={headerData?.headerLogo || "/images/logo/logo.svg"}
                  alt="Logo"
                  width={148}
                  height={36}
                  style={{ width: "auto", height: "auto" }}
                  priority
                />
              </Link>
            </div>

            {/* Desktop Menu - Hidden on mobile */}
            <div className="hidden xl:block">
              <Suspense fallback={<div className="h-20 bg-white" />}>
                <DesktopMenu menuData={menuData} stickyMenu={stickyMenu} />
              </Suspense>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                className="transition hover:text-blue focus:outline-none"
                onClick={() => setSearchModalOpen(true)}
                aria-label="Search"
              >
                <SearchIcon />
              </button>

              <Link
                href={
                  hasMounted && session?.user
                    ? session?.user?.role === "ADMIN"
                      ? "/admin/dashboard"
                      : session?.user?.role === "USER"
                        ? "/my-account"
                        : "/signin"
                    : "/signin"
                }
                className="transition hover:text-blue focus:outline-none"
                aria-label="Account"
              >
                <UserIcon />
              </Link>

              <Link
                href="/wishlist"
                className="relative hidden text-gray-700 transition sm:block hover:text-blue focus:outline-none"
                aria-label="Wishlist"
              >
                <HeartIcon />
                <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] text-white bg-red-600 text-[10px] font-normal rounded-full inline-flex items-center justify-center">
                  {hasMounted ? wishlistCount : 0}
                </span>
              </Link>

              <button
                className="relative text-gray-700 transition hover:text-blue focus:outline-none"
                onClick={handleOpenCartModal}
                aria-label="Cart"
              >
                <CartIcon />
                <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] text-white bg-red-600 text-[10px] font-normal rounded-full inline-flex items-center justify-center">
                  {hasMounted ? cartCount || 0 : 0}
                </span>
              </button>

              {/* Mobile Menu Toggle */}
              <button
                className="transition xl:hidden focus:outline-none"
                onClick={() => setNavigationOpen(!navigationOpen)}
                aria-label={navigationOpen ? "Close menu" : "Open menu"}
              >
                {navigationOpen ? <CloseIcon /> : <MenuIcon />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu - Offcanvas */}

      <MobileMenu
        headerLogo={headerData?.headerLogo || null}
        isOpen={navigationOpen}
        onClose={() => setNavigationOpen(false)}
        menuData={menuData}
      />

      {/* Search Modal Placeholder */}
      {searchModalOpen && (
        <GlobalSearchModal
          searchModalOpen={searchModalOpen}
          setSearchModalOpen={setSearchModalOpen}
        />
      )}
    </>
  );
};

export default MainHeader;
