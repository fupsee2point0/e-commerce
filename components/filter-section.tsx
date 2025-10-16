"use client"

import { useRouter, useSearchParams } from "next/navigation"
import type { Category, Subcategory } from "@/lib/types"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FilterSectionProps {
  categories: Category[]
  subcategories: Subcategory[]
}

export function FilterSection({ categories, subcategories }: FilterSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const selectedCategory = searchParams.get("category")
  const selectedSubcategory = searchParams.get("subcategory")
  const sortBy = searchParams.get("sort") || "newest"

  const handleCategoryChange = (categorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (categorySlug === "all") {
      params.delete("category")
      params.delete("subcategory")
    } else {
      params.set("category", categorySlug)
      params.delete("subcategory")
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleSubcategoryChange = (subcategorySlug: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (subcategorySlug === "all") {
      params.delete("subcategory")
    } else {
      params.set("subcategory", subcategorySlug)
    }
    router.push(`/products?${params.toString()}`)
  }

  const handleSortChange = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("sort", value)
    router.push(`/products?${params.toString()}`)
  }

  const handleClearFilters = () => {
    router.push("/products")
  }

  const filteredSubcategories = selectedCategory
    ? subcategories.filter((sub) => {
        const category = categories.find((cat) => cat.slug === selectedCategory)
        return category && sub.category_id === category.id
      })
    : []

  return (
    <div className="space-y-6">
      {/* Sort By */}
      <div>
        <Label className="mb-3 block text-sm font-semibold">Sort By</Label>
        <Select value={sortBy} onValueChange={handleSortChange}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest First</SelectItem>
            <SelectItem value="price-low">Price: Low to High</SelectItem>
            <SelectItem value="price-high">Price: High to Low</SelectItem>
            <SelectItem value="name">Name: A to Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Category Filter */}
      <div>
        <Label className="mb-3 block text-sm font-semibold">Category</Label>
        <RadioGroup value={selectedCategory || "all"} onValueChange={handleCategoryChange}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="all" id="cat-all" />
            <Label htmlFor="cat-all" className="cursor-pointer font-normal">
              All Categories
            </Label>
          </div>
          {categories.map((category) => (
            <div key={category.id} className="flex items-center space-x-2">
              <RadioGroupItem value={category.slug} id={`cat-${category.slug}`} />
              <Label htmlFor={`cat-${category.slug}`} className="cursor-pointer font-normal">
                {category.name}
              </Label>
            </div>
          ))}
        </RadioGroup>
      </div>

      {/* Subcategory Filter */}
      {selectedCategory && filteredSubcategories.length > 0 && (
        <div>
          <Label className="mb-3 block text-sm font-semibold">Subcategory</Label>
          <RadioGroup value={selectedSubcategory || "all"} onValueChange={handleSubcategoryChange}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="subcat-all" />
              <Label htmlFor="subcat-all" className="cursor-pointer font-normal">
                All
              </Label>
            </div>
            {filteredSubcategories.map((subcategory) => (
              <div key={subcategory.id} className="flex items-center space-x-2">
                <RadioGroupItem value={subcategory.slug} id={`subcat-${subcategory.slug}`} />
                <Label htmlFor={`subcat-${subcategory.slug}`} className="cursor-pointer font-normal">
                  {subcategory.name}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Clear Filters */}
      {(selectedCategory || selectedSubcategory || sortBy !== "newest") && (
        <Button variant="outline" className="w-full bg-transparent" onClick={handleClearFilters}>
          Clear All Filters
        </Button>
      )}
    </div>
  )
}
