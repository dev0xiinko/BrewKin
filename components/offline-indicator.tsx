"use client"

import { useOffline } from "@/lib/offline-context"
import { useServiceWorker } from "@/lib/use-service-worker"
import { WifiOff, RefreshCw, Cloud, CloudOff, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useEffect, useState } from "react"

export function OfflineIndicator() {
  const { isOnline, isSyncing, pendingSyncCount, triggerSync } = useOffline()
  const { updateAvailable, update } = useServiceWorker()
  const [showBanner, setShowBanner] = useState(false)

  // Show banner when offline or has pending syncs
  useEffect(() => {
    setShowBanner(!isOnline || pendingSyncCount > 0 || isSyncing)
  }, [isOnline, pendingSyncCount, isSyncing])

  if (!showBanner && !updateAvailable) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4">
      <div className="mx-auto max-w-md space-y-2">
        {/* Update Available Banner */}
        {updateAvailable && (
          <div className="flex items-center justify-between gap-3 bg-accent px-4 py-3 text-accent-foreground shadow-lg">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              <span className="text-sm font-medium">Update available</span>
            </div>
            <Button size="sm" variant="secondary" onClick={update}>
              Update
            </Button>
          </div>
        )}

        {/* Offline Banner */}
        {!isOnline && (
          <div className="flex items-center gap-3 bg-destructive px-4 py-3 text-destructive-foreground shadow-lg">
            <WifiOff className="h-4 w-4 shrink-0" />
            <span className="text-sm font-medium">
              Offline Mode - Changes will sync when connected
            </span>
          </div>
        )}

        {/* Syncing Banner */}
        {isOnline && isSyncing && (
          <div className="flex items-center gap-3 bg-primary px-4 py-3 text-primary-foreground shadow-lg">
            <RefreshCw className="h-4 w-4 shrink-0 animate-spin" />
            <span className="text-sm font-medium">Syncing changes...</span>
          </div>
        )}

        {/* Pending Syncs Banner */}
        {isOnline && !isSyncing && pendingSyncCount > 0 && (
          <div className="flex items-center justify-between gap-3 bg-secondary px-4 py-3 text-secondary-foreground shadow-lg">
            <div className="flex items-center gap-2">
              <CloudOff className="h-4 w-4 shrink-0" />
              <span className="text-sm font-medium">
                {pendingSyncCount} pending {pendingSyncCount === 1 ? "change" : "changes"}
              </span>
            </div>
            <Button size="sm" variant="outline" onClick={triggerSync}>
              <Cloud className="mr-1.5 h-3.5 w-3.5" />
              Sync Now
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
