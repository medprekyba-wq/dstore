"use client";
import { ChevronDownIcon } from "@/assets/icons";
import { useState } from "react";
import toast from "react-hot-toast";

type Props = { userId: string; currentRole: string };
export default function RoleSelect({ userId, currentRole }: Props) {
  const [role, setRole] = useState(currentRole);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole); // Update UI instantly

    const res = await fetch("/api/user/update-role", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, role: newRole }),
    });

    const data = await res.json();
    if (data.success) {
      toast.success("User role updated successfully");
    } else {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="relative">
      <select
        value={role}
        onChange={handleChange}
        className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark-4 px-3 py-1 pr-7 duration-200 appearance-none outline-hidden focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
      >
        <option value="USER">User</option>
        <option value="ADMIN">Admin</option>
      </select>
      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-dark-4 pointer-events-none">
        <ChevronDownIcon width={12} height={12} />
      </span>
    </div>
  );
}
