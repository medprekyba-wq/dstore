"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Pie } from "react-chartjs-2";
import { useState } from "react";
import cn from "@/utils/cn";

ChartJS.register(
  CategoryScale,
  LinearScale,
  LineElement,
  PointElement,
  ArcElement,
  Tooltip,
  Legend
);

interface DashboardChartProps {
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
}

const tabLabels = ["Sales", "Orders", "Revenue"];

const MonthlyAnalyticsChart = ({ chartData }: DashboardChartProps) => {
  const [activeTab, setActiveTab] = useState("Sales");

  const getTabData = () => {
    switch (activeTab) {
      case "Orders":
        return chartData.monthlyData.map((entry) => ({
          month: entry.month,
          total: entry.orders,
        }));
      case "Revenue":
        return chartData.monthlyData.map((entry) => ({
          month: entry.month,
          total: entry.revenue,
        }));
      case "Sales":
      default:
        return chartData.monthlyData.map((entry) => ({
          month: entry.month,
          total: entry.sales,
        }));
    }
  };

  const lineChartData = {
    labels: getTabData().map((entry) => entry.month),
    datasets: [
      {
        label: `${activeTab} Over Time`,
        data: getTabData().map((entry) => entry.total),
        fill: false,
        borderColor: "#3c50e0",
        backgroundColor: "#3c50e0",
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
    ],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 13 } },
      },
      y: {
        beginAtZero: true,
        grid: { color: "#f0f0f0" },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context: any) =>
            `${activeTab === "Revenue" ? "$" : ""}${context.raw.toFixed(2)}`,
        },
      },
    },
  };

  const pieChartData = {
    labels: chartData.categoryData.map((c) => c.category),
    datasets: [
      {
        label: "Best Selling Products",
        data: chartData.categoryData.map((c) => c.count),
        backgroundColor: ["#3c50e0", "#6571ff", "#b1c7ff"],
        borderWidth: 0,
      },
    ],
  };

  return (
    <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-12">
      {/* Line Chart (8 columns) */}
      <div className="p-6 bg-white border xl:col-span-8 rounded-xl border-gray-3">
        <div className="flex flex-wrap items-center justify-between mb-4">
          <h2 className="mb-4 text-base font-semibold text-dark sm:mb-0">
            Monthly Analytics
          </h2>
          <div className="flex space-x-2">
            {tabLabels.map((label) => (
              <button
                key={label}
                onClick={() => setActiveTab(label)}
                className={cn(
                  "px-4 py-1.5 text-sm rounded-lg",
                  activeTab === label
                    ? "bg-blue text-white"
                    : "bg-gray-1 text-gray-6 hover:bg-gray-2"
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="w-full h-[340px]">
          <Line data={lineChartData} options={lineOptions} />
        </div>
      </div>

      {/* Pie Chart (4 columns) */}
      <div className="w-full p-6 bg-white border xl:col-span-4 rounded-xl border-gray-3">
        <h2 className="mb-4 text-base font-semibold text-left text-dark">
          Best Selling Products
        </h2>
        <div className="flex flex-col items-center ">
          <div className="w-[220px] h-[220px]">
            <Pie data={pieChartData} />
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm text-gray-6">
            {chartData.categoryData.map((c, idx) => (
              <div key={c.category} className="flex items-center space-x-1">
                <span
                  className="inline-block w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      pieChartData.datasets[0].backgroundColor[idx],
                  }}
                ></span>
                <span>{c.category}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MonthlyAnalyticsChart;
