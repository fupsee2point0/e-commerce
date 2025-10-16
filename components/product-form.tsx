"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import type { Category, Subcategory } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, Plus, Trash2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ImageUpload } from "@/components/image-upload"

interface ProductFormProps {
  categories: Category[]
  subcategories: Subcategory[]
  initialProduct?: any
}

interface Variant {
  id?: string
  size: string
  color: string
  stock: number
  sku: string
}

export function ProductForm({ categories, subcategories, initialProduct }: ProductFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const isEditMode = !!initialProduct

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
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (initialProduct) {
      setFormData({
        name: initialProduct.name || "",
        slug: initialProduct.slug || "",
        description: initialProduct.description || "",
        basePrice: initialProduct.base_price?.toString() || "",
        categoryId: initialProduct.category_id || "",
        subcategoryId: initialProduct.subcategory_id || "",
        isActive: initialProduct.is_active ?? true,
      })

      if (initialProduct.product_variants && initialProduct.product_variants.length > 0) {
        setVariants(
          initialProduct.product_variants.map((v: any) => ({
            id: v.id,
            size: v.size || "",
            color: v.color || "",
            stock: v.stock_quantity || 0,
            sku: v.sku || "",
          })),
        )
      }

      if (initialProduct.product_images && initialProduct.product_images.length > 0) {
        const sortedImages = [...initialProduct.product_images].sort((a, b) => a.display_order - b.display_order)
        setImageUrls(sortedImages.map((img: any) => img.image_url))
      }
    }
  }, [initialProduct])

  const filteredSubcategories = subcategories.filter((sub) => sub.category_id === formData.categoryId)

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Product name is required"
    }

    if (!formData.slug.trim()) {
      newErrors.slug = "Slug is required"
    } else if (!/^[a-z0-9-]+$/.test(formData.slug)) {
      newErrors.slug = "Slug can only contain lowercase letters, numbers, and hyphens"
    }

    if (!formData.basePrice || Number.parseFloat(formData.basePrice) <= 0) {
      newErrors.basePrice = "Price must be greater than 0"
    }

    if (!formData.categoryId) {
      newErrors.categoryId = "Category is required"
    }

    if (imageUrls.length === 0) {
      newErrors.images = "At least one product image is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }

    if (name === "name" && !isEditMode) {
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

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors in the form before submitting.",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()

      const subcategoryId = formData.subcategoryId?.trim() || null
      const categoryId = formData.categoryId?.trim() || null

      if (isEditMode) {
        const { error: productError } = await supabase
          .from("products")
          .update({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            base_price: Number.parseFloat(formData.basePrice),
            category_id: categoryId,
            subcategory_id: subcategoryId,
            is_active: formData.isActive,
          })
          .eq("id", initialProduct.id)

        if (productError) throw productError

        await supabase.from("product_images").delete().eq("product_id", initialProduct.id)

        const imageData = imageUrls.map((url, index) => ({
          product_id: initialProduct.id,
          image_url: url,
          display_order: index,
        }))

        const { error: imagesError } = await supabase.from("product_images").insert(imageData)
        if (imagesError) throw imagesError

        await supabase.from("product_variants").delete().eq("product_id", initialProduct.id)

        const variantData = variants
          .filter((v) => v.size || v.color)
          .map((v) => ({
            product_id: initialProduct.id,
            size: v.size?.trim() || null,
            color: v.color?.trim() || null,
            stock_quantity: v.stock,
            sku: v.sku?.trim() || null,
            price_adjustment: 0,
          }))

        if (variantData.length > 0) {
          const { error: variantsError } = await supabase.from("product_variants").insert(variantData)
          if (variantsError) throw variantsError
        }

        toast({
          title: "Success",
          description: "Product updated successfully!",
        })
      } else {
        const { data: product, error: productError } = await supabase
          .from("products")
          .insert({
            name: formData.name,
            slug: formData.slug,
            description: formData.description || null,
            base_price: Number.parseFloat(formData.basePrice),
            category_id: categoryId,
            subcategory_id: subcategoryId,
            is_active: formData.isActive,
          })
          .select()
          .single()

        if (productError) throw productError

        const imageData = imageUrls.map((url, index) => ({
          product_id: product.id,
          image_url: url,
          display_order: index,
        }))

        const { error: imagesError } = await supabase.from("product_images").insert(imageData)
        if (imagesError) throw imagesError

        const variantData = variants
          .filter((v) => v.size || v.color)
          .map((v) => ({
            product_id: product.id,
            size: v.size?.trim() || null,
            color: v.color?.trim() || null,
            stock_quantity: v.stock,
            sku: v.sku?.trim() || null,
            price_adjustment: 0,
          }))

        if (variantData.length > 0) {
          const { error: variantsError } = await supabase.from("product_variants").insert(variantData)
          if (variantsError) throw variantsError
        }

        toast({
          title: "Success",
          description: "Product created successfully!",
        })
      }

      router.push("/admin_panel/products")
      router.refresh()
    } catch (error: any) {
      console.error("[v0] Error saving product:", error)

      let errorMessage = `Failed to ${isEditMode ? "update" : "create"} product. `

      if (error.message?.includes("duplicate key")) {
        if (error.message.includes("slug")) {
          errorMessage += "This product slug already exists. Please use a different name or slug."
        } else if (error.message.includes("sku")) {
          errorMessage += "One or more SKUs already exist. Please use unique SKU values."
        } else {
          errorMessage += "A duplicate value was detected. Please check your inputs."
        }
      } else {
        errorMessage += "Please try again."
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {Object.keys(errors).length > 0 && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Please fix the errors below before submitting the form.</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Images</CardTitle>
            </CardHeader>
            <CardContent>
              <ImageUpload images={imageUrls} onChange={setImageUrls} maxImages={10} />
              {errors.images && <p className="mt-2 text-sm text-destructive">{errors.images}</p>}
            </CardContent>
          </Card>

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
                  className={errors.name ? "border-destructive" : ""}
                />
                {errors.name && <p className="mt-1 text-xs text-destructive">{errors.name}</p>}
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
                  className={errors.slug ? "border-destructive" : ""}
                />
                {errors.slug ? (
                  <p className="mt-1 text-xs text-destructive">{errors.slug}</p>
                ) : (
                  <p className="mt-1 text-xs text-muted-foreground">
                    URL-friendly version (lowercase, numbers, and hyphens only)
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe the product features, materials, and benefits..."
                  rows={4}
                />
                <p className="mt-1 text-xs text-muted-foreground">
                  Provide detailed information to help customers make informed decisions
                </p>
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
                  min="0.01"
                  value={formData.basePrice}
                  onChange={handleInputChange}
                  placeholder="2499.00"
                  required
                  className={errors.basePrice ? "border-destructive" : ""}
                />
                {errors.basePrice && <p className="mt-1 text-xs text-destructive">{errors.basePrice}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Product Variants</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Add size and color variations. Leave fields empty if not applicable.
              </p>
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
                          placeholder="S, M, L, XL"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`color-${index}`}>Color</Label>
                        <Input
                          id={`color-${index}`}
                          value={variant.color}
                          onChange={(e) => handleVariantChange(index, "color", e.target.value)}
                          placeholder="Black, White, Blue"
                        />
                      </div>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div>
                        <Label htmlFor={`stock-${index}`}>Stock Quantity</Label>
                        <Input
                          id={`stock-${index}`}
                          type="number"
                          min="0"
                          value={variant.stock}
                          onChange={(e) => handleVariantChange(index, "stock", Number.parseInt(e.target.value) || 0)}
                          placeholder="10"
                        />
                      </div>
                      <div>
                        <Label htmlFor={`sku-${index}`}>SKU (Optional)</Label>
                        <Input
                          id={`sku-${index}`}
                          value={variant.sku}
                          onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                          placeholder="PROD-M-BLK"
                        />
                        <p className="mt-1 text-xs text-muted-foreground">Must be unique if provided</p>
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
                  onValueChange={(value) => {
                    setFormData((prev) => ({ ...prev, categoryId: value, subcategoryId: "" }))
                    if (errors.categoryId) {
                      setErrors((prev) => ({ ...prev, categoryId: "" }))
                    }
                  }}
                  required
                >
                  <SelectTrigger id="categoryId" className={errors.categoryId ? "border-destructive" : ""}>
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
                {errors.categoryId && <p className="mt-1 text-xs text-destructive">{errors.categoryId}</p>}
              </div>

              {filteredSubcategories.length > 0 && (
                <div>
                  <Label htmlFor="subcategoryId">Subcategory (Optional)</Label>
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
                  {isEditMode ? "Updating..." : "Creating..."}
                </>
              ) : (
                <>{isEditMode ? "Update Product" : "Create Product"}</>
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full bg-transparent"
              onClick={() => router.back()}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
