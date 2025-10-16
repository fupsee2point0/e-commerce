"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts"
import { useMemo } from "react"

interface Order {
  created_at: string
  total_amount: number
  status: string
}

interface OrderStatus {
  status: string
}

interface TopProduct {
  product_id: string
  quantity: number
  products: {
    name: string
  } | null
}

interface DashboardChartsProps {
  ordersOverTime: Order[]
  ordersByStatus: OrderStatus[]
  topProducts: TopProduct[]
}

const COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
]

export function DashboardCharts({ ordersOverTime, ordersByStatus, topProducts }: DashboardChartsProps) {
  // Process orders over time data - group by day
  const dailyRevenue = useMemo(() => {
    const grouped = ordersOverTime.reduce(
      (acc, order) => {
        const date = new Date(order.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
        if (!acc[date]) {
          acc[date] = { date, revenue: 0, orders: 0 }
        }
        acc[date].revenue += order.total_amount
        acc[date].orders += 1
        return acc
      },
      {} as Record<string, { date: string; revenue: number; orders: number }>,
    )
    return Object.values(grouped).slice(-14) // Last 14 days
  }, [ordersOverTime])

  // Process orders by status
  const statusData = useMemo(() => {
    const grouped = ordersByStatus.reduce(
      (acc, order) => {
        const status = order.status || "unknown"
        acc[status] = (acc[status] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(grouped).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
    }))
  }, [ordersByStatus])

  // Process top products
  const topProductsData = useMemo(() => {
    const grouped = topProducts.reduce(
      (acc, item) => {
        const name = item.products?.name || "Unknown Product"
        if (!acc[name]) {
          acc[name] = 0
        }
        acc[name] += item.quantity
        return acc
      },
      {} as Record<string, number>,
    )
    return Object.entries(grouped)
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5)
  }, [topProducts])

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {/* Revenue Over Time */}
      <Card className="col-span-2">
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
          <CardDescription>Daily revenue over the last 14 days</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              revenue: {
                label: "Revenue (৳)",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="revenue" stroke="var(--color-revenue)" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Orders by Status */}
      <Card>
        <CardHeader>
          <CardTitle>Orders by Status</CardTitle>
          <CardDescription>Distribution of order statuses</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              pending: { label: "Pending", color: "hsl(var(--chart-1))" },
              processing: { label: "Processing", color: "hsl(var(--chart-2))" },
              shipped: { label: "Shipped", color: "hsl(var(--chart-3))" },
              delivered: { label: "Delivered", color: "hsl(var(--chart-4))" },
              cancelled: { label: "Cancelled", color: "hsl(var(--chart-5))" },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <ChartTooltip content={<ChartTooltipContent />} />
              </PieChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Top Selling Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Selling Products</CardTitle>
          <CardDescription>Best performing products by quantity sold</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              quantity: {
                label: "Quantity Sold",
                color: "hsl(var(--chart-2))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProductsData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={100} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="quantity" fill="var(--color-quantity)" />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  )
}
