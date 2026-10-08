"use client";
import usePagination from "@/hooks/usePagination";
import { User } from "@prisma/client";
import { useState } from "react";
import RoleSelect from "./UserRoleSelect";
import Pagination from "@/components/Common/Pagination";

type IProps = {
  users: User[];
};
export default function UserManagementArea({ users }: IProps) {
  // State for search input
  const [searchQuery, setSearchQuery] = useState("");

  // Filter users based on search query
  const filteredUsers = users.filter(
    (user) =>
      (user.name?.toLowerCase() || "").includes(searchQuery.toLowerCase()) ||
      (user.email?.toLowerCase() || "").includes(searchQuery.toLowerCase())
  );

  // Use filtered users in pagination
  const { currentItems, handlePageClick, pageCount } = usePagination(
    filteredUsers,
    6
  );
  return (
    <div>
      <div className="flex flex-col justify-between gap-4 px-6 py-5 sm:items-center sm:flex-row">
        <h3 className="text-base font-semibold text-gray-7">User Management</h3>
        {/* Search Box */}
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="rounded-lg border placeholder:text-sm pl-11 placeholder:font-normal border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-5 duration-200 focus:ring-0"
          />
          <div className="absolute -translate-y-1/2 pointer-events-none left-3 top-1/2 text-gray-5">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M3.04297 9.37363C3.04297 5.87693 5.87833 3.04199 9.3763 3.04199C12.8743 3.04199 15.7096 5.87693 15.7096 9.37363C15.7096 12.8703 12.8743 15.7053 9.3763 15.7053C5.87833 15.7053 3.04297 12.8703 3.04297 9.37363ZM9.3763 1.54199C5.05024 1.54199 1.54297 5.04817 1.54297 9.37363C1.54297 13.6991 5.05024 17.2053 9.3763 17.2053C11.2686 17.2053 13.0042 16.5344 14.3582 15.4176L17.1783 18.238C17.4711 18.5309 17.946 18.5309 18.2389 18.238C18.5318 17.9451 18.5318 17.4703 18.239 17.1773L15.4192 14.3573C16.5377 13.0033 17.2096 11.2669 17.2096 9.37363C17.2096 5.04817 13.7024 1.54199 9.3763 1.54199Z"
                fill="currentColor"
              />
            </svg>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        {/* Users Table */}
        <table className="min-w-full">
          <thead>
            <tr className="border-y border-gray-3">
              <th className="px-6 py-3.5  font-medium text-left  text-custom-sm text-gray-6">
                Name
              </th>
              <th className="px-6 py-3.5 font-medium text-left  text-custom-sm text-gray-6">
                Email
              </th>
              <th className="px-6 py-3.5 font-medium text-left  text-custom-sm text-gray-6">
                Role
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-3">
            {currentItems.length > 0 ? (
              currentItems.map((user: User) => (
                <tr key={user.id}>
                  <td className="px-6 py-3.5  text-left text-sm font-medium text-dark">
                    {user.name}
                  </td>
                  <td className="px-6 py-3.5 text-left text-sm">
                    {user.email}
                  </td>
                  <td className="px-6 py-3.5 text-left text-sm">
                    {user.role && (
                      <RoleSelect userId={user.id} currentRole={user.role} />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={3} className="p-2 text-center">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {/* Pagination */}
        {currentItems.length > 0 && filteredUsers.length > 6 && (
          <div className="flex justify-center mt-5 pagination">
            <Pagination
              handlePageClick={handlePageClick}
              pageCount={pageCount}
            />
          </div>
        )}
      </div>
    </div>
  );
}
