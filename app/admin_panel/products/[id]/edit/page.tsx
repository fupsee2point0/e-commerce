import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { redirect, notFound } from "next/navigation"
import { AdminSidebar } from "@/components/admin-sidebar"
import { ProductForm } from "@/components/product-form"

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  // Fetch product with variants
  const { data: product, error } = await supabase
    .from("products")
    .select(
      `
      *,
      product_variants (*)
    `,
    )
    .eq("id", id)
    .single()

  if (error || !product) {
    notFound()
  }

  // Fetch categories and subcategories
  const { data: categories } = await supabase.from("categories").select("*").order("name")
  const { data: subcategories } = await supabase.from("subcategories").select("*").order("name")

  return (
    <div className="flex min-h-screen">
      <AdminSidebar adminName={adminUser.name} />
      <main className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Edit Product</h1>
          <p className="text-muted-foreground">Update product information</p>
        </div>
        <ProductForm categories={categories || []} subcategories={subcategories || []} initialProduct={product} />
      </main>
    </div>
  )
}
