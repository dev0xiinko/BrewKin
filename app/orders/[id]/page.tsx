
"use client"
import OrderProductReview from "./OrderProductReview"
import ProductFeedbackList from "@/components/ProductFeedbackList"

import { useQuery } from "@tanstack/react-query"
import { useParams } from "next/navigation"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchOrderWithItems } from "@/lib/queries"
import { ArrowLeft, MapPin, Phone, FileText } from "lucide-react"
import Link from "next/link"
import { formatPHP } from "@/lib/utils"

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  preparing: "bg-purple-100 text-purple-800",
  out_for_delivery: "bg-orange-100 text-orange-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
}

const statusLabels: Record<string, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  preparing: "Preparing",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
}

export default function OrderDetailPage() {
  const params = useParams()

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", params.id],
    queryFn: () => fetchOrderWithItems(params.id as string),
    enabled: !!params.id,
  })

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <Skeleton className="mb-6 h-10 w-32" />
            <Skeleton className="h-64 w-full" />
          </div>
        </main>
        <StoreFooter />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex flex-1 items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold">Order Not Found</h1>
            <p className="mt-2 text-muted-foreground">This order does not exist.</p>
            <Link href="/orders">
              <Button className="mt-4">View All Orders</Button>
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
            <div className="flex items-center gap-4">
              <h1 className="font-serif text-3xl font-bold">Order #{order.id.slice(0, 8)}</h1>
              <Badge className={statusColors[order.status]} variant="secondary">
                {statusLabels[order.status]}
              </Badge>
            </div>
            <p className="mt-2 text-muted-foreground">
              Placed on{" "}
              {new Date(order.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8">
          <Link href="/orders">
            <Button variant="ghost" className="mb-6 gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Button>
          </Link>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Order Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Order Items</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(order.items as Array<{
                      id: string
                      quantity: number
                      price: number
                      size: string
                      notes: string | null
                      product: { id: string, name: string } | null
                      addons: Array<{ addon: { name: string } | null; price: number }>
                    }>)?.map((item) => (
                      <div key={item.id} className="flex flex-col border-b border-border pb-4 last:border-0 last:pb-0">
                        <div className="flex justify-between">
                          <div>
                            <h4 className="font-medium">
                              {item.quantity}x {item.product?.name || "Unknown Product"}
                            </h4>
                            <p className="text-sm text-muted-foreground capitalize">{item.size}</p>
                            {item.addons && item.addons.length > 0 && (
                              <p className="text-sm text-muted-foreground">
                                + {item.addons.map((a) => a.addon?.name).filter(Boolean).join(", ")}
                              </p>
                            )}
                            {item.notes && (
                              <p className="text-sm text-muted-foreground italic">Note: {item.notes}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <p className="font-medium">
                              {formatPHP((item.price + (item.addons?.reduce((sum, a) => sum + a.price, 0) || 0)) * item.quantity)}
                            </p>
                          </div>
                        </div>
                        {/* Review Form for delivered orders */}
                        {order.status === "delivered" && item.product?.id && order.id && (
                          <>
                            <OrderProductReview productId={item.product.id} orderId={order.id} />
                            <ProductFeedbackList productId={item.product.id} />
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Delivery Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Address</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_address}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">{order.delivery_phone}</p>
                    </div>
                  </div>
                  {order.delivery_notes && (
                    <div className="flex items-start gap-3">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">Notes</p>
                        <p className="text-sm text-muted-foreground">{order.delivery_notes}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="font-serif">Payment Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Subtotal</span>
                      <span>{formatPHP(order.total_amount - 50)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Delivery</span>
                      <span>{formatPHP(50)}</span>
                    </div>
                    <div className="flex justify-between border-t border-border pt-2 font-semibold">
                      <span>Total</span>
                      <span>{formatPHP(order.total_amount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
