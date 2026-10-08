"use client";
import { Pie } from "react-chartjs-2";
import Chart from "chart.js/auto";
import { ArcElement, Tooltip, Legend } from "chart.js";
import dynamic from "next/dynamic";

// Register necessary Chart.js components for Pie chart
Chart.register(ArcElement, Tooltip, Legend);

interface CategoryData {
  category: string;
  totalSales: number | unknown;
}

const CategoryPieChart = ({categoryData}:{categoryData:CategoryData[]}) => {

  // Prepare data for the pie chart
  const chartData = {
    labels: categoryData.map((entry) => entry.category), // Category names
    datasets: [
      {
        label: "Sales by Category ($)",
        data: categoryData.map((entry) => entry.totalSales), // Sales amounts
        backgroundColor: [
          "#3c50e0", // Green
          "#F97316", // Orange
          "#3B82F6", // Blue
          "#EF4444", // Red
          "#8B5CF6", // Purple
          "#EC4899", // Pink
        ],
        borderWidth: 1,
      },
    ],
  };

  // Chart options
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: false,
      },
    },
  };


  return (
    <div>
      <h2 className="text-lg font-medium text-dark mb-4">Most Selling Category</h2>
      <Pie data={chartData} options={options} height={150} />
    </div>
  );
};

export default dynamic(() => Promise.resolve(CategoryPieChart), { ssr: false });