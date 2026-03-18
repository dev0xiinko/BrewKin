"use client"

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import {
  initializeOfflineData,
  backgroundSync,
  processSyncQueue,
  subscribeSyncStatus,
} from "./sync-service"
import { db } from "./db"

interface OfflineContextType {
  isOnline: boolean
  isSyncing: boolean
  pendingSyncCount: number
  lastSyncError: string | null
  triggerSync: () => Promise<void>
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined)

export function OfflineProvider({ children }: { children: ReactNode }) {
  const [isOnline, setIsOnline] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [pendingSyncCount, setPendingSyncCount] = useState(0)
  const [lastSyncError, setLastSyncError] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  // Initialize online status
  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsOnline(navigator.onLine)
    }
  }, [])

  // Listen for online/offline events
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true)
      // Trigger sync when coming back online
      backgroundSync().catch(console.error)
    }

    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)

    return () => {
      window.removeEventListener("online", handleOnline)
      window.removeEventListener("offline", handleOffline)
    }
  }, [])

  // Subscribe to sync status changes
  useEffect(() => {
    const unsubscribe = subscribeSyncStatus((status, count) => {
      setIsSyncing(status === "syncing")
      setPendingSyncCount(count)
      if (status === "error") {
        setLastSyncError("Some changes failed to sync")
      } else {
        setLastSyncError(null)
      }
    })

    return unsubscribe
  }, [])

  // Initialize offline data on mount
  useEffect(() => {
    if (!initialized) {
      initializeOfflineData()
        .then(() => {
          setInitialized(true)
          // Get initial pending count
          db.syncQueue.count().then(setPendingSyncCount)
        })
        .catch(console.error)
    }
  }, [initialized])

  // Periodic sync when online
  useEffect(() => {
    if (!isOnline) return

    const syncInterval = setInterval(() => {
      backgroundSync().catch(console.error)
    }, 60000) // Sync every minute when online

    return () => clearInterval(syncInterval)
  }, [isOnline])

  const triggerSync = useCallback(async () => {
    if (!isOnline) return
    setIsSyncing(true)
    try {
      await processSyncQueue()
      await backgroundSync()
    } catch (error) {
      setLastSyncError(error instanceof Error ? error.message : "Sync failed")
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline])

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        isSyncing,
        pendingSyncCount,
        lastSyncError,
        triggerSync,
      }}
    >
      {children}
    </OfflineContext.Provider>
  )
}

export function useOffline() {
  const context = useContext(OfflineContext)
  if (!context) {
    throw new Error("useOffline must be used within an OfflineProvider")
  }
  return context
}
