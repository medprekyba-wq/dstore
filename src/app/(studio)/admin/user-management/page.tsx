import { getUsers } from "@/get-api-data/user";
import UserManagementArea from "./_components/UserManagementArea";

export default async function UserManagementPage() {
  const users = await getUsers();
  return (
    <div className="w-full max-w-4xl mx-auto bg-white rounded-xl shadow-1">
      {/* user management area */}
      <UserManagementArea users={users} />
    </div>
  );
}
