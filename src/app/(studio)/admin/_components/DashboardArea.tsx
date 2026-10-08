"use client";
import dynamic from "next/dynamic";
import {
  TotalOrderIcon,
  PendingOrderIcon,
  ProcessingOrderIcon,
  DeliveredOrderIcon,
} from "./Icons";

const SalesChart = dynamic(() => import("./SalesChart"), { ssr: false });
// const CategoryPieChart = dynamic(() => import("./PieChart"), { ssr: false });

type IProps = {
  chartData: {
    monthlyData: {
      month: string;
      sales: number;
      orders: number;
      revenue: number;
    }[];
    categoryData: {
      category: string;
      count: number;
    }[];
  };
  dashboardStates: {
    totalOrders: number;
    pendingOrders: number;
    processingOrders: number;
    deliveredOrders: number;
  };
};

export default function DashboardArea({ chartData, dashboardStates }: IProps) {
  const { totalOrders, deliveredOrders, processingOrders, pendingOrders } =
    dashboardStates;

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          bgClass="bg-[#3ED97F]/10"
          label="Total order"
          value={totalOrders}
          icon={<TotalOrderIcon className="text-[#17CE64]" />}
        />
        <StatsCard
          bgClass="bg-[#FF9C55]/10"
          label="Pending Orders"
          value={pendingOrders}
          icon={<PendingOrderIcon className="text-[#F88F44]" />}
        />
        <StatsCard
          bgClass="bg-[#8155FF]/10"
          label="Processing Orders"
          value={processingOrders}
          icon={<ProcessingOrderIcon className="text-[#8155FF]" />}
        />
        <StatsCard
          bgClass="bg-[#19BFFF]/10"
          label="Delivered Orders"
          value={deliveredOrders}
          icon={<DeliveredOrderIcon className="text-[#00AAEB]" />}
        />
      </div>

      {/* Sales Chart */}
      <div>
        <SalesChart chartData={chartData} />
      </div>
    </div>
  );
}

type StatsCardProps = {
  label: string;
  value: number;
  icon: React.ReactNode;
  bgClass: string;
};

function StatsCard({ label, value, icon, bgClass }: StatsCardProps) {
  return (
    <div className="flex items-center gap-2 p-4 bg-white border border-gray-3 rounded-xl">
      <div
        className={`flex items-center justify-center w-12 h-12 mr-2 rounded-xl ${bgClass}`}
      >
        {icon}
      </div>

      <div>
        <p className="text-sm text-gray-5">{label}</p>
        <h1 className="text-2xl font-bold text-dark">{value}</h1>
      </div>
    </div>
  );
}
