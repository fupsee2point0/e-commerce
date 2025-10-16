import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ProductsTable } from "@/components/products-table"
import { Button } from "@/components/ui/button"

export default async function ProductsPage() {
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

  const { data: products, error } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(*),
      subcategories(*),
      product_images(*),
      product_variants(*)
    `,
    )
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching products:", error)
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar adminName={adminUser.name} />
      <main className="flex-1 p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Products</h1>
            <p className="text-muted-foreground">Manage your product catalog</p>
          </div>
          <Button asChild>
            <Link href="/admin_panel/products/new">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Link>
          </Button>
        </div>
        <ProductsTable products={products || []} />
      </main>
    </div>
  )
}
