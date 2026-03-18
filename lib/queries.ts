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

const supabase = createClient()

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
