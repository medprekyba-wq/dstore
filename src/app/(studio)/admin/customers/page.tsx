import { getUsers } from "@/get-api-data/user";
import CustomerArea from "./_components/CustomerArea";

export default async function CustomerPage() {
   const users = await getUsers();
  return (
    <div className="w-full mx-auto bg-white border max-w-7xl rounded-xl shadow-1 border-gray-3 overflow-x-auto">
      <div className="flex items-center justify-between px-6 py-5 border-b border-gray-3">
        <h2 className="text-base font-semibold text-dark">Customers</h2>
      </div>
      <div>
        <CustomerArea users={users} />
      </div>
    </div>
  );
}
