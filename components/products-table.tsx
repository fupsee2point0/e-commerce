"use client"

import type { ProductWithDetails } from "@/lib/types"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Eye, EyeOff } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface ProductsTableProps {
  products: ProductWithDetails[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [showInactiveDialog, setShowInactiveDialog] = useState(false)
  const [productToDelete, setProductToDelete] = useState<{ id: string; name: string } | null>(null)

  const handleDelete = async (productId: string, productName: string) => {
    setDeletingId(productId)

    try {
      // Check if product has orders
      const response = await fetch(`/api/products/${productId}/check-orders`)
      const { hasOrders } = await response.json()

      if (hasOrders) {
        // Product has orders, offer to mark as inactive instead
        setProductToDelete({ id: productId, name: productName })
        setShowInactiveDialog(true)
        setDeletingId(null)
        return
      }

      // Product has no orders, safe to delete
      if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
        setDeletingId(null)
        return
      }

      const supabase = createClient()
      const { error } = await supabase.from("products").delete().eq("id", productId)

      if (error) {
        console.error("[v0] Error deleting product:", error)
        toast({
          title: "Error",
          description: "Failed to delete product. Please try again.",
          variant: "destructive",
        })
      } else {
        toast({
          title: "Success",
          description: "Product deleted successfully",
        })
        router.refresh()
      }
    } catch (error) {
      console.error("[v0] Error in delete handler:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setDeletingId(null)
    }
  }

  const handleMarkInactive = async () => {
    if (!productToDelete) return

    try {
      const response = await fetch(`/api/products/${productToDelete.id}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: false }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product status")
      }

      toast({
        title: "Success",
        description: `"${productToDelete.name}" has been marked as inactive and hidden from customers`,
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Error marking product inactive:", error)
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    } finally {
      setShowInactiveDialog(false)
      setProductToDelete(null)
    }
  }

  const handleToggleStatus = async (productId: string, currentStatus: boolean, productName: string) => {
    setTogglingId(productId)

    try {
      const response = await fetch(`/api/products/${productId}/toggle-status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !currentStatus }),
      })

      if (!response.ok) {
        throw new Error("Failed to update product status")
      }

      toast({
        title: "Success",
        description: `"${productName}" is now ${!currentStatus ? "active" : "inactive"}`,
      })
      router.refresh()
    } catch (error) {
      console.error("[v0] Error toggling status:", error)
      toast({
        title: "Error",
        description: "Failed to update product status",
        variant: "destructive",
      })
    } finally {
      setTogglingId(null)
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
    <>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleToggleStatus(product.id, product.is_active, product.name)}
                        disabled={togglingId === product.id}
                        title={product.is_active ? "Mark as inactive" : "Mark as active"}
                      >
                        {product.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        <span className="sr-only">Toggle status</span>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/admin_panel/products/${product.id}/edit`}>
                          <Edit className="h-4 w-4" />
                          <span className="sr-only">Edit product</span>
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={deletingId === product.id}
                      >
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

      <AlertDialog open={showInactiveDialog} onOpenChange={setShowInactiveDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cannot Delete Product</AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                The product <strong>"{productToDelete?.name}"</strong> cannot be deleted because it has existing orders
                in the system.
              </p>
              <p>
                To preserve order history and data integrity, you can mark this product as <strong>inactive</strong>{" "}
                instead. This will:
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Hide the product from customers</li>
                <li>Preserve all order history</li>
                <li>Allow you to reactivate it later if needed</li>
              </ul>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setProductToDelete(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleMarkInactive}>Mark as Inactive</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
