import { createClient } from "@/lib/supabase/server"
import type { ProductWithDetails } from "@/lib/types"
import Link from "next/link"
import Image from "next/image"

interface RelatedProductsProps {
  categoryId: string
  currentProductId: string
}

export async function RelatedProducts({ categoryId, currentProductId }: RelatedProductsProps) {
  const supabase = await createClient()

  const { data: products } = await supabase
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
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .neq("id", currentProductId)
    .limit(4)

  const relatedProducts = (products as unknown as ProductWithDetails[]) || []

  if (relatedProducts.length === 0) {
    return null
  }

  return (
    <div>
      <h2 className="mb-6 text-2xl font-bold tracking-tight">Related Products</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {relatedProducts.map((product) => {
          const firstImage = product.product_images.sort((a, b) => a.display_order - b.display_order)[0]
          return (
            <Link
              key={product.id}
              href={`/products/${product.slug}`}
              className="group overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
            >
              <div className="aspect-square overflow-hidden bg-secondary/50">
                <Image
                  src={firstImage?.image_url || "/placeholder.svg?height=400&width=400"}
                  alt={firstImage?.alt_text || product.name}
                  width={400}
                  height={400}
                  className="h-full w-full object-cover transition-transform group-hover:scale-105"
                />
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
    </div>
  )
}
