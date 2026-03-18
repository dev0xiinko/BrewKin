import { db, addToSyncQueue } from "./db"
import {
  fetchAndCacheProducts,
  fetchAndCacheCategories,
  fetchAndCacheAddons,
  fetchAndCacheOrders,
  fetchAndCacheSuppliers,
  fetchAndCacheSupplies,
} from "./sync-service"
import { createClient } from "@/lib/supabase/client"
import type { Product, Category, Addon, Order, Supplier, Supply, Profile } from "./types"

const supabase = createClient()

// Offline-first data fetching functions
// These try cache first, then network, falling back to cache on error

export async function getProducts(): Promise<Product[]> {
  // Try to get from cache first
  const cached = await db.products.orderBy("name").toArray()
  
  // If online, refresh in background
  if (navigator.onLine) {
    fetchAndCacheProducts().catch(console.error)
  }
  
  // Return cached data immediately if available
  if (cached.length > 0) return cached
  
  // Otherwise wait for network
  return fetchAndCacheProducts()
}

export async function getAvailableProducts(): Promise<Product[]> {
  const cached = await db.products
    .where("is_available")
    .equals(1) // Dexie stores booleans as 1/0
    .toArray()
  
  // Filter for stock quantity (can't index this easily with compound conditions)
  const available = cached.filter(p => p.is_available && p.stock_quantity > 0)
  
  if (navigator.onLine) {
    fetchAndCacheProducts().catch(console.error)
  }
  
  if (available.length > 0) return available
  
  const fresh = await fetchAndCacheProducts()
  return fresh.filter(p => p.is_available && p.stock_quantity > 0)
}

export async function getProduct(id: string): Promise<Product | null> {
  const cached = await db.products.get(id)
  
  if (navigator.onLine) {
    fetchAndCacheProducts().catch(console.error)
  }
  
  if (cached) return cached
  
  // Fetch from network if not in cache
  const { data, error } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("id", id)
    .single()
  
  if (error) return null
  if (data) await db.products.put(data)
  return data
}

export async function getCategories(): Promise<Category[]> {
  const cached = await db.categories.orderBy("name").toArray()
  
  if (navigator.onLine) {
    fetchAndCacheCategories().catch(console.error)
  }
  
  if (cached.length > 0) return cached
  return fetchAndCacheCategories()
}

export async function getAddons(): Promise<Addon[]> {
  const cached = await db.addons.orderBy("name").toArray()
  
  if (navigator.onLine) {
    fetchAndCacheAddons().catch(console.error)
  }
  
  if (cached.length > 0) return cached
  return fetchAndCacheAddons()
}

export async function getAvailableAddons(): Promise<Addon[]> {
  const cached = await db.addons.toArray()
  const available = cached.filter(a => a.is_available)
  
  if (navigator.onLine) {
    fetchAndCacheAddons().catch(console.error)
  }
  
  if (available.length > 0) return available
  
  const fresh = await fetchAndCacheAddons()
  return fresh.filter(a => a.is_available)
}

export async function getOrders(): Promise<Order[]> {
  const cached = await db.orders.reverse().sortBy("created_at")
  
  if (navigator.onLine) {
    fetchAndCacheOrders().catch(console.error)
  }
  
  if (cached.length > 0) return cached
  return fetchAndCacheOrders()
}

export async function getUserOrders(userId: string): Promise<Order[]> {
  const cached = await db.orders.where("user_id").equals(userId).toArray()
  const sorted = cached.sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  
  if (navigator.onLine) {
    fetchAndCacheOrders(userId).catch(console.error)
  }
  
  if (sorted.length > 0) return sorted
  return fetchAndCacheOrders(userId)
}

export async function getSuppliers(): Promise<Supplier[]> {
  const cached = await db.suppliers.orderBy("name").toArray()

  if (navigator.onLine) {
    fetchAndCacheSuppliers(50, 0).catch(console.error)
  }

  if (cached.length > 0) return cached
  return fetchAndCacheSuppliers(50, 0)
}

export async function getSupplies(): Promise<Supply[]> {
  const cached = await db.supplies.orderBy("name").toArray()
  
  if (navigator.onLine) {
    fetchAndCacheSupplies().catch(console.error)
  }
  
  if (cached.length > 0) return cached
  return fetchAndCacheSupplies()
}

// Offline-capable write operations
// These save locally first, then queue for sync

export async function createOrder(orderData: Partial<Order>): Promise<Order> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  const order: Order = {
    id,
    user_id: orderData.user_id || "",
    status: "pending",
    total_amount: orderData.total_amount || 0,
    delivery_address: orderData.delivery_address || "",
    delivery_phone: orderData.delivery_phone || "",
    delivery_notes: orderData.delivery_notes || null,
    created_at: now,
    updated_at: now,
    ...orderData,
  } as Order
  
  // Save locally
  await db.orders.put(order)
  
  // Queue for sync
  await addToSyncQueue("orders", "create", order as unknown as Record<string, unknown>)
  
  return order
}

export async function updateProduct(id: string, data: Partial<Product>): Promise<void> {
  // Update locally
  await db.products.update(id, { ...data, updated_at: new Date().toISOString() })
  
  // Queue for sync
  await addToSyncQueue("products", "update", { id, ...data })
}

export async function updateSupply(id: string, data: Partial<Supply>): Promise<void> {
  // Update locally
  await db.supplies.update(id, { ...data, updated_at: new Date().toISOString() })
  
  // Queue for sync
  await addToSyncQueue("supplies", "update", { id, ...data })
}

export async function createSupplier(data: Partial<Supplier>): Promise<Supplier> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  const supplier: Supplier = {
    id,
    name: data.name || "",
    contact_person: data.contact_person || null,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    created_at: now,
  }
  
  // Save locally
  await db.suppliers.put(supplier)
  
  // Queue for sync
  await addToSyncQueue("suppliers", "create", supplier as unknown as Record<string, unknown>)
  
  return supplier
}

export async function createSupply(data: Partial<Supply>): Promise<Supply> {
  const id = crypto.randomUUID()
  const now = new Date().toISOString()
  
  const supply: Supply = {
    id,
    name: data.name || "",
    quantity: data.quantity || 0,
    unit: data.unit || "",
    reorder_level: data.reorder_level || 0,
    supplier_id: data.supplier_id || null,
    last_restocked: null,
    created_at: now,
    updated_at: now,
  }
  
  // Save locally
  await db.supplies.put(supply)
  
  // Queue for sync
  await addToSyncQueue("supplies", "create", supply as unknown as Record<string, unknown>)
  
  return supply
}

export async function getProfile(userId: string): Promise<Profile | null> {
  const cached = await db.profiles.get(userId)
  if (cached) return cached
  
  const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single()
  if (error) return null
  if (data) await db.profiles.put(data)
  return data
}

export async function checkIsAdmin(userId: string): Promise<boolean> {
  const profile = await getProfile(userId)
  return profile?.is_admin || false
}
