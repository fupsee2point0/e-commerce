"use client"

import { useEffect, useState } from "react"
import type { Order, OrderItem } from "@/lib/types"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

interface OrderDetailsDialogProps {
  order: Order
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OrderDetailsDialog({ order, open, onOpenChange }: OrderDetailsDialogProps) {
  const [orderItems, setOrderItems] = useState<OrderItem[]>([])
  const [status, setStatus] = useState(order.status)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (open) {
      loadOrderItems()
      setStatus(order.status)
    }
  }, [open, order.id])

  const loadOrderItems = async () => {
    setIsLoading(true)
    const supabase = createClient()
    const { data } = await supabase.from("order_items").select("*").eq("order_id", order.id)
    setOrderItems((data as OrderItem[]) || [])
    setIsLoading(false)
  }

  const handleUpdateStatus = async () => {
    setIsSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from("orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", order.id)

    if (error) {
      console.error("[v0] Error updating order status:", error)
      alert("Failed to update order status")
    } else {
      alert("Order status updated successfully")
      onOpenChange(false)
      window.location.reload()
    }
    setIsSaving(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>Order #{order.order_number}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Customer Information */}
          <div>
            <h3 className="mb-3 font-semibold">Customer Information</h3>
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Name:</span>
                <span className="col-span-2 font-medium">{order.customer_name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Email:</span>
                <span className="col-span-2">{order.customer_email}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <span className="text-muted-foreground">Phone:</span>
                <span className="col-span-2">{order.customer_phone}</span>
              </div>
            </div>
          </div>

          {/* Shipping Information */}
          <div>
            <h3 className="mb-3 font-semibold">Shipping Address</h3>
            <div className="text-sm">
              <p>{order.shipping_address}</p>
              <p>
                {order.shipping_city}, {order.shipping_postal_code}
              </p>
              <p>{order.shipping_country}</p>
            </div>
          </div>

          {/* Order Items */}
          <div>
            <h3 className="mb-3 font-semibold">Order Items</h3>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : (
              <div className="space-y-3">
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{item.product_name}</p>
                      <div className="mt-1 flex gap-2 text-sm text-muted-foreground">
                        {item.size && <span>Size: {item.size}</span>}
                        {item.color && <span>Color: {item.color}</span>}
                        <span>Qty: {item.quantity}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">৳{Number(item.subtotal).toFixed(2)}</p>
                      <p className="text-sm text-muted-foreground">৳{Number(item.unit_price).toFixed(2)} each</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Notes */}
          {order.notes && (
            <div>
              <h3 className="mb-3 font-semibold">Order Notes</h3>
              <p className="text-sm text-muted-foreground">{order.notes}</p>
            </div>
          )}

          {/* Order Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between text-lg font-bold">
              <span>Total Amount</span>
              <span>৳{Number(order.total_amount).toFixed(2)}</span>
            </div>
          </div>

          {/* Status Update */}
          <div>
            <Label htmlFor="status" className="mb-2 block">
              Order Status
            </Label>
            <div className="flex gap-3">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger id="status" className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="delivered">Delivered</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={handleUpdateStatus} disabled={isSaving || status === order.status}>
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Update Status"
                )}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
