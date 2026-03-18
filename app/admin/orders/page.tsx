"use client"

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchOrders } from "@/lib/queries"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"
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

const statusOptions = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]

export default function AdminOrdersPage() {
  const queryClient = useQueryClient()

  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
  })

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      const supabase = createClient()
      const { error } = await supabase.from("orders").update({ status }).eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "orders"] })
      toast.success("Order status updated")
    },
    onError: () => {
      toast.error("Failed to update order status")
    },
  })

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold lg:text-3xl">Orders</h1>
      <p className="mt-1 text-muted-foreground">Manage customer orders</p>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-serif">All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="rounded-lg border border-border p-4"
                >
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
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
                    </div>
                    <div className="flex items-center gap-4">
                      <p className="font-semibold">{formatPHP(order.total_amount)}</p>
                      <Select
                        value={order.status}
                        onValueChange={(value) =>
                          updateStatus.mutate({ id: order.id, status: value })
                        }
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {statusOptions.map((status) => (
                            <SelectItem key={status} value={status}>
                              {statusLabels[status]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="mt-4 border-t border-border pt-4">
                    <p className="text-sm">
                      <span className="font-medium">Delivery Address:</span>{" "}
                      <span className="text-muted-foreground">{order.delivery_address}</span>
                    </p>
                    <p className="text-sm">
                      <span className="font-medium">Phone:</span>{" "}
                      <span className="text-muted-foreground">{order.delivery_phone}</span>
                    </p>
                    {order.delivery_notes && (
                      <p className="text-sm">
                        <span className="font-medium">Notes:</span>{" "}
                        <span className="text-muted-foreground">{order.delivery_notes}</span>
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
