"use client"

import { createContext, useContext, useState, useCallback, useEffect } from "react"
import type { CartItem, Product, Addon } from "./types"

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, quantity: number, addons: Addon[], size: "small" | "medium" | "large", notes?: string) => void
  removeItem: (index: number) => void
  updateQuantity: (index: number, quantity: number) => void
  clearCart: () => void
  totalItems: number
  totalPrice: number
}

const CartContext = createContext<CartContextType | undefined>(undefined)

const SIZE_PRICES = {
  small: 0,
  medium: 0.5,
  large: 1,
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])

  useEffect(() => {
    const saved = localStorage.getItem("cj-brewkin-cart")
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch {
        // ignore
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem("cj-brewkin-cart", JSON.stringify(items))
  }, [items])

  const addItem = useCallback(
    (product: Product, quantity: number, addons: Addon[], size: "small" | "medium" | "large", notes?: string) => {
      setItems((prev) => [...prev, { product, quantity, addons, size, notes }])
    },
    []
  )

  const removeItem = useCallback((index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const updateQuantity = useCallback((index: number, quantity: number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, quantity: Math.max(1, quantity) } : item))
    )
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
  }, [])

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)

  const totalPrice = items.reduce((sum, item) => {
    const basePrice = item.product.price + SIZE_PRICES[item.size]
    const addonsPrice = item.addons.reduce((a, addon) => a + addon.price, 0)
    return sum + (basePrice + addonsPrice) * item.quantity
  }, 0)

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalPrice }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
