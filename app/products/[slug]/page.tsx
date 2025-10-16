import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import type { ProductWithDetails } from "@/lib/types"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ProductDetails } from "@/components/product-details"
import { RelatedProducts } from "@/components/related-products"

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from("products")
    .select(
      `
      *,
      categories(*),
      subcategories(*)
    `,
    )
    .eq("slug", slug)
    .single()

  if (!product) {
    return {
      title: "Product Not Found",
    }
  }

  return {
    title: `${product.name} - DressVibe`,
    description: product.description || `Shop ${product.name} at DressVibe`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
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
    .eq("slug", slug)
    .eq("is_active", true)
    .single()

  if (!product) {
    notFound()
  }

  const productWithDetails = product as unknown as ProductWithDetails

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <ProductDetails product={productWithDetails} />

          <div className="mt-16">
            <RelatedProducts categoryId={productWithDetails.category_id} currentProductId={productWithDetails.id} />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
