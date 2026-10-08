"use client";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { UserIcon } from "../MyAccount/icons";
import { CartIcon } from "@/assets/icons";

const AdminHeader = () => {
  const [stickyMenu, setStickyMenu] = useState(false);

  const { data: session } = useSession();

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
  });

  return (
    <>
      <header
        className={`fixed left-0 top-0 w-full z-30 bg-white transition-all ease-in-out duration-300 ${
          stickyMenu && "shadow-sm"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-7.5 xl:px-0">
          {/* <!-- header top start --> */}
          <div
            className={`flex flex-col lg:flex-row gap-5 items-end lg:items-center xl:justify-between ease-out duration-200 ${
              stickyMenu ? "py-4" : "py-6"
            }`}
          >
            {/* <!-- header top left --> */}
            <div className="flex flex-col w-full gap-5 xl:w-auto sm:flex-row sm:justify-between sm:items-center sm:gap-10">
              <Link className="shrink-0" href="/">
                <Image
                  src="/images/logo/logo.svg"
                  alt="Logo"
                  width={219}
                  height={36}
                  style={{ width: "auto", height: "auto" }}
                />
              </Link>
            </div>

            {/* <!-- header top right --> */}
            <div className="flex w-full lg:w-auto items-center gap-7.5">
              <div className="flex items-center justify-between w-full gap-5 lg:w-auto">
                <div>
                  <Link href="/" className="border rounded-lg border-gray-3">
                    <CartIcon />
                  </Link>
                </div>
                <div className="flex items-center gap-5">
                  <Link href={"/admin"} className="flex items-center gap-2.5">
                    <UserIcon className="fill-blue" />

                    <div className="group">
                      <span className="block uppercase text-2xs text-dark-4">
                        account
                      </span>

                      <p className="font-medium text-custom-sm text-dark hover:text-blue">
                        {session?.user.name?.split(" ")[0] || "Sign In"}
                      </p>
                    </div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          {/* <!-- header top end --> */}
        </div>
      </header>
    </>
  );
};

export default AdminHeader;
