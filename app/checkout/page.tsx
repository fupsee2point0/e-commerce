"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import type { CartItem } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function CheckoutPage() {
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    shippingCity: "",
    shippingPostalCode: "",
    shippingCountry: "Bangladesh",
    notes: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const cart = localStorage.getItem("cart")
    if (cart) {
      const items: CartItem[] = JSON.parse(cart)
      if (items.length === 0) {
        router.push("/cart")
      } else {
        setCartItems(items)
      }
    } else {
      router.push("/cart")
    }
    setIsLoading(false)
  }, [router])

  const subtotal = cartItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const shipping = 100
  const total = subtotal + shipping

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.customerName.trim()) {
      newErrors.customerName = "Name is required"
    }

    if (!formData.customerEmail.trim()) {
      newErrors.customerEmail = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.customerEmail)) {
      newErrors.customerEmail = "Invalid email address"
    }

    if (!formData.customerPhone.trim()) {
      newErrors.customerPhone = "Phone number is required"
    }

    if (!formData.shippingAddress.trim()) {
      newErrors.shippingAddress = "Address is required"
    }

    if (!formData.shippingCity.trim()) {
      newErrors.shippingCity = "City is required"
    }

    if (!formData.shippingPostalCode.trim()) {
      newErrors.shippingPostalCode = "Postal code is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          items: cartItems,
          totalAmount: total,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create order")
      }

      const { orderId, orderNumber } = await response.json()

      // Clear cart
      localStorage.removeItem("cart")
      window.dispatchEvent(new Event("cartUpdated"))

      // Redirect to confirmation page
      router.push(`/order-confirmation?orderId=${orderId}&orderNumber=${orderNumber}`)
    } catch (error) {
      console.error("[v0] Error creating order:", error)
      alert("Failed to place order. Please try again.")
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <Header />
        <main className="flex flex-1 items-center justify-center">
          <p>Loading checkout...</p>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          <h1 className="mb-8 text-3xl font-bold tracking-tight">Checkout</h1>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Shipping Information */}
              <div className="lg:col-span-2">
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="mb-6 text-xl font-semibold">Shipping Information</h2>

                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <Label htmlFor="customerName">
                          Full Name <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="customerName"
                          name="customerName"
                          value={formData.customerName}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={errors.customerName ? "border-destructive" : ""}
                        />
                        {errors.customerName && <p className="mt-1 text-sm text-destructive">{errors.customerName}</p>}
                      </div>

                      <div>
                        <Label htmlFor="customerEmail">
                          Email <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="customerEmail"
                          name="customerEmail"
                          type="email"
                          value={formData.customerEmail}
                          onChange={handleInputChange}
                          placeholder="john@example.com"
                          className={errors.customerEmail ? "border-destructive" : ""}
                        />
                        {errors.customerEmail && (
                          <p className="mt-1 text-sm text-destructive">{errors.customerEmail}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="customerPhone">
                        Phone Number <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        id="customerPhone"
                        name="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={handleInputChange}
                        placeholder="+880 1234 567890"
                        className={errors.customerPhone ? "border-destructive" : ""}
                      />
                      {errors.customerPhone && <p className="mt-1 text-sm text-destructive">{errors.customerPhone}</p>}
                    </div>

                    <div>
                      <Label htmlFor="shippingAddress">
                        Address <span className="text-destructive">*</span>
                      </Label>
                      <Textarea
                        id="shippingAddress"
                        name="shippingAddress"
                        value={formData.shippingAddress}
                        onChange={handleInputChange}
                        placeholder="Street address, apartment, suite, etc."
                        rows={3}
                        className={errors.shippingAddress ? "border-destructive" : ""}
                      />
                      {errors.shippingAddress && (
                        <p className="mt-1 text-sm text-destructive">{errors.shippingAddress}</p>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-3">
                      <div>
                        <Label htmlFor="shippingCity">
                          City <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="shippingCity"
                          name="shippingCity"
                          value={formData.shippingCity}
                          onChange={handleInputChange}
                          placeholder="Dhaka"
                          className={errors.shippingCity ? "border-destructive" : ""}
                        />
                        {errors.shippingCity && <p className="mt-1 text-sm text-destructive">{errors.shippingCity}</p>}
                      </div>

                      <div>
                        <Label htmlFor="shippingPostalCode">
                          Postal Code <span className="text-destructive">*</span>
                        </Label>
                        <Input
                          id="shippingPostalCode"
                          name="shippingPostalCode"
                          value={formData.shippingPostalCode}
                          onChange={handleInputChange}
                          placeholder="1000"
                          className={errors.shippingPostalCode ? "border-destructive" : ""}
                        />
                        {errors.shippingPostalCode && (
                          <p className="mt-1 text-sm text-destructive">{errors.shippingPostalCode}</p>
                        )}
                      </div>

                      <div>
                        <Label htmlFor="shippingCountry">Country</Label>
                        <Input
                          id="shippingCountry"
                          name="shippingCountry"
                          value={formData.shippingCountry}
                          onChange={handleInputChange}
                          readOnly
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="notes">Order Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        value={formData.notes}
                        onChange={handleInputChange}
                        placeholder="Any special instructions for your order"
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="rounded-lg border bg-card p-6">
                  <h2 className="mb-4 text-xl font-semibold">Order Summary</h2>

                  <div className="mb-4 space-y-3 border-b pb-4">
                    {cartItems.map((item, index) => (
                      <div key={`${item.productId}-${item.variantId}-${index}`} className="flex gap-3">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-secondary/50">
                          <Image
                            src={item.imageUrl || "/placeholder.svg"}
                            alt={item.productName}
                            width={64}
                            height={64}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-semibold">{item.productName}</h3>
                          <div className="mt-1 flex gap-2 text-xs text-muted-foreground">
                            {item.size && <span>{item.size}</span>}
                            {item.color && <span>{item.color}</span>}
                          </div>
                          <p className="mt-1 text-sm">
                            ৳{item.unitPrice.toFixed(2)} × {item.quantity}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-3 border-b pb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span className="font-semibold">৳{subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Shipping</span>
                      <span className="font-semibold">৳{shipping.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>৳{total.toFixed(2)}</span>
                  </div>

                  <Button type="submit" className="mt-6 w-full" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Placing Order...
                      </>
                    ) : (
                      "Place Order"
                    )}
                  </Button>

                  <p className="mt-4 text-center text-xs text-muted-foreground">
                    By placing your order, you agree to our terms and conditions.
                  </p>
                </div>
              </div>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  )
}
