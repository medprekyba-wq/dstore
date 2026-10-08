"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { DashboardIcon, LogOutIcon } from "@/components/MyAccount/icons";
import { AccountSettingIcon, UserManagementIcon } from "./Icons";
import { usePathname } from "next/navigation";

export default function DashboardHeader({
  headerLogo,
  toggleSidebar,
  user,
}: {
  headerLogo: string | null;
  toggleSidebar: () => void;
  user: any;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname(); // detect route change

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-30 px-4 py-5 bg-white border-b xm:px-8 border-gray-3">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="block lg:hidden">
            <Image
              src={headerLogo || "/images/logo/logo-icon.svg"}
              alt="Logo"
              width={100}
              height={36}
            />
          </Link>
          <h4 className="hidden text-lg font-medium text-gray-7 lg:block">
            Dashboard
          </h4>
        </div>

        <div className="flex items-center gap-5">
          <Link
            href="/"
            className=" items-center hidden sm:flex justify-center border gap-2.5 rounded-lg  px-3 h-11 py-2.5 border-gray-3"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="21"
              viewBox="0 0 20 21"
              fill="none"
            >
              <path
                d="M7.50138 14.8751C7.1562 14.8751 6.87638 15.155 6.87638 15.5001C6.87638 15.8453 7.1562 16.1251 7.50138 16.1251H12.5014C12.8466 16.1251 13.1264 15.8453 13.1264 15.5001C13.1264 15.155 12.8466 14.8751 12.5014 14.8751H7.50138Z"
                fill="#1C274C"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M10.0013 1.54199C9.39709 1.54199 8.84581 1.70792 8.24237 1.98958C7.65823 2.26223 6.98274 2.66462 6.13616 3.16893L4.92315 3.89152C3.99056 4.44705 3.24743 4.88972 2.68476 5.31303C2.10392 5.75001 1.66796 6.2 1.38386 6.79259C1.09962 7.38548 1.02259 8.00599 1.0473 8.73019C1.07122 9.43118 1.19384 10.2834 1.34761 11.3519L1.59123 13.0451C1.78906 14.42 1.94604 15.511 2.18057 16.3605C2.42233 17.2361 2.76535 17.9311 3.38434 18.4641C4.00283 18.9967 4.74284 19.2349 5.64826 19.3484C6.52759 19.4587 7.63697 19.4587 9.03656 19.4587H10.966C12.3656 19.4587 13.475 19.4587 14.3544 19.3484C15.2598 19.2349 15.9998 18.9967 16.6183 18.4641C17.2373 17.9311 17.5803 17.2361 17.822 16.3605C18.0566 15.511 18.2136 14.42 18.4114 13.0451L18.655 11.3519C18.8088 10.2834 18.9314 9.43117 18.9553 8.73019C18.98 8.00599 18.903 7.38548 18.6187 6.79259C18.3347 6.2 17.8987 5.75001 17.3178 5.31303C16.7552 4.88972 16.012 4.44705 15.0795 3.89152L13.8664 3.16893C13.0199 2.66462 12.3444 2.26223 11.7602 1.98958C11.1568 1.70792 10.6055 1.54199 10.0013 1.54199ZM6.74762 4.25967C7.62887 3.73471 8.25066 3.36517 8.77106 3.12227C9.27864 2.88535 9.6436 2.79199 10.0013 2.79199C10.359 2.79199 10.724 2.88535 11.2315 3.12227C11.7519 3.36517 12.3737 3.73471 13.255 4.25967L14.409 4.94712C15.3793 5.5251 16.064 5.93394 16.5664 6.31191C17.0567 6.68084 17.3253 6.98611 17.4916 7.33297C17.6577 7.67953 17.7268 8.07813 17.706 8.68757C17.6847 9.31244 17.5727 10.0972 17.4126 11.2095L17.1803 12.824C16.9749 14.2516 16.8281 15.2638 16.6171 16.0278C16.411 16.7744 16.1629 17.2067 15.8026 17.5169C15.4419 17.8275 14.9743 18.0109 14.1988 18.1081C13.4063 18.2075 12.3753 18.2087 10.923 18.2087H9.07958C7.62734 18.2087 6.59635 18.2075 5.8038 18.1081C5.02835 18.0109 4.56071 17.8275 4.19998 17.5169C3.83975 17.2067 3.59162 16.7744 3.38548 16.0278C3.17456 15.2638 3.02772 14.2516 2.8223 12.824L2.58999 11.2095C2.42995 10.0972 2.31789 9.31244 2.29657 8.68757C2.27577 8.07813 2.34488 7.67953 2.51102 7.33297C2.67731 6.98611 2.94586 6.68084 3.43625 6.31191C3.93865 5.93394 4.62333 5.5251 5.59359 4.94712L6.74762 4.25967Z"
                fill="currentColor"
              />
            </svg>
            <span className="hidden sm:block"> Back to home</span>
          </Link>
          <div className="relative" ref={dropdownRef}>
            {/* Dropdown Toggle */}
            <button
              className="flex items-center gap-2 focus:outline-none px-3 h-11 py-2.5 rounded-lg border border-gray-3 "
              onClick={() => setIsOpen(!isOpen)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="21"
                viewBox="0 0 20 21"
                fill="none"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.0008 1.5415C7.81464 1.5415 6.04243 3.31371 6.04243 5.49984C6.04243 7.68596 7.81464 9.45817 10.0008 9.45817C12.1869 9.45817 13.9591 7.68596 13.9591 5.49984C13.9591 3.31371 12.1869 1.5415 10.0008 1.5415ZM7.29243 5.49984C7.29243 4.00407 8.50499 2.7915 10.0008 2.7915C11.4965 2.7915 12.7091 4.00407 12.7091 5.49984C12.7091 6.99561 11.4965 8.20817 10.0008 8.20817C8.50499 8.20817 7.29243 6.99561 7.29243 5.49984Z"
                  fill="#3C50E0"
                />
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M10.0008 10.7082C8.0728 10.7082 6.29653 11.1464 4.9803 11.8868C3.68367 12.6161 2.7091 13.7216 2.7091 15.0832L2.70904 15.1681C2.7081 16.1363 2.70692 17.3515 3.77277 18.2195C4.29733 18.6466 5.03116 18.9504 6.0226 19.1511C7.01681 19.3523 8.31262 19.4582 10.0008 19.4582C11.6889 19.4582 12.9847 19.3523 13.9789 19.1511C14.9704 18.9504 15.7042 18.6466 16.2288 18.2195C17.2946 17.3515 17.2934 16.1363 17.2925 15.1681L17.2924 15.0832C17.2924 13.7216 16.3179 12.6161 15.0212 11.8868C13.705 11.1464 11.9287 10.7082 10.0008 10.7082ZM3.9591 15.0832C3.9591 14.3737 4.47691 13.6041 5.59313 12.9763C6.68976 12.3594 8.24682 11.9582 10.0008 11.9582C11.7547 11.9582 13.3118 12.3594 14.4084 12.9763C15.5246 13.6041 16.0424 14.3737 16.0424 15.0832C16.0424 16.173 16.0088 16.7865 15.4394 17.2502C15.1307 17.5016 14.6145 17.7471 13.7309 17.9259C12.8501 18.1042 11.646 18.2082 10.0008 18.2082C8.35558 18.2082 7.15138 18.1042 6.27059 17.9259C5.38703 17.7471 4.87086 17.5016 4.56209 17.2502C3.99269 16.7865 3.9591 16.173 3.9591 15.0832Z"
                  fill="#3C50E0"
                />
              </svg>

              <span className="hidden sm:block"> Account</span>
              {/* Chevron */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="25"
                viewBox="0 0 24 25"
                fill="none"
                className={`transition-transform duration-200 ${
                  isOpen ? "rotate-180" : ""
                }`}
              >
                <path
                  d="M5.75 10.125L12 16.375L18.25 10.125"
                  stroke="#495270"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Dropdown Menu */}
            {isOpen && (
              <div className="absolute right-0 z-50 p-2 mt-5 origin-top-right bg-white border rounded-lg w-52 shadow-1 border-gray-3">
                <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-3">
                  <div className="relative w-12 h-12">
                    {user?.image ? (
                      <Image
                        src={user.image}
                        alt="user"
                        fill
                        className="object-cover rounded-full size-10"
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full text-xl font-semibold text-white rounded-full bg-blue">
                        {user?.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-sm text-dark mb-0.5">
                      {user?.name}
                    </p>
                    <p className="text-custom-xs">{user?.role}</p>
                  </div>
                </div>
                <ul className="p-2 space-y-1 text-sm text-gray-700">
                  <li>
                    <Link
                      href="/admin/account-settings"
                      className="w-full flex items-center rounded-lg text-sm gap-2.5 py-2.5 px-3 ease-out hover:text-blue duration-200 hover:bg-blue/10 text-dark-2 bg-transparent"
                    >
                      <DashboardIcon /> Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/user-management"
                      className="w-full flex items-center rounded-lg text-sm gap-2.5 py-2.5 px-3 ease-out hover:text-blue duration-200 hover:bg-blue/10 text-dark-2 bg-transparent"
                    >
                      <UserManagementIcon /> User Management
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/admin/account-settings"
                      className="w-full flex items-center rounded-lg text-sm gap-2.5 py-2.5 px-3 ease-out hover:text-blue duration-200 hover:bg-blue/10 text-dark-2 bg-transparent"
                    >
                      <AccountSettingIcon /> Account Settings
                    </Link>
                  </li>
                </ul>
                <div className="p-2 border-t border-gray-3">
                  <button
                    onClick={() => signOut({ callbackUrl: "/signin" })}
                    className="w-full flex items-center rounded-md gap-2.5 py-2.5 px-3 ease-out duration-200 hover:bg-blue/10 hover:text-blue text-dark-2 bg-transparent"
                  >
                    <LogOutIcon /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
          <button onClick={toggleSidebar} className="block lg:hidden">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.75 7C20.75 7.41421 20.4142 7.75 20 7.75L4 7.75C3.58579 7.75 3.25 7.41421 3.25 7C3.25 6.58579 3.58579 6.25 4 6.25L20 6.25C20.4142 6.25 20.75 6.58579 20.75 7Z"
                fill="#1C274C"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.75 12C20.75 12.4142 20.4142 12.75 20 12.75L4 12.75C3.58579 12.75 3.25 12.4142 3.25 12C3.25 11.5858 3.58579 11.25 4 11.25L20 11.25C20.4142 11.25 20.75 11.5858 20.75 12Z"
                fill="#1C274C"
              />
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M20.75 17C20.75 17.4142 20.4142 17.75 20 17.75L4 17.75C3.58579 17.75 3.25 17.4142 3.25 17C3.25 16.5858 3.58579 16.25 4 16.25L20 16.25C20.4142 16.25 20.75 16.5858 20.75 17Z"
                fill="#1C274C"
              />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
