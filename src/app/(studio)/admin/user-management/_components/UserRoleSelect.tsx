"use client";
import { useState } from "react";
import toast from "react-hot-toast";


enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
}

type Props = { userId: string; currentRole: string };
export default function RoleSelect({ userId, currentRole }: Props) {
  const [role, setRole] = useState(
    UserRole[currentRole as keyof typeof UserRole]
  );

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newRole = e.target.value;
    setRole(newRole as UserRole); // Update UI instantly

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
    <div className="relative max-w-40">
      <select
        value={role}
        onChange={handleChange}
        className="rounded-lg border placeholder:text-sm placeholder:font-normal text-sm   border-gray-3 h-11  focus:border-blue focus:outline-0  placeholder:text-dark-5 w-full  py-2.5 px-5 duration-200 pl-3 focus:ring-0 "
      >
        <option value={UserRole.USER}>User</option>
        <option value={UserRole.ADMIN}>Admin</option>
        <option value={UserRole.MANAGER}>Manager</option>
      </select>
    </div>
  );
}
