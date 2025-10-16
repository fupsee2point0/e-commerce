import { createServiceRoleClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createServiceRoleClient()
    const { isActive } = await request.json()

    const { error } = await supabase
      .from("products")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", params.id)

    if (error) {
      console.error("[v0] Error toggling product status:", error)
      return NextResponse.json({ error: "Failed to update product status" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error in toggle-status route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
