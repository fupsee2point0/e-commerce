"use client"

import Link from "next/link"
import { ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import type { CartItem } from "@/lib/types"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    // Get cart count from localStorage
    const updateCartCount = () => {
      const cart = localStorage.getItem("cart")
      if (cart) {
        const cartItems: CartItem[] = JSON.parse(cart)
        const count = cartItems.reduce((sum, item) => sum + item.quantity, 0)
        setCartCount(count)
      }
    }

    updateCartCount()

    // Listen for cart updates
    window.addEventListener("storage", updateCartCount)
    window.addEventListener("cartUpdated", updateCartCount)

    return () => {
      window.removeEventListener("storage", updateCartCount)
      window.removeEventListener("cartUpdated", updateCartCount)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link href="/" className="text-2xl font-bold tracking-tight">
          DressVibe
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link
            href="/products?category=gents"
            className="text-sm font-medium transition-colors hover:text-muted-foreground"
          >
            Gents
          </Link>
          <Link
            href="/products?category=ladies"
            className="text-sm font-medium transition-colors hover:text-muted-foreground"
          >
            Ladies
          </Link>
          <Link
            href="/products?category=babies"
            className="text-sm font-medium transition-colors hover:text-muted-foreground"
          >
            Babies
          </Link>
          <Link
            href="/products?category=bags-shoes"
            className="text-sm font-medium transition-colors hover:text-muted-foreground"
          >
            Bags & Shoes
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                  {cartCount}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="border-t bg-background px-4 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            <Link
              href="/products?category=gents"
              className="text-sm font-medium transition-colors hover:text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Gents
            </Link>
            <Link
              href="/products?category=ladies"
              className="text-sm font-medium transition-colors hover:text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Ladies
            </Link>
            <Link
              href="/products?category=babies"
              className="text-sm font-medium transition-colors hover:text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Babies
            </Link>
            <Link
              href="/products?category=bags-shoes"
              className="text-sm font-medium transition-colors hover:text-muted-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Bags & Shoes
            </Link>
          </div>
        </nav>
      )}
    </header>
  )
}
