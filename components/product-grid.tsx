import { createClient } from "@/lib/supabase/server"
import type { ProductWithDetails } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

export async function ProductGrid({
  searchParams,
}: {
  searchParams?: { category?: string; subcategory?: string; sort?: string }
}) {
  const supabase = await createClient()

  // Build query
  let query = supabase
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
    .eq("is_active", true)

  // Apply category filter
  if (searchParams?.category) {
    const { data: category } = await supabase.from("categories").select("id").eq("slug", searchParams.category).single()

    if (category) {
      query = query.eq("category_id", category.id)
    }
  }

  // Apply subcategory filter
  if (searchParams?.subcategory) {
    const { data: subcategory } = await supabase
      .from("subcategories")
      .select("id")
      .eq("slug", searchParams.subcategory)
      .single()

    if (subcategory) {
      query = query.eq("subcategory_id", subcategory.id)
    }
  }

  // Apply sorting
  const sortBy = searchParams?.sort || "newest"
  switch (sortBy) {
    case "price-low":
      query = query.order("base_price", { ascending: true })
      break
    case "price-high":
      query = query.order("base_price", { ascending: false })
      break
    case "name":
      query = query.order("name", { ascending: true })
      break
    case "newest":
    default:
      query = query.order("created_at", { ascending: false })
      break
  }

  const { data: products } = await query

  const productList = (products as unknown as ProductWithDetails[]) || []

  if (productList.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed">
        <div className="text-center">
          <p className="text-lg font-semibold">No products found</p>
          <p className="mt-2 text-sm text-muted-foreground">Try adjusting your filters</p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {productList.map((product) => {
        const firstImage = product.product_images.sort((a, b) => a.display_order - b.display_order)[0]
        const hasStock = product.product_variants.some((v) => v.stock_quantity > 0)

        return (
          <Link
            key={product.id}
            href={`/products/${product.slug}`}
            className="group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
          >
            <div className="relative aspect-square overflow-hidden bg-secondary/50">
              <Image
                src={firstImage?.image_url || "/placeholder.svg?height=400&width=400"}
                alt={firstImage?.alt_text || product.name}
                width={400}
                height={400}
                className="h-full w-full object-cover transition-transform group-hover:scale-105"
              />
              {!hasStock && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold">Out of Stock</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-balance">{product.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{product.categories.name}</p>
              <p className="mt-2 font-semibold">৳{product.base_price.toFixed(2)}</p>
            </div>
          </Link>
        )
      })}
    </div>
  )
}
