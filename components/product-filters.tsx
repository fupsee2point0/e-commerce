import { createClient } from "@/lib/supabase/server"
import type { Category, Subcategory } from "@/lib/types"
import { FilterSection } from "@/components/filter-section"

export async function ProductFilters() {
  const supabase = await createClient()

  const { data: categories } = await supabase.from("categories").select("*").order("name")

  const { data: subcategories } = await supabase.from("subcategories").select("*").order("name")

  return (
    <div className="space-y-6 rounded-lg border bg-card p-6">
      <div>
        <h2 className="mb-4 text-lg font-semibold">Filters</h2>
      </div>

      <FilterSection
        categories={(categories as Category[]) || []}
        subcategories={(subcategories as Subcategory[]) || []}
      />
    </div>
  )
}
