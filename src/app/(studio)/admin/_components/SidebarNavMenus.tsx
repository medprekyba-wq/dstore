"use client";

import type React from "react";
import NextLink from "next/link";
import { useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  AccountSettingIcon,
  CategoryIcon,
  CouponIcon,
  HeroBannerIcon,
  OrdersIcon,
  PostIcon,
  ProductIcon,
  ReviewIcon,
  UserManagementIcon,
} from "./Icons";
import { DashboardIcon } from "@/components/MyAccount/icons";
import { ChevronDownIcon } from "@/assets/icons";

const sidebarMenuData = [
  {
    title: "Dashboard",
    icon: <DashboardIcon />,
    href: "/admin/dashboard",
  },
  {
    title: "Orders",
    href: "/admin/orders",
    icon: <OrdersIcon />,
  },
  {
    title: "Customers",
    href: "/admin/customers",
    icon: <UserManagementIcon />,
  },
  {
    title: "Products",
    icon: <ProductIcon />,
    children: [
      {
        title: "All Products",
        href: "/admin/products",
      },
      {
        title: "Add Product",
        href: "/admin/add-product",
      },
    ],
  },
  {
    title: "Categories",
    icon: <CategoryIcon />,
    children: [
      {
        title: "All Categories",
        href: "/admin/categories",
      },
      {
        title: "Add Category",
        href: "/admin/add-category",
      },
    ],
  },

  {
    title: "Coupons",
    href: "/admin/coupons",
    icon: <CouponIcon />,
  },

  {
    title: "Reviews",
    href: "/admin/reviews",
    icon: <ReviewIcon />,
  },
  {
    title: "Settings",
    icon: <AccountSettingIcon />,
    children: [
      {
        title: "Account Settings",
        href: "/admin/account-settings",
      },
      {
        title: "User Management",
        href: "/admin/user-management",
      },
    ],
  },
  {
    title: "Customization",
    icon: <HeroBannerIcon />,
    children: [
      {
        title: "SEO Settings",
        href: "/admin/seo-settings",
      },
      {
        title: "Header Settings",
        href: "/admin/header-settings",
      },
      {
        title: "Hero Banner",
        href: "/admin/hero-banner",
      },
      {
        title: "Hero Slider",
        href: "/admin/hero-slider",
      },
      {
        title: "Countdown",
        href: "/admin/countdown",
      },
      {
        title: "Privacy Policy",
        href: "/admin/privacy-policy",
      },
      {
        title: "Terms & Conditions",
        href: "/admin/terms-conditions",
      },
      {
        title: "Testimonials",
        href: "/admin/testimonials",
      },
    ],
  },

  {
    title: "Blog",
    icon: <PostIcon />,
    children: [
      {
        title: "Posts",
        href: "/admin/posts",
      },
      {
        title: "Post Authors",
        href: "/admin/post-authors",
      },
      {
        title: "Post Categories",
        href: "/admin/post-categories",
      },
    ],
  },
];

export default function SidebarNavMenus() {
  const session = useSession();
  const userRole = session?.data?.user?.role;
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});

  const toggleMenu = (title: string) => {
    setOpenMenus((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  return (
    <div className="flex flex-col gap-2">
      {sidebarMenuData
        .filter((item) => {
          if (!userRole) return false;

          const managerRestricted = [
            "User Management",
            "Account Settings",
            "Coupon",
            "Countdown",
            "Hero Banner",
            "Hero Slider",
            "Blog Authors",
            "Blog Category",
          ];

          if (userRole === "MANAGER") {
            if (managerRestricted.includes(item.title)) return false;
            if (
              item.children &&
              item.children.every((child) =>
                managerRestricted.includes(child.title)
              )
            )
              return false;
          }

          return true;
        })
        .map((item, index) => {
          const isSubmenuOpen = openMenus[item.title] || false;
          const hasChildren = Array.isArray(item.children);
          const isActive =
            (item.href &&
              (pathname === item.href ||
                (item.href !== "/admin/dashboard" &&
                  pathname.startsWith(`${item.href}/`)))) ||
            (hasChildren &&
              item.children?.some(
                (child) =>
                  pathname === child.href ||
                  pathname.startsWith(`${child.href}/`)
              ));

          return (
            <div key={index} className="flex flex-col gap-1">
              {hasChildren ? (
                <button
                  type="button"
                  onClick={() => toggleMenu(item.title)}
                  className={`flex items-center justify-between w-full font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm text-left hover:bg-blue/10 hover:text-blue text-dark-2 ${
                    isActive ? "bg-blue/10 text-blue" : "bg-transparent"
                  }`}
                >
                  <span className="flex items-center gap-2.5">
                    {item.icon}
                    {item.title}
                  </span>
                  <ChevronDownIcon
                    className={` transform transition-transform ${
                      isSubmenuOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
              ) : (
                <Link href={item.href!}>
                  {item.icon}
                  {item.title}
                </Link>
              )}

              {/* Submenu */}
              {hasChildren && isSubmenuOpen && item.children && (
                <div className="flex flex-col gap-1 mt-1 ml-6">
                  {item.children.map((child, i) => (
                    <Link key={i} href={child.href}>
                      {child.title}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          );
        })}
    </div>
  );
}

/* 🔥 Sidebar Link Component */
function Link({
  children,
  href,
  className = "",
}: {
  children: React.ReactNode;
  href: string;
  className?: string;
}) {
  const pathname = usePathname();

  // Special case for dashboard to prevent it from being active for all routes
  const isDashboard = href === "/admin/dashboard";

  // For dashboard, only be active if the path is exactly "/admin/dashboard"
  // For other routes, check if the current path is exactly the href or starts with href/
  const isActive = isDashboard
    ? pathname === href
    : pathname.includes(`${href}`);

  return (
    <NextLink
      href={href}
      className={`flex items-center font-normal rounded-lg gap-2.5 py-2.5 px-3 text-sm ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent data-[active=true]:bg-blue/10 data-[active=true]:text-blue ${className}`}
      data-active={isActive}
    >
      {children}
    </NextLink>
  );
}
