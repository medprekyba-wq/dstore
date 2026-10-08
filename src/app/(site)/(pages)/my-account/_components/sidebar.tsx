"use client";

import {
  BasketIcon,
  DashboardIcon,
  HomeIcon,
  LogOutIcon,
  StarOutlineIcon,
  UserIcon,
} from "@/components/MyAccount/icons";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import NextLink from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const { data: session } = useSession();

  return (
    <div className="w-full lg:col-span-3">
      <div className="bg-white  rounded-xl shadow-1">
        <div className="flex items-center gap-5 p-4 border-b border-gray-3">
          <div className="overflow-hidden rounded-full">
            <Image
              src={session?.user?.image || "/images/avatar.jpeg"}
              alt="user"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <div className="flex-1">
            <p className="font-medium text-dark mb-0.5">
              {session?.user?.name}
            </p>
            <p className="text-custom-xs">Member Since Sep 2020</p>
          </div>
        </div>

        <div className="p-4 xl:p-6">
          <div className="flex flex-wrap gap-4 xl:flex-nowrap xl:flex-col">
            <Link href="/my-account">
              <DashboardIcon />
              Dashboard
            </Link>

            <Link href="/my-account/orders">
              <BasketIcon />
              Orders
            </Link>

            <Link href="/my-account/my-reviews">
              <StarOutlineIcon />
              My Review
            </Link>

            <Link href="/my-account/addresses">
              <HomeIcon />
              Addresses
            </Link>

            <Link href="/my-account/account-details">
              <UserIcon />
              Account Setting
            </Link>

            <button
              onClick={() =>
                signOut({
                  callbackUrl: "/signin",
                })
              }
              className="flex items-center rounded-md gap-2.5 py-3 px-4.5 ease-out duration-200 hover:bg-blue hover:text-white text-dark-2 bg-gray-1"
            >
              <LogOutIcon />
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Link({ children, href }: { children: React.ReactNode; href: string }) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <NextLink
      href={href}
      className="flex items-center rounded-lg gap-2.5 py-3 px-4 text-sm ease-out duration-200 hover:bg-blue-light-5 hover:text-blue text-dark-2 bg-gray-1 data-[active=true]:bg-blue-light-5 data-[active=true]:text-blue"
      data-active={isActive}
    >
      {children}
    </NextLink>
  );
}
