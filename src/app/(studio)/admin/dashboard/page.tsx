import {
  getDashboardChartData,
  getDashboardOrdersStatus,
  getRecentOrders,
} from "@/get-api-data/dashboard";
import { cacheLife } from 'next/cache';
import DashboardArea from "../_components/DashboardArea";
import RecentOrders from "../_components/RecentOrders";

async function getCachedOrdersStatus() {
  'use cache'
  cacheLife('seconds')
  return getDashboardOrdersStatus()
}

async function getCachedChartData() {
  'use cache'
  cacheLife('minutes')
  return getDashboardChartData()
}

async function getCachedRecentOrders() {
  'use cache'
  cacheLife('seconds')
  return getRecentOrders()
}

export default async function DashboardPage() {
  const [dashboardStates, dashboardChartData, recentOrdersData] =
    await Promise.all([
      getCachedOrdersStatus(),
      getCachedChartData(),
      getCachedRecentOrders(),
    ])

  return (
    <>
      <DashboardArea chartData={dashboardChartData} dashboardStates={dashboardStates} />
      <RecentOrders orders={recentOrdersData} />
    </>
  )
}