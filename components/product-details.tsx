"use client"

import { useState } from "react"
import Image from "next/image"
import type { ProductWithDetails, CartItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { ShoppingCart, Check } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"

interface ProductDetailsProps {
  product: ProductWithDetails
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const router = useRouter()
  const [selectedImage, setSelectedImage] = useState(0)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [selectedColor, setSelectedColor] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [isAddingToCart, setIsAddingToCart] = useState(false)

  const sortedImages = product.product_images.sort((a, b) => a.display_order - b.display_order)

  // Get unique sizes and colors
  const availableSizes = Array.from(new Set(product.product_variants.map((v) => v.size).filter(Boolean)))
  const availableColors = Array.from(new Set(product.product_variants.map((v) => v.color).filter(Boolean)))

  // Get the selected variant
  const selectedVariant = product.product_variants.find((v) => v.size === selectedSize && v.color === selectedColor)

  // Check if product has variants
  const hasVariants = product.product_variants.length > 0
  const hasSize = availableSizes.length > 0
  const hasColor = availableColors.length > 0

  // Get available stock
  const availableStock = selectedVariant ? selectedVariant.stock_quantity : 0
  const isInStock = hasVariants ? availableStock > 0 : true

  const canAddToCart = hasVariants ? selectedVariant && isInStock && quantity <= availableStock : isInStock

  const addToCart = () => {
    if (!canAddToCart) return

    setIsAddingToCart(true)

    const cart = localStorage.getItem("cart")
    const cartItems: CartItem[] = cart ? JSON.parse(cart) : []

    const cartItem: CartItem = {
      productId: product.id,
      variantId: selectedVariant?.id || null,
      productName: product.name,
      size: selectedSize || null,
      color: selectedColor || null,
      quantity,
      unitPrice: product.base_price + (selectedVariant?.price_adjustment || 0),
      imageUrl: sortedImages[0]?.image_url || "/placeholder.svg?height=400&width=400",
    }

    // Check if item already exists in cart
    const existingItemIndex = cartItems.findIndex(
      (item) => item.productId === cartItem.productId && item.variantId === cartItem.variantId,
    )

    if (existingItemIndex > -1) {
      cartItems[existingItemIndex].quantity += quantity
    } else {
      cartItems.push(cartItem)
    }

    localStorage.setItem("cart", JSON.stringify(cartItems))

    // Dispatch custom event to update cart count
    window.dispatchEvent(new Event("cartUpdated"))

    setTimeout(() => {
      setIsAddingToCart(false)
    }, 1000)
  }

  const buyNow = () => {
    addToCart()
    router.push("/cart")
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="aspect-square overflow-hidden rounded-lg border bg-secondary/50">
          <Image
            src={sortedImages[selectedImage]?.image_url || "/placeholder.svg?height=600&width=600"}
            alt={sortedImages[selectedImage]?.alt_text || product.name}
            width={600}
            height={600}
            className="h-full w-full object-cover"
            priority
          />
        </div>

        {sortedImages.length > 1 && (
          <div className="grid grid-cols-4 gap-4">
            {sortedImages.map((image, index) => (
              <button
                key={image.id}
                onClick={() => setSelectedImage(index)}
                className={`aspect-square overflow-hidden rounded-lg border-2 transition-all ${
                  selectedImage === index ? "border-primary" : "border-transparent hover:border-muted-foreground"
                }`}
              >
                <Image
                  src={image.image_url || "/placeholder.svg"}
                  alt={image.alt_text || `${product.name} view ${index + 1}`}
                  width={150}
                  height={150}
                  className="h-full w-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="space-y-6">
        <div>
          <div className="mb-2 flex items-center gap-2">
            <Badge variant="secondary">{product.categories.name}</Badge>
            {product.subcategories && <Badge variant="outline">{product.subcategories.name}</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">{product.name}</h1>
          <p className="mt-4 text-3xl font-bold">৳{product.base_price.toFixed(2)}</p>
        </div>

        {product.description && (
          <div>
            <h2 className="mb-2 text-sm font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">{product.description}</p>
          </div>
        )}

        {/* Size Selection */}
        {hasSize && (
          <div>
            <Label className="mb-3 block text-sm font-semibold">
              Size {selectedSize && <span className="font-normal text-muted-foreground">- {selectedSize}</span>}
            </Label>
            <RadioGroup value={selectedSize} onValueChange={setSelectedSize}>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => {
                  const sizeVariants = product.product_variants.filter((v) => v.size === size)
                  const hasStock = sizeVariants.some((v) => v.stock_quantity > 0)

                  return (
                    <div key={size}>
                      <RadioGroupItem value={size!} id={`size-${size}`} className="peer sr-only" disabled={!hasStock} />
                      <Label
                        htmlFor={`size-${size}`}
                        className={`flex h-10 min-w-[3rem] cursor-pointer items-center justify-center rounded-md border-2 px-4 text-sm font-medium transition-all peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
                          selectedSize === size
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:border-muted-foreground"
                        }`}
                      >
                        {size}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Color Selection */}
        {hasColor && (
          <div>
            <Label className="mb-3 block text-sm font-semibold">
              Color {selectedColor && <span className="font-normal text-muted-foreground">- {selectedColor}</span>}
            </Label>
            <RadioGroup value={selectedColor} onValueChange={setSelectedColor}>
              <div className="flex flex-wrap gap-2">
                {availableColors.map((color) => {
                  const colorVariants = product.product_variants.filter((v) => v.color === color)
                  const hasStock = colorVariants.some((v) => v.stock_quantity > 0)

                  return (
                    <div key={color}>
                      <RadioGroupItem
                        value={color!}
                        id={`color-${color}`}
                        className="peer sr-only"
                        disabled={!hasStock}
                      />
                      <Label
                        htmlFor={`color-${color}`}
                        className={`flex h-10 cursor-pointer items-center justify-center rounded-md border-2 px-4 text-sm font-medium transition-all peer-disabled:cursor-not-allowed peer-disabled:opacity-50 ${
                          selectedColor === color
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-input bg-background hover:border-muted-foreground"
                        }`}
                      >
                        {color}
                      </Label>
                    </div>
                  )
                })}
              </div>
            </RadioGroup>
          </div>
        )}

        {/* Stock Info */}
        {hasVariants && selectedVariant && (
          <div>
            <p className="text-sm">
              {availableStock > 0 ? (
                <span className="text-green-600">
                  In Stock ({availableStock} {availableStock === 1 ? "item" : "items"} available)
                </span>
              ) : (
                <span className="text-destructive">Out of Stock</span>
              )}
            </p>
          </div>
        )}

        {/* Quantity */}
        {isInStock && (
          <div>
            <Label htmlFor="quantity" className="mb-3 block text-sm font-semibold">
              Quantity
            </Label>
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setQuantity(Math.min(availableStock || 999, quantity + 1))}
                disabled={hasVariants && quantity >= availableStock}
              >
                +
              </Button>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button size="lg" className="flex-1" onClick={addToCart} disabled={!canAddToCart || isAddingToCart}>
            {isAddingToCart ? (
              <>
                <Check className="mr-2 h-5 w-5" />
                Added to Cart
              </>
            ) : (
              <>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </>
            )}
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={buyNow}
            disabled={!canAddToCart}
          >
            Buy Now
          </Button>
        </div>

        {hasVariants && (!selectedSize || !selectedColor) ? (
          <p className="text-sm text-muted-foreground">
            Please select {!selectedSize && "size"} {!selectedSize && !selectedColor && "and"}{" "}
            {!selectedColor && "color"} to continue.
          </p>
        ) : (
          !isInStock && <p className="text-sm text-destructive">This product is currently out of stock.</p>
        )}
      </div>
    </div>
  )
}
