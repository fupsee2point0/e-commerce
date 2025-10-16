"use client"

import type { ProductWithDetails } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface ProductsTableProps {
  products: ProductWithDetails[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()

  const handleDelete = async (productId: string, productName: string) => {
    if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
      return
    }

    const supabase = createClient()
    const { error } = await supabase.from("products").delete().eq("id", productId)

    if (error) {
      console.error("[v0] Error deleting product:", error)
      alert("Failed to delete product")
    } else {
      alert("Product deleted successfully")
      router.refresh()
    }
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[400px] items-center justify-center rounded-lg border border-dashed bg-card">
        <div className="text-center">
          <p className="text-lg font-semibold">No products yet</p>
          <p className="mt-2 text-sm text-muted-foreground">Add your first product to get started</p>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Product</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Stock</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => {
            const firstImage = product.product_images.sort((a, b) => a.display_order - b.display_order)[0]
            const totalStock = product.product_variants.reduce((sum, v) => sum + v.stock_quantity, 0)

            return (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-secondary/50">
                      <Image
                        src={firstImage?.image_url || "/placeholder.svg"}
                        alt={product.name}
                        width={48}
                        height={48}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">{product.slug}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="font-medium">{product.categories.name}</p>
                    {product.subcategories && (
                      <p className="text-sm text-muted-foreground">{product.subcategories.name}</p>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-semibold">৳{product.base_price.toFixed(2)}</TableCell>
                <TableCell>
                  <span className={totalStock > 0 ? "text-green-600" : "text-destructive"}>{totalStock} units</span>
                </TableCell>
                <TableCell>
                  <Badge variant={product.is_active ? "default" : "secondary"}>
                    {product.is_active ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/admin_panel/products/${product.id}/edit`}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit product</span>
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(product.id, product.name)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Delete product</span>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
