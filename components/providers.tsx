"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { useState } from "react"
import { CartProvider } from "@/lib/cart-context"
import { OfflineProvider } from "@/lib/offline-context"
import { OfflineIndicator } from "@/components/offline-indicator"
import { PWAInstallPrompt } from "@/components/pwa-install-prompt"
import { Toaster } from "sonner"

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
            networkMode: "offlineFirst",
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineProvider>
        <CartProvider>
          {children}
          <OfflineIndicator />
          <PWAInstallPrompt />
          <Toaster position="top-right" richColors />
        </CartProvider>
      </OfflineProvider>
    </QueryClientProvider>
  )
}
