import Link from "next/link"

export function Footer() {
  return (
    <footer className="border-t bg-secondary/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h3 className="mb-4 text-lg font-semibold">DressVibe</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Your destination for quality fashion. Discover the latest trends in clothing and accessories.
            </p>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Shop</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/products?category=gents"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Gents
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=ladies"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Ladies
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=babies"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Babies
                </Link>
              </li>
              <li>
                <Link
                  href="/products?category=bags-shoes"
                  className="text-muted-foreground transition-colors hover:text-foreground"
                >
                  Bags & Shoes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">Customer Service</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/contact" className="text-muted-foreground transition-colors hover:text-foreground">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/shipping" className="text-muted-foreground transition-colors hover:text-foreground">
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link href="/returns" className="text-muted-foreground transition-colors hover:text-foreground">
                  Returns
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-sm font-semibold">About</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="text-muted-foreground transition-colors hover:text-foreground">
                  Our Story
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-muted-foreground transition-colors hover:text-foreground">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-muted-foreground transition-colors hover:text-foreground">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} DressVibe. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
