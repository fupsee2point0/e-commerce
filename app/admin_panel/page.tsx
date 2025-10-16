import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardCharts } from "@/components/dashboard-charts"

export default async function AdminDashboard() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        },
      },
    },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin_panel/login")
  }

  // Check if user is admin
  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("id", user.id).single()

  if (!adminUser) {
    redirect("/admin_panel/login")
  }

  // Fetch dashboard stats
  const { count: totalProducts } = await supabase.from("products").select("*", { count: "exact", head: true })

  const { count: totalOrders } = await supabase.from("orders").select("*", { count: "exact", head: true })

  const { count: pendingOrders } = await supabase
    .from("orders")
    .select("*", { count: "exact", head: true })
    .eq("status", "pending")

  const { data: recentOrders } = await supabase
    .from("orders")
    .select("total_amount")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  const recentRevenue = recentOrders?.reduce((sum, order) => sum + order.total_amount, 0) || 0

  const { data: ordersOverTime } = await supabase
    .from("orders")
    .select("created_at, total_amount, status")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .order("created_at", { ascending: true })

  const { data: ordersByStatus } = await supabase
    .from("orders")
    .select("status")
    .gte("created_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  // Get top selling products
  const { data: topProducts } = await supabase
    .from("order_items")
    .select("product_id, quantity, products(name)")
    .limit(100)

  return (
    <div className="flex min-h-screen">
      <AdminSidebar adminName={adminUser.name} />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {adminUser.name}</p>
        </div>

        <DashboardStats
          totalProducts={totalProducts || 0}
          totalOrders={totalOrders || 0}
          pendingOrders={pendingOrders || 0}
          recentRevenue={recentRevenue}
        />

        <DashboardCharts
          ordersOverTime={ordersOverTime || []}
          ordersByStatus={ordersByStatus || []}
          topProducts={topProducts || []}
        />
      </main>
    </div>
  )
}
