export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  slug: string
  created_at: string
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  base_price: number
  category_id: string
  subcategory_id: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt_text: string | null
  display_order: number
  created_at: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: string | null
  color: string | null
  stock_quantity: number
  price_adjustment: number
  sku: string | null
  created_at: string
  updated_at: string
}

export interface ProductWithDetails extends Product {
  categories: Category
  subcategories: Subcategory | null
  product_images: ProductImage[]
  product_variants: ProductVariant[]
}

export interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_email: string
  customer_phone: string | null
  shipping_address: string
  shipping_city: string
  shipping_postal_code: string
  shipping_country: string
  total_amount: number
  status: string
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  variant_id: string | null
  product_name: string
  size: string | null
  color: string | null
  quantity: number
  unit_price: number
  subtotal: number
  created_at: string
}

export interface CartItem {
  productId: string
  variantId: string | null
  productName: string
  size: string | null
  color: string | null
  quantity: number
  unitPrice: number
  imageUrl: string
}
