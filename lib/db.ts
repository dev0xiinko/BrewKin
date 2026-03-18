import Dexie, { type EntityTable } from "dexie"
import type { Product, Category, Addon, Order, Supplier, Supply, Profile } from "./types"

// Sync queue item for pending changes
export interface SyncQueueItem {
  id?: number
  table: string
  action: "create" | "update" | "delete"
  data: Record<string, unknown>
  timestamp: number
  retryCount: number
  lastError?: string
}

// Local database with all tables
class CoffeeShopDB extends Dexie {
  products!: EntityTable<Product & { _synced?: boolean }, "id">
  categories!: EntityTable<Category, "id">
  addons!: EntityTable<Addon & { _synced?: boolean }, "id">
  orders!: EntityTable<Order & { _synced?: boolean; _localId?: string }, "id">
  suppliers!: EntityTable<Supplier & { _synced?: boolean }, "id">
  supplies!: EntityTable<Supply & { _synced?: boolean }, "id">
  profiles!: EntityTable<Profile, "id">
  syncQueue!: EntityTable<SyncQueueItem, "id">
  metadata!: EntityTable<{ key: string; value: string }, "key">

  constructor() {
    super("CJBrewkinCoffeeDB")

    this.version(1).stores({
      products: "id, category_id, is_available, name",
      categories: "id, name",
      addons: "id, is_available, name",
      orders: "id, user_id, status, created_at",
      suppliers: "id, name",
      supplies: "id, supplier_id, name",
      profiles: "id",
      syncQueue: "++id, table, action, timestamp",
      metadata: "key",
    })
  }
}

export const db = new CoffeeShopDB()

// Sync queue operations
export async function addToSyncQueue(
  table: string,
  action: "create" | "update" | "delete",
  data: Record<string, unknown>
): Promise<void> {
  await db.syncQueue.add({
    table,
    action,
    data,
    timestamp: Date.now(),
    retryCount: 0,
  })
}

export async function getSyncQueueItems(): Promise<SyncQueueItem[]> {
  return db.syncQueue.orderBy("timestamp").toArray()
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  await db.syncQueue.delete(id)
}

export async function updateSyncQueueItemRetry(
  id: number,
  error: string
): Promise<void> {
  const item = await db.syncQueue.get(id)
  if (item) {
    await db.syncQueue.update(id, {
      retryCount: item.retryCount + 1,
      lastError: error,
    })
  }
}

// Cache metadata
export async function getLastSyncTime(table: string): Promise<number | null> {
  const meta = await db.metadata.get(`lastSync_${table}`)
  return meta ? parseInt(meta.value, 10) : null
}

export async function setLastSyncTime(table: string): Promise<void> {
  await db.metadata.put({ key: `lastSync_${table}`, value: Date.now().toString() })
}

// Clear all cached data
export async function clearAllCachedData(): Promise<void> {
  await db.products.clear()
  await db.categories.clear()
  await db.addons.clear()
  await db.orders.clear()
  await db.suppliers.clear()
  await db.supplies.clear()
  await db.profiles.clear()
  await db.metadata.clear()
}
