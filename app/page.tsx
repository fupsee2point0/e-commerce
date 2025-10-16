import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowRight } from "lucide-react"
import { createClient } from "@/lib/supabase/server"
import type { ProductWithDetails } from "@/lib/types"
import Image from "next/image"

export default async function HomePage() {
  const supabase = await createClient()

  // Fetch featured products (latest 8 products)
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
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(8)

  const featuredProducts = (products as unknown as ProductWithDetails[]) || []

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-secondary/30 py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-6xl">
                Discover Your Style with DressVibe
              </h1>
              <p className="mb-8 text-lg text-muted-foreground leading-relaxed text-pretty md:text-xl">
                Explore our curated collection of fashion-forward clothing and accessories for the whole family.
              </p>
              <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="lg" className="group">
                  <Link href="/products">
                    Shop Now
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/products?category=ladies">Women's Collection</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Section */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">Shop by Category</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <Link
                href="/products?category=gents"
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
              >
                <div className="aspect-square bg-secondary/50">
                  <Image
                    src="/category-4.png"
                    alt="Men's Fashion"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">Gents</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Shirts, T-Shirts, Pants & More</p>
                </div>
              </Link>

              <Link
                href="/products?category=ladies"
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
              >
                <div className="aspect-square bg-secondary/50">
                  <Image
                    src="/category-1.png"
                    alt="Women's Fashion"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">Ladies</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Dresses, Tops & More</p>
                </div>
              </Link>

              <Link
                href="/products?category=babies"
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
              >
                <div className="aspect-square bg-secondary/50">
                  <Image
                    src="/baby-clothing-and-accessories.jpg"
                    alt="Baby Fashion"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">Babies</h3>
                  <p className="mt-2 text-sm text-muted-foreground">Clothing & Accessories</p>
                </div>
              </Link>

              <Link
                href="/products?category=bags-shoes"
                className="group relative overflow-hidden rounded-lg border bg-card transition-all hover:shadow-lg"
              >
                <div className="aspect-square bg-secondary/50">
                  <Image
                    src="/bags-and-shoes-fashion.jpg"
                    alt="Bags & Shoes"
                    width={400}
                    height={400}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold">Bags & Shoes</h3>
                  <p className="mt-2 text-sm text-muted-foreground">For Everyone</p>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Featured Products Section */}
        <section className="bg-secondary/30 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mb-12 flex items-center justify-between">
              <h2 className="text-3xl font-bold tracking-tight">Featured Products</h2>
              <Button asChild variant="ghost">
                <Link href="/products">
                  View All
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {featuredProducts.map((product) => {
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
        </section>
      </main>

      <Footer />
    </div>
  )
}
