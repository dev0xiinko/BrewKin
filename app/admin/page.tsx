"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchProducts, fetchOrders, fetchSupplies } from "@/lib/queries"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Package, ShoppingCart, AlertTriangle, Coins } from "lucide-react"
import { formatPHP } from "@/lib/utils"

export default function AdminDashboard() {
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["admin", "products"],
    queryFn: fetchProducts,
  })

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin", "orders"],
    queryFn: fetchOrders,
  })

  const { data: supplies, isLoading: suppliesLoading } = useQuery({
    queryKey: ["admin", "supplies"],
    queryFn: fetchSupplies,
  })

  const lowStockProducts = products?.filter((p) => p.stock_quantity <= 10) || []
  const lowStockSupplies = supplies?.filter((s) => s.quantity <= s.reorder_level) || []
  const pendingOrders = orders?.filter((o) => o.status === "pending") || []
  const totalRevenue = orders?.reduce((sum, o) => sum + o.total_amount, 0) || 0

  return (
    <div>
      <h1 className="font-serif text-2xl font-bold lg:text-3xl">Dashboard</h1>
      <p className="mt-1 text-muted-foreground">Welcome to CJ BrewKin Admin</p>

      {/* Stats Cards */}
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {productsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{products?.length || 0}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {lowStockProducts.length} low stock
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{pendingOrders.length}</div>
            )}
            <p className="text-xs text-muted-foreground">
              {orders?.length || 0} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {suppliesLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold">{lowStockSupplies.length}</div>
            )}
            <p className="text-xs text-muted-foreground">supplies need reorder</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {ordersLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold">{formatPHP(totalRevenue)}</div>
            )}
            <p className="text-xs text-muted-foreground">from all orders</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Orders */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-serif">Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : orders && orders.length > 0 ? (
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between rounded-lg border border-border p-3"
                >
                  <div>
                    <p className="font-medium">Order #{order.id.slice(0, 8)}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatPHP(order.total_amount)}</p>
                    <p className="text-sm capitalize text-muted-foreground">
                      {order.status.replace("_", " ")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No orders yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Low Stock Alerts */}
      {(lowStockProducts.length > 0 || lowStockSupplies.length > 0) && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="font-serif text-destructive">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                >
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">Product</p>
                  </div>
                  <p className="font-medium text-destructive">
                    {product.stock_quantity} left
                  </p>
                </div>
              ))}
              {lowStockSupplies.map((supply) => (
                <div
                  key={supply.id}
                  className="flex items-center justify-between rounded-lg border border-destructive/30 bg-destructive/5 p-3"
                >
                  <div>
                    <p className="font-medium">{supply.name}</p>
                    <p className="text-sm text-muted-foreground">Supply</p>
                  </div>
                  <p className="font-medium text-destructive">
                    {supply.quantity} {supply.unit} left
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
