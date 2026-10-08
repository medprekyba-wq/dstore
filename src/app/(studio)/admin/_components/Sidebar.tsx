"use client";
import Image from "next/image";
import SidebarNavMenus from "./SidebarNavMenus";
import Link from "next/link";

export default function Sidebar({
  sidebarOpen,
  headerLogo,
}: {
  sidebarOpen: boolean;
  headerLogo: string | null;
}) {
  return (
    <aside
      className={`fixed left-0 top-0 w-[290px] h-screen z-40 transform transition-transform duration-300 ease-in-out lg:translate-x-0   border-r border-gray-3 bg-white ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex flex-col h-full">
        {/* Fixed logo section */}
        <div className="z-10 p-4 bg-white sm:p-6 shrink-0 ">
          <Link href="/">
            <Image
              src={headerLogo || "/images/logo/logo.svg"}
              alt="Logo"
              width={150}
              height={36}
            />
          </Link>
        </div>

        {/* Scrollable menu section */}
        <div className="flex-1 p-4 pt-0 overflow-y-auto sm:pt-0 sm:p-6">
          <span className="block mb-3 font-normal uppercase text-gray-5">
            Menu
          </span>
          <SidebarNavMenus />
        </div>
      </div>
    </aside>
  );
}
