// Re-export offline-first query functions
// These use IndexedDB as primary cache and sync with Supabase

export {
  getProducts as fetchProducts,
  getAvailableProducts as fetchAvailableProducts,
  getProduct as fetchProduct,
  getCategories as fetchCategories,
  getAddons as fetchAddons,
  getAvailableAddons as fetchAvailableAddons,
  getOrders as fetchOrders,
  getUserOrders as fetchUserOrders,
  getSuppliers as fetchSuppliers,
  getSupplies as fetchSupplies,
  getProfile as fetchProfile,
  checkIsAdmin,
} from "./offline-queries"

import { createClient } from "@/lib/supabase/client"
import type { Order } from "./types"

import type { Review, ProductFeedback } from "./types"

const supabase = createClient()

// Fetch average star rating for landing page
export async function fetchAverageReviewRating(): Promise<number | null> {
  const { data, error } = await supabase
    .from("reviews")
    .select("avg(rating)")
    .single()
  if (error) throw error
  return data ? data.avg : null
}

// Fetch paginated product feedbacks for a product
export async function fetchProductFeedbacks(productId: string, page: number = 1, pageSize: number = 3): Promise<{ feedbacks: ProductFeedback[]; total: number }> {
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  const { data, error, count } = await supabase
    .from("product_feedbacks")
    .select("*", { count: "exact" })
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .range(from, to)
  if (error) throw error
  return { feedbacks: data || [], total: count || 0 }
}

// This function still needs network for the joined query
export async function fetchOrderWithItems(orderId: string): Promise<Order | null> {
  const { data, error } = await supabase
    .from("orders")
    .select(`
      *,
      items:order_items(
        *,
        product:products(*),
        addons:order_item_addons(*, addon:addons(*))
      )
    `)
    .eq("id", orderId)
    .single()
  if (error) throw error
  return data
}
