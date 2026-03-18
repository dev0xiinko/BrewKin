"use client"

import Link from "next/link"
import Image from "next/image"
import { ShoppingCart, User, Menu, X, WifiOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/lib/cart-context"
import { useOffline } from "@/lib/offline-context"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User as SupabaseUser } from "@supabase/supabase-js"

export function StoreHeader() {
  const { totalItems } = useCart()
  const { isOnline } = useOffline()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  return (
    <header className="sticky top-0 z-50 w-full bg-primary shadow-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden">
            <Image
              src="/images/hero-cover.png"
              alt="CJ BrewKin"
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold tracking-wide text-primary-foreground">CJ BREWKIN</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">Coffee Co.</span>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            Home
          </Link>
          <Link href="/menu" className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            Menu
          </Link>
          <Link href="/orders" className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 transition-colors hover:text-primary-foreground">
            Orders
          </Link>
          {!isOnline && (
            <div className="flex items-center gap-1.5 bg-white/20 px-2.5 py-1">
              <WifiOff className="h-3.5 w-3.5 text-primary-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">Offline</span>
            </div>
          )}
        </nav>

        <div className="flex items-center gap-1">
          <Link href="/cart">
            <Button variant="ghost" size="icon" className="relative text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center bg-white text-xs font-bold text-primary">
                  {totalItems}
                </span>
              )}
              <span className="sr-only">Shopping cart</span>
            </Button>
          </Link>

          {user ? (
            <Link href="/account">
              <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <User className="h-5 w-5" />
                <span className="sr-only">Account</span>
              </Button>
            </Link>
          ) : (
            <Link href="/auth/login">
              <Button size="sm" className="ml-2 hidden bg-white text-primary hover:bg-white/90 md:flex">
                Sign In
              </Button>
            </Link>
          )}

          <Button
            variant="ghost"
            size="icon"
            className="text-primary-foreground hover:bg-primary-foreground/10 md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {isMenuOpen && (
        <div className="border-t border-primary-foreground/20 bg-primary px-6 py-6 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/menu"
              className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Menu
            </Link>
            <Link
              href="/orders"
              className="text-sm font-semibold uppercase tracking-wider text-primary-foreground/80 transition-colors hover:text-primary-foreground"
              onClick={() => setIsMenuOpen(false)}
            >
              Orders
            </Link>
            {!user && (
              <Link href="/auth/login" onClick={() => setIsMenuOpen(false)}>
                <Button size="sm" className="mt-2 w-full bg-white text-primary hover:bg-white/90">
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
