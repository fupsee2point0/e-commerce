import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Product Not Found</h2>
        <p className="mt-2 text-muted-foreground">The product you're looking for doesn't exist.</p>
        <Button asChild className="mt-4">
          <Link href="/admin_panel/products">Back to Products</Link>
        </Button>
      </div>
    </div>
  )
}
