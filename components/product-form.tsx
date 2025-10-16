"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Category, Subcategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Switch } from "@/components/ui/switch"

interface ProductFormProps {
  categories: Category[]
  subcategories: Subcategory[]
}

interface Variant {
  size: string
  color: string
  stock: number
  sku: string
}

export function ProductForm({ categories, subcategories }: ProductFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    categoryId: "",
    subcategoryId: "",
    isActive: true,
  })

  const [variants, setVariants] = useState<Variant[]>([{ size: "", color: "", stock: 0, sku: "" }])

  const filteredSubcategories = subcategories.filter((sub) => sub.category_id === formData.categoryId)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Auto-generate slug from name
    if (name === "name") {
      const slug = value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "")
      setFormData((prev) => ({ ...prev, slug }))
    }
  }

  const handleVariantChange = (index: number, field: keyof Variant, value: string | number) => {
    const updatedVariants = [...variants]
    updatedVariants[index] = { ...updatedVariants[index], [field]: value }
    setVariants(updatedVariants)
  }

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", stock: 0, sku: "" }])
  }

  const removeVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const supabase = createClient()

      // Create product
      const { data: product, error: productError } = await supabase
        .from("products")
        .insert({
          name: formData.name,
          slug: formData.slug,
          description: formData.description || null,
          base_price: Number.parseFloat(formData.basePrice),
          category_id: formData.categoryId,
          subcategory_id: formData.subcategoryId || null,
          is_active: formData.isActive,
        })
        .select()
        .single()

      if (productError) throw productError

      // Create variants
      const variantData = variants
        .filter((v) => v.size || v.color)
        .map((v) => ({
          product_id: product.id,
          size: v.size || null,
          color: v.color || null,
          stock_quantity: v.stock,
          sku: v.sku || null,
          price_adjustment: 0,
        }))

      if (variantData.length > 0) {
        const { error: variantsError } = await supabase.from("product_variants").insert(variantData)
        if (variantsError) throw variantsError
      }

      alert("Product created successfully!")
      router.push("/admin_panel/products")
    } catch (error) {
      console.error("[v0] Error creating product:", error)
      alert("Failed to create product. Please try again.")
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">
                  Product Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Classic White Dress Shirt"
                  required
                />
              </div>

              <div>
                <Label htmlFor="slug">
                  Slug <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="classic-white-dress-shirt"
                  required
                />
                <p className="mt-1 text-xs text-muted-foreground">URL-friendly version of the product name</p>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the product..."
                  rows={4}
                />
              </div>

              <div>
                <Label htmlFor="basePrice">
                  Base Price (৳) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="basePrice"
                  name="basePrice"
                  type="number"
                  step="0.01"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  placeholder="2499.00"
                  required
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {variants.map((variant, index) => (
                <div key={index} className="flex gap-3 rounded-lg border p-4">
                  <div className="flex-1 space-y-3">
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`size-${index}`}>Size</Label>
                        <Input
                          id={`size-${index}`}
                          value={variant.size}
                          onChange={(e) => handleVariantChange(index, "size", e.target.value)}
                          placeholder="M, L, XL"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`color-${index}`}>Color</Label>
                        <Input
                          id={`color-${index}`}
                          value={variant.color}
                          onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                          placeholder="Black, White"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`stock-${index}`}>Stock Quantity</Label>
                        <Input
                          id={`stock-${index}`}
                          type="number"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, "stock", Number.parseInt(e.target.value) || 0)}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`sku-${index}`}>SKU</Label>
                        <Input
                          id={`sku-${index}`}
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                          placeholder="PROD-M-BLK"
                        />
                      </div>
                    </div>
                  </div>
                  {variants.length > 1 && (
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(index)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  )}
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addVariant} className="w-full bg-transparent">
                <Plus className="mr-2 h-4 w-4" />
                Add Variant
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Category</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="categoryId">
                  Category <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.categoryId}
                  onValueChange={(value) => setFormData((prev) => ({ ...prev, categoryId: value, subcategoryId: "" }))}
                  required
                >
                  <SelectTrigger id="categoryId">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {filteredSubcategories.length > 0 && (
                <div>
                  <Label htmlFor="subcategoryId">Subcategory</Label>
                  <Select
                    value={formData.subcategoryId}
                    onValueChange={(value) => setFormData((prev) => ({ ...prev, subcategoryId: value }))}
                  >
                    <SelectTrigger id="subcategoryId">
                      <SelectValue placeholder="Select subcategory" />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredSubcategories.map((sub) => (
                        <SelectItem key={sub.id} value={sub.id}>
                          {sub.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <Label htmlFor="isActive">Active</Label>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
                />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">Inactive products won't be visible to customers</p>
            </CardContent>
          </Card>

          <div className="space-y-3">
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Creating Product...
                </>
              ) : (
                "Create Product"
              )}
            </Button>
            <Button type="button" variant="outline" className="w-full bg-transparent" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
