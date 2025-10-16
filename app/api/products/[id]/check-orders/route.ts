import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceRoleClient()

    const { data: orderItems, error } = await supabase
      .from("order_items")
      .select("id, orders!inner(status)")
      .eq("product_id", params.id)
      .in("orders.status", ["pending", "processing"])
      .limit(1)

    if (error) {
      console.error("[v0] Error checking orders:", error)
      return NextResponse.json({ error: "Failed to check orders" }, { status: 500 })
    }

    return NextResponse.json({
      hasPendingOrders: orderItems && orderItems.length > 0,
    })
  } catch (error) {
    console.error("[v0] Error in check-orders route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
