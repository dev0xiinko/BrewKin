"use client"

import { useEffect, useState } from "react"

export function useServiceWorker() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
      return
    }

    // Register service worker
    navigator.serviceWorker
      .register("/sw.js")
      .then((reg) => {
        setRegistration(reg)
        setIsInstalled(true)

        // Check for updates
        reg.addEventListener("updatefound", () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error("Service worker registration failed:", error)
      })

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener("message", (event) => {
      if (event.data?.type === "SYNC_REQUESTED") {
        // Trigger sync from the app
        window.dispatchEvent(new CustomEvent("sw-sync-requested"))
      }
    })
  }, [])

  const update = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" })
      window.location.reload()
    }
  }

  return { isInstalled, updateAvailable, update }
}
