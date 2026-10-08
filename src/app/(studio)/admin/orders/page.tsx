import { getOrders } from "@/get-api-data/order";
import OrderLists from "./_components/OrderLists";

export default async function OrderPage() {
  const orderData = await getOrders();
  return (
    <div className="mx-auto bg-white border rounded-2xl border-gray-3 max-w-7xl">
      <OrderLists orderData={orderData} />
    </div>
  );
}
