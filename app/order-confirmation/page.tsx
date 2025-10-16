"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { CheckCircle2 } from "lucide-react"

function OrderConfirmationContent() {
  const searchParams = useSearchParams()
  const [orderNumber, setOrderNumber] = useState<string | null>(null)

  useEffect(() => {
    const number = searchParams.get("orderNumber")
    setOrderNumber(number)
  }, [searchParams])

  return (
    <div className="flex min-h-screen flex-col">
      <Header />

      <main className="flex flex-1 items-center justify-center">
        <div className="mx-auto max-w-md px-4 text-center">
          <div className="mb-6 flex justify-center">
            <CheckCircle2 className="h-20 w-20 text-green-600" />
          </div>

          <h1 className="mb-4 text-3xl font-bold tracking-tight">Order Confirmed!</h1>

          <p className="mb-2 text-lg text-muted-foreground">Thank you for your order.</p>

          {orderNumber && (
            <div className="mb-6 rounded-lg border bg-secondary/30 p-4">
              <p className="text-sm text-muted-foreground">Order Number</p>
              <p className="text-xl font-bold">{orderNumber}</p>
            </div>
          )}

          <p className="mb-8 text-sm text-muted-foreground leading-relaxed">
            We've received your order and will begin processing it shortly. You'll receive a confirmation email at the
            address you provided.
          </p>

          <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
            <Button asChild size="lg">
              <Link href="/products">Continue Shopping</Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function OrderConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex flex-1 items-center justify-center">
            <p>Loading...</p>
          </main>
          <Footer />
        </div>
      }
    >
      <OrderConfirmationContent />
    </Suspense>
  )
}
