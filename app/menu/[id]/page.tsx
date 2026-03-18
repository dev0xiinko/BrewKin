"use client"

import { useQuery } from "@tanstack/react-query"
import { useParams, useRouter } from "next/navigation"
import { fetchProduct, fetchAvailableAddons } from "@/lib/queries"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Skeleton } from "@/components/ui/skeleton"
import { useCart } from "@/lib/cart-context"
import { useState } from "react"
import { ArrowLeft, Minus, Plus, ShoppingCart } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import type { Addon } from "@/lib/types"
import { toast } from "sonner"
import { formatPHP } from "@/lib/utils"

import { fetchProductFeedbacks } from "@/lib/queries"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useEffect } from "react"

const SIZES = [
  { value: "small" as const, label: "Small", priceAdd: 0 },
  { value: "medium" as const, label: "Medium", priceAdd: 15 },
  { value: "large" as const, label: "Large", priceAdd: 30 },
]

import { createClient } from "@/lib/supabase/client"

export default function ProductPage() {
  const queryClient = useQueryClient()
  // Feedback form state
  const [feedbackText, setFeedbackText] = useState("")
  const [feedbackRating, setFeedbackRating] = useState<number | null>(null)
  const [submittingFeedback, setSubmittingFeedback] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [checkingEligibility, setCheckingEligibility] = useState(true)
  // Feedback pagination state
  const [feedbackPage, setFeedbackPage] = useState(1)
  const pageSize = 3

  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [quantity, setQuantity] = useState(1)
  const [selectedSize, setSelectedSize] = useState<"small" | "medium" | "large">("medium")
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([])
  const [notes, setNotes] = useState("")

  // Check if user can review (has delivered order for this product)
  useEffect(() => {
    async function checkEligibility() {
      setCheckingEligibility(true)
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setCanReview(false)
        setCheckingEligibility(false)
        return
      }
      // Find delivered orders for this user containing this product
      const { data: orders, error } = await supabase
        .from("orders")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "delivered")
      if (error || !orders || orders.length === 0) {
        setCanReview(false)
        setCheckingEligibility(false)
        return
      }
      // Check if any order contains this product
      const orderIds = orders.map((o: any) => o.id)
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("order_id, product_id")
        .in("order_id", orderIds)
        .eq("product_id", params.id)
      setCanReview(items && items.length > 0)
      setCheckingEligibility(false)
    }
    if (params.id) checkEligibility()
  }, [params.id])

  const { data: product, isLoading: productLoading } = useQuery({
    queryKey: ["product", params.id],
    queryFn: () => fetchProduct(params.id as string),
    enabled: !!params.id,
  })

  // Fetch product feedbacks
  const { data: feedbackData, isLoading: feedbackLoading } = useQuery({
    queryKey: ["product-feedbacks", params.id, feedbackPage],
    queryFn: () => fetchProductFeedbacks(params.id as string, feedbackPage, pageSize),
    enabled: !!params.id,
  })

  // Submit feedback mutation
  const submitFeedback = async () => {
    if (!params.id || !feedbackText || !feedbackRating) return
    setSubmittingFeedback(true)
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: params.id,
          feedback: feedbackText,
          rating: feedbackRating,
        }),
      })
      if (!res.ok) {
        let msg = "Could not submit feedback"
        try {
          const data = await res.json()
          if (data && data.error) msg = data.error
        } catch {}
        toast.error(msg)
        return
      }
      setFeedbackText("")
      setFeedbackRating(null)
      queryClient.invalidateQueries(["product-feedbacks", params.id])
      toast.success("Feedback submitted!")
    } catch (e) {
      toast.error("Could not submit feedback")
    } finally {
      setSubmittingFeedback(false)
    }
  }

  const { data: addons, isLoading: addonsLoading } = useQuery({
    queryKey: ["addons", "available"],
    queryFn: fetchAvailableAddons,
  })

  const handleAddonToggle = (addon: Addon) => {
    setSelectedAddons((prev) =>
      prev.some((a) => a.id === addon.id)
        ? prev.filter((a) => a.id !== addon.id)
        : [...prev, addon]
    )
  }

  const calculateTotal = () => {
    if (!product) return 0
    const sizePrice = SIZES.find((s) => s.value === selectedSize)?.priceAdd || 0
    const addonsTotal = selectedAddons.reduce((sum, a) => sum + a.price, 0)
    return (product.price + sizePrice + addonsTotal) * quantity
  }

  const handleAddToCart = () => {
    if (!product) return
    addItem(product, quantity, selectedAddons, selectedSize, notes || undefined)
    toast.success("Added to cart", {
      description: `${quantity}x ${product.name} added to your cart`,
    })
    router.push("/menu")
  }

  if (productLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <Skeleton className="mb-8 h-10 w-32" />
            <div className="grid gap-8 md:grid-cols-2">
              <Skeleton className="aspect-square w-full" />
              <div className="space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-10 w-1/4" />
              </div>
            </div>
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Product Not Found</h1>
            <p className="mt-2 text-muted-foreground">This product does not exist or is unavailable.</p>
            <Link href="/menu">
              <Button className="mt-4">Back to Menu</Button>
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
        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link href="/menu">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Menu
            </Button>
          </Link>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden rounded-lg bg-muted">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center bg-secondary">
                  <span className="text-6xl text-muted-foreground">&#9749;</span>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div>
              <h1 className="font-serif text-3xl font-bold">{product.name}</h1>
              {product.description && (
                <p className="mt-3 text-muted-foreground">{product.description}</p>
              )}
              <p className="mt-4 text-2xl font-bold text-primary">{formatPHP(product.price)}</p>

              {/* Size Selection */}
              <div className="mt-6">
                <Label className="text-sm font-medium">Size</Label>
                <div className="mt-2 flex gap-2">
                  {SIZES.map((size) => (
                    <Button
                      key={size.value}
                      variant={selectedSize === size.value ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedSize(size.value)}
                    >
                      {size.label}
                      {size.priceAdd > 0 && ` (+${formatPHP(size.priceAdd)})`}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              {!addonsLoading && addons && addons.length > 0 && (
                <Card className="mt-6">
                  <CardContent className="pt-4">
                    <Label className="text-sm font-medium">Add-ons</Label>
                    <div className="mt-3 space-y-3">
                      {addons.map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Checkbox
                              id={addon.id}
                              checked={selectedAddons.some((a) => a.id === addon.id)}
                              onCheckedChange={() => handleAddonToggle(addon)}
                            />
                            <Label htmlFor={addon.id} className="cursor-pointer font-normal">
                              {addon.name}
                            </Label>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            +{formatPHP(addon.price)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Special Instructions */}
              <div className="mt-6">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Special Instructions (Optional)
                </Label>
                <Textarea
                  id="notes"
                  placeholder="Any special requests?"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="mt-2"
                  rows={3}
                />
              </div>

              {/* Quantity */}
              <div className="mt-6">
                <Label className="text-sm font-medium">Quantity</Label>
                <div className="mt-2 flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="w-12 text-center text-lg font-medium">{quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity((q) => q + 1)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Add to Cart */}
              <div className="mt-8 flex items-center gap-4">
                <Button size="lg" className="flex-1 gap-2" onClick={handleAddToCart}>
                  <ShoppingCart className="h-5 w-5" />
                  Add to Cart - {formatPHP(calculateTotal())}
                </Button>
              </div>

            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
