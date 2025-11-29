"use client"

import { useEffect, useState } from "react"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/app/lib/firebase"
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card"

interface Stats {
  totalProducts: number
  totalOrders: number
  totalRevenue: number
  approvedOrders: number
  approvedRevenue: number
  pendingOrders: number
  pendingRevenue: number
  loading: boolean
  error: string | null
}

export default function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    approvedOrders: 0,
    approvedRevenue: 0,
    pendingOrders: 0,
    pendingRevenue: 0,
    loading: true,
    error: null,
  })

const formatNaira = (amount: number) => {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
  }).format(amount);
};

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const productsSnapshot = await getDocs(collection(db, "products"))
        const ordersSnapshot = await getDocs(collection(db, "orders"))

        let totalRevenue = 0
        let approvedOrders = 0
        let approvedRevenue = 0
        let pendingOrders = 0
        let pendingRevenue = 0

        ordersSnapshot.forEach((doc) => {
          const order = doc.data()
          const orderTotal = order.totalAmount || 0

          totalRevenue += orderTotal

          if (order.status === "approved") {
            approvedOrders++
            approvedRevenue += orderTotal
          } else if (order.status === "pending") {
            pendingOrders++
            pendingRevenue += orderTotal
          }
        })

        setStats({
          totalProducts: productsSnapshot.size,
          totalOrders: ordersSnapshot.size,
          totalRevenue,
          approvedOrders,
          approvedRevenue,
          pendingOrders,
          pendingRevenue,
          loading: false,
          error: null,
        })
      } catch (err) {
        setStats((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to load statistics",
        }))
      }
    }

    fetchStats()
  }, [])

  if (stats.error) {
    return <div className="text-red-500 text-sm">{stats.error}</div>
  }

  const StatCard = ({
    title,
    value,
    subtitle,
    color = "blue",
  }: { title: string; value: string | number; subtitle: string; color?: string }) => (
    <Card
      className={`bg-white border-l-4 ${color === "green" ? "border-l-green-500" : color === "orange" ? "border-l-orange-500" : "border-l-blue-500"}`}
    >
      <CardHeader>
        <CardTitle className="text-gray-700 text-sm font-medium">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between">
          <div
            className={`text-4xl font-bold ${color === "green" ? "text-green-600" : color === "orange" ? "text-orange-600" : "text-blue-600"}`}
          >
            {stats.loading ? <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div> : value}
          </div>
          <div className="text-sm text-gray-500">{subtitle}</div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <StatCard title="Total Products" value={stats.totalProducts} subtitle="Products in store" />
      <StatCard title="Total Orders" value={stats.totalOrders} subtitle="Orders received" />
      <StatCard title="Total Revenue" value={`${formatNaira(stats.totalRevenue)}`} subtitle="All time" color="green" />

      <StatCard title="Approved Orders" value={stats.approvedOrders} subtitle="Completed" color="green" />
      <StatCard
        title="Approved Revenue"
        value={`${formatNaira(stats.approvedRevenue)}`}
        subtitle="From completed"
        color="green"
      />

      <StatCard title="Pending Orders" value={stats.pendingOrders} subtitle="Awaiting approval" color="orange" />
      <StatCard
        title="Pending Revenue"
        value={`${formatNaira(stats.pendingRevenue)}`}
        subtitle="Awaiting completion"
        color="orange"
      />
    </div>
  )
}
