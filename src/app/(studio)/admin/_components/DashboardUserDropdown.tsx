"use client";
import React, { useEffect, useRef, useState } from "react";
import { authOptions } from "@/lib/auth";
import { getSingleUser } from "@/get-api-data/user";
import { getServerSession } from "next-auth";
import Image from "next/image";
import { signOut } from "next-auth/react";

export default function DashboardUserDropdown() {
  const [user, setUser] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch user in useEffect
  useEffect(() => {
    async function fetchUser() {  
      const session = await getServerSession(authOptions);
      const fetchedUser = await getSingleUser(session?.user?.email as string);
      setUser(fetchedUser);
    }
    fetchUser();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return null; // Or loading spinner
  }
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Dropdown Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus:outline-none"
      >
        <div className="relative w-12 h-12">
          {user?.image ? (
            <Image
              src={user.image}
              alt="user"
              fill
              className="object-cover rounded-full"
            />
          ) : (
            <div className="flex items-center justify-center w-full h-full text-xl font-semibold text-white rounded-full bg-blue">
              {user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
        <div className="text-left">
          <p className="font-medium text-dark mb-0.5">{user?.name}</p>
          <p className="text-custom-xs">{user?.role}</p>
        </div>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="25"
          viewBox="0 0 24 25"
          fill="none"
          className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
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
        <div className="absolute right-0 z-20 w-48 mt-2 bg-white rounded-md shadow-lg ring-1 ring-gray-200">
          <ul className="py-2 text-sm text-gray-700">
            <li>
              <a href="/profile" className="block px-4 py-2 hover:bg-gray-100">
                Profile
              </a>
            </li>
            <li>
              <a href="/settings" className="block px-4 py-2 hover:bg-gray-100">
                Settings
              </a>
            </li>
            <li>
              <button
                onClick={() => signOut({ callbackUrl: "/signin" })}
                className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              >
                Logout
              </button>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
}
