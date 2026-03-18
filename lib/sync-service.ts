import { createClient } from "@/lib/supabase/client"
import {
  db,
  getSyncQueueItems,
  removeSyncQueueItem,
  updateSyncQueueItemRetry,
  setLastSyncTime,
  type SyncQueueItem,
} from "./db"
import type { Product, Category, Addon, Order, Supplier, Supply } from "./types"

const MAX_RETRY_COUNT = 5
const supabase = createClient()

// Sync status tracking
type SyncStatus = "idle" | "syncing" | "error"
let syncStatus: SyncStatus = "idle"
let syncListeners: Set<(status: SyncStatus, pendingCount: number) => void> = new Set()

export function subscribeSyncStatus(
  callback: (status: SyncStatus, pendingCount: number) => void
): () => void {
  syncListeners.add(callback)
  return () => syncListeners.delete(callback)
}

async function notifySyncStatus(): Promise<void> {
  const pendingCount = await db.syncQueue.count()
  syncListeners.forEach((cb) => cb(syncStatus, pendingCount))
}

// Fetch and cache data from Supabase
export async function fetchAndCacheProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, category:categories(*)")
      .order("name")
    
    if (error) throw error
    if (data) {
      await db.products.clear()
      await db.products.bulkPut(data)
      await setLastSyncTime("products")
    }
    return data || []
  } catch (error) {
    console.error("Failed to fetch products:", error)
    // Return cached data on error
    return db.products.orderBy("name").toArray()
  }
}

export async function fetchAndCacheCategories(): Promise<Category[]> {
  try {
    const { data, error } = await supabase.from("categories").select("*").order("name")
    if (error) throw error
    if (data) {
      await db.categories.clear()
      await db.categories.bulkPut(data)
      await setLastSyncTime("categories")
    }
    return data || []
  } catch (error) {
    console.error("Failed to fetch categories:", error)
    return db.categories.orderBy("name").toArray()
  }
}

export async function fetchAndCacheAddons(): Promise<Addon[]> {
  try {
    const { data, error } = await supabase.from("addons").select("*").order("name")
    if (error) throw error
    if (data) {
      await db.addons.clear()
      await db.addons.bulkPut(data)
      await setLastSyncTime("addons")
    }
    return data || []
  } catch (error) {
    console.error("Failed to fetch addons:", error)
    return db.addons.orderBy("name").toArray()
  }
}

export async function fetchAndCacheSuppliers(limit = 50, offset = 0): Promise<Supplier[]> {
  try {
    const { data, error } = await supabase
      .from("suppliers")
      .select("*")
      .order("name")
      .range(offset, offset + limit - 1)
    if (error) throw error
    if (data) {
      if (offset === 0) {
        await db.suppliers.clear()
      }
      await db.suppliers.bulkPut(data)
      await setLastSyncTime("suppliers")
    }
    return data || []
  } catch (error) {
    console.error("Failed to fetch suppliers:", error)
    return db.suppliers.orderBy("name").toArray()
  }
}

export async function fetchAndCacheSupplies(): Promise<Supply[]> {
  try {
    const { data, error } = await supabase
      .from("supplies")
      .select("*, supplier:suppliers(*)")
      .order("name")
    if (error) throw error
    if (data) {
      await db.supplies.clear()
      await db.supplies.bulkPut(data)
      await setLastSyncTime("supplies")
    }
    return data || []
  } catch (error) {
    console.error("Failed to fetch supplies:", error)
    return db.supplies.orderBy("name").toArray()
  }
}

export async function fetchAndCacheOrders(userId?: string): Promise<Order[]> {
  try {
    let query = supabase.from("orders").select("*").order("created_at", { ascending: false })
    if (userId) {
      query = query.eq("user_id", userId)
    }
    const { data, error } = await query
    if (error) throw error
    if (data) {
      // Only clear user's orders or all orders
      if (userId) {
        const existingIds = data.map((o) => o.id)
        await db.orders.where("user_id").equals(userId).delete()
        await db.orders.bulkPut(data)
      } else {
        await db.orders.clear()
        await db.orders.bulkPut(data)
      }
      await setLastSyncTime("orders")
    }
    return data || []
  } catch (error) {
    console.error("Failed to fetch orders:", error)
    if (userId) {
      return db.orders.where("user_id").equals(userId).reverse().sortBy("created_at")
    }
    return db.orders.reverse().sortBy("created_at")
  }
}

// Process a single sync queue item
async function processSyncItem(item: SyncQueueItem): Promise<boolean> {
  const { table, action, data, id } = item

  try {
    if (action === "create") {
      const { error } = await supabase.from(table).insert(data)
      if (error) throw error
    } else if (action === "update") {
      const { id: recordId, ...updateData } = data
      const { error } = await supabase.from(table).update(updateData).eq("id", recordId)
      if (error) throw error
    } else if (action === "delete") {
      const { error } = await supabase.from(table).delete().eq("id", data.id)
      if (error) throw error
    }

    // Remove from queue on success
    if (id) await removeSyncQueueItem(id)
    return true
  } catch (error) {
    console.error(`Sync failed for ${table}:${action}:`, error)
    if (id) {
      await updateSyncQueueItemRetry(id, error instanceof Error ? error.message : "Unknown error")
    }
    return false
  }
}

// Process all pending sync items
export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  syncStatus = "syncing"
  await notifySyncStatus()

  const items = await getSyncQueueItems()
  let success = 0
  let failed = 0

  for (const item of items) {
    // Skip items that have exceeded retry limit
    if (item.retryCount >= MAX_RETRY_COUNT) {
      failed++
      continue
    }

    const result = await processSyncItem(item)
    if (result) {
      success++
    } else {
      failed++
    }
  }

  syncStatus = failed > 0 ? "error" : "idle"
  await notifySyncStatus()

  return { success, failed }
}

// Initial data load from cache or network
export async function initializeOfflineData(): Promise<void> {
  // Try to load from cache first, then refresh from network
  const cachedProducts = await db.products.count()
  const cachedCategories = await db.categories.count()
  const cachedAddons = await db.addons.count()

  // If we have no cached data, fetch immediately
  if (cachedProducts === 0) {
    await fetchAndCacheProducts()
  }
  if (cachedCategories === 0) {
    await fetchAndCacheCategories()
  }
  if (cachedAddons === 0) {
    await fetchAndCacheAddons()
  }
}

// Background sync when online
export async function backgroundSync(): Promise<void> {
  if (!navigator.onLine) return

  // First process any pending changes
  await processSyncQueue()

  // Then refresh cached data
  await Promise.all([
    fetchAndCacheProducts(),
    fetchAndCacheCategories(),
    fetchAndCacheAddons(),
    fetchAndCacheSuppliers(),
    fetchAndCacheSupplies(),
  ])
}
