export interface Category {
  id: string
  name: string
  description: string | null
  created_at: string
}

export interface Product {
  id: string
  name: string
  description: string | null
  price: number
  image_url: string | null
  category_id: string
  is_available: boolean
  stock_quantity: number
  created_at: string
  updated_at: string
  category?: Category
}

export interface Addon {
  id: string
  name: string
  price: number
  is_available: boolean
  created_at: string
}

export interface CartItem {
  product: Product
  quantity: number
  addons: Addon[]
  size: "small" | "medium" | "large"
  notes?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id: string
  quantity: number
  price: number
  size: string
  notes: string | null
  product?: Product
}

export interface OrderItemAddon {
  id: string
  order_item_id: string
  addon_id: string
  price: number
  addon?: Addon
}

export interface Order {
  id: string
  user_id: string
  status: "pending" | "confirmed" | "preparing" | "out_for_delivery" | "delivered" | "cancelled"
  total_amount: number
  delivery_address: string
  delivery_phone: string
  delivery_notes: string | null
  created_at: string
  updated_at: string
  items?: OrderItem[]
}

export interface Supplier {
  id: string
  name: string
  contact_person: string | null
  email: string | null
  phone: string | null
  address: string | null
  created_at: string
}

export interface Supply {
  id: string
  name: string
  quantity: number
  unit: string
  reorder_level: number
  supplier_id: string | null
  last_restocked: string | null
  created_at: string
  updated_at: string
  supplier?: Supplier
}

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  phone: string | null
  address: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}
