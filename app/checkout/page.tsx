"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useCart } from "@/lib/cart-context"
import { createClient } from "@/lib/supabase/client"
import { ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"
import type { User } from "@supabase/supabase-js"
import { formatPHP } from "@/lib/utils"

const SIZE_PRICES = {
  small: 0,
  medium: 15,
  large: 30,
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, totalPrice, clearCart } = useCart()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [form, setForm] = useState({
    address: "",
    phone: "",
    notes: "",
  })

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (!data.user) {
        toast.error("Please sign in to checkout")
        router.push("/auth/login?redirect=/checkout")
      }
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please sign in to place an order")
      return
    }

    if (items.length === 0) {
      toast.error("Your cart is empty")
      return
    }

    if (!form.address.trim() || !form.phone.trim()) {
      toast.error("Please fill in all required fields")
      return
    }

    setIsSubmitting(true)

    try {
      const supabase = createClient()
      const orderTotal = totalPrice + 50

      // Create order with correct column names
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: orderTotal,
          delivery_address: form.address,
          customer_phone: form.phone,
          customer_email: user.email,
          customer_name: user.user_metadata?.full_name || user.email,
          notes: form.notes || null,
          status: "pending",
        })
        .select()
        .single()

      if (orderError) throw orderError

      // Create order items with correct column names
      for (const item of items) {
        const itemPrice = item.product.price + SIZE_PRICES[item.size]
        const itemSubtotal = itemPrice * item.quantity
        
        const { data: orderItem, error: itemError } = await supabase
          .from("order_items")
          .insert({
            order_id: order.id,
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: itemPrice,
            subtotal: itemSubtotal,
          })
          .select()
          .single()

        if (itemError) throw itemError

        // Create order item addons with correct column names
        if (item.addons.length > 0) {
          const addonInserts = item.addons.map((addon) => ({
            order_item_id: orderItem.id,
            addon_id: addon.id,
            addon_name: addon.name,
            addon_price: addon.price,
          }))

          const { error: addonError } = await supabase
            .from("order_item_addons")
            .insert(addonInserts)

          if (addonError) throw addonError
        }
      }

      clearCart()
      toast.success("Order placed successfully!")
      router.push(`/orders/${order.id}`)
    } catch (error) {
      console.error("Checkout error:", error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!user) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex flex-1 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <StoreFooter />
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="font-serif text-2xl font-bold">Your Cart is Empty</h1>
            <p className="mt-2 text-muted-foreground">Add some items before checkout.</p>
            <Link href="/menu">
              <Button className="mt-4">Browse Menu</Button>
            </Link>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1">
        <div className="border-b border-border bg-secondary/30 py-12">
          <div className="mx-auto max-w-4xl px-4">
            <h1 className="font-serif text-3xl font-bold">Checkout</h1>
            <p className="mt-2 text-muted-foreground">Complete your order</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link href="/cart">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Cart
            </Button>
          </Link>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-8 lg:grid-cols-3">
              {/* Delivery Info */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="font-serif">Delivery Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="address">Delivery Address *</Label>
                      <Textarea
                        id="address"
                        placeholder="Enter your full delivery address"
                        value={form.address}
                        onChange={(e) => setForm({ ...form, address: e.target.value })}
                        required
                        rows={3}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="(555) 123-4567"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Delivery Notes (Optional)</Label>
                      <Textarea
                        id="notes"
                        placeholder="Any special delivery instructions?"
                        value={form.notes}
                        onChange={(e) => setForm({ ...form, notes: e.target.value })}
                        rows={2}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Order Summary */}
              <div>
                <Card className="sticky top-24">
                  <CardHeader>
                    <CardTitle className="font-serif">Order Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {items.map((item, index) => {
                        const basePrice = item.product.price + SIZE_PRICES[item.size]
                        const addonsPrice = item.addons.reduce((sum, a) => sum + a.price, 0)
                        const itemTotal = (basePrice + addonsPrice) * item.quantity

                        return (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.quantity}x {item.product.name}
                            </span>
                            <span>{formatPHP(itemTotal)}</span>
                          </div>
                        )
                      })}
                    </div>
                    <div className="mt-4 border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>{formatPHP(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Delivery</span>
                        <span>{formatPHP(50)}</span>
                      </div>
                      <div className="flex justify-between font-semibold pt-2 border-t border-border">
                        <span>Total</span>
                        <span>{formatPHP(totalPrice + 50)}</span>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="mt-6 w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Placing Order...
                        </>
                      ) : (
                        `Place Order - ${formatPHP(totalPrice + 50)}`
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </form>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
