"use client"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Download, X } from "lucide-react"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if mobile
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    const isMobileDevice = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
    setIsMobile(isMobileDevice)

    // Handle before install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
      setShowPrompt(true)
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice
        if (outcome === "accepted") {
          setShowPrompt(false)
        }
      } catch (error) {
        console.error("Error during install:", error)
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
  }

  // Only show if mobile and install prompt is available
  if (!isMobile || !deferredPrompt) {
    return null
  }

  return (
    <Dialog open={showPrompt} onOpenChange={setShowPrompt}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Save CJ BrewKin to Your Device
          </DialogTitle>
          <DialogDescription>
            Get quick access to your favorite coffee shop. Add our app to your home screen for the best experience.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            📱 One tap to order your premium coffee anytime, anywhere!
          </p>
          
          <div className="flex gap-3">
            <Button
              onClick={handleInstall}
              className="flex-1 gap-2"
              size="lg"
            >
              <Download className="h-4 w-4" />
              Download App Now
            </Button>
            <Button
              onClick={handleDismiss}
              variant="ghost"
              size="lg"
              className="px-3"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
