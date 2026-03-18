"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { fetchUserOrders } from "@/lib/queries"
import { createClient } from "@/lib/supabase/client"
import { Package, ArrowRight } from "lucide-react"
import Link from "next/link"
import type { User } from "@supabase/supabase-js"
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

export default function OrdersPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      setLoading(false)
      if (!data.user) {
        router.push("/auth/login?redirect=/orders")
      }
    })
  }, [router])

  const { data: orders, isLoading } = useQuery({
    queryKey: ["orders", user?.id],
    queryFn: () => fetchUserOrders(user!.id),
    enabled: !!user?.id,
  })

  if (loading || !user) {
    return (
      <div className="flex min-h-screen flex-col">
        <StoreHeader />
        <main className="flex-1">
          <div className="mx-auto max-w-4xl px-4 py-8">
            <Skeleton className="h-10 w-48" />
            <div className="mt-8 space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
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
            <h1 className="font-serif text-3xl font-bold">My Orders</h1>
            <p className="mt-2 text-muted-foreground">Track and view your order history</p>
          </div>
        </div>

        <div className="mx-auto max-w-4xl px-4 py-8">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-32 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">Order #{order.id.slice(0, 8)}</h3>
                          <Badge className={statusColors[order.status]}>
                            {statusLabels[order.status]}
                          </Badge>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {new Date(order.created_at).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                        <p className="mt-2 font-medium">{formatPHP(order.total_amount)}</p>
                      </div>
                      <Link href={`/orders/${order.id}`}>
                        <Button variant="outline" className="gap-2">
                          View Details
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <Package className="mx-auto h-16 w-16 text-muted-foreground" />
              <h2 className="mt-4 font-serif text-xl font-semibold">No Orders Yet</h2>
              <p className="mt-2 text-muted-foreground">
                You haven&apos;t placed any orders yet. Start browsing our menu!
              </p>
              <Link href="/menu">
                <Button className="mt-6">Browse Menu</Button>
              </Link>
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
