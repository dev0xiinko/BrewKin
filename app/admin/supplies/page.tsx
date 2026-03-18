"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { fetchSupplies, fetchSuppliers } from "@/lib/queries"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus, Pencil, Loader2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import type { Supply } from "@/lib/types"

export default function AdminSuppliesPage() {
  const queryClient = useQueryClient()
  const [isOpen, setIsOpen] = useState(false)
  const [editingSupply, setEditingSupply] = useState<Supply | null>(null)
  const [form, setForm] = useState({
    name: "",
    quantity: "",
    unit: "",
    reorder_level: "",
    supplier_id: "",
  })

  const { data: supplies, isLoading } = useQuery({
    queryKey: ["admin", "supplies"],
    queryFn: fetchSupplies,
  })

  const { data: suppliers } = useQuery({
    queryKey: ["suppliers"],
    queryFn: fetchSuppliers,
  })

  const saveMutation = useMutation({
    mutationFn: async (data: typeof form & { id?: string }) => {
      const supabase = createClient()
      const supplyData = {
        name: data.name,
        quantity: parseInt(data.quantity) || 0,
        unit: data.unit,
        reorder_level: parseInt(data.reorder_level) || 0,
        supplier_id: data.supplier_id || null,
      }

      if (data.id) {
        const { error } = await supabase
          .from("supplies")
          .update(supplyData)
          .eq("id", data.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from("supplies").insert(supplyData)
        if (error) throw error
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "supplies"] })
      toast.success(editingSupply ? "Supply updated" : "Supply created")
      handleClose()
    },
    onError: () => {
      toast.error("Failed to save supply")
    },
  })

  const restockMutation = useMutation({
    mutationFn: async ({ id, amount }: { id: string; amount: number }) => {
      const supabase = createClient()
      const supply = supplies?.find((s) => s.id === id)
      if (!supply) throw new Error("Supply not found")

      const { error } = await supabase
        .from("supplies")
        .update({
          quantity: supply.quantity + amount,
          last_restocked: new Date().toISOString(),
        })
        .eq("id", id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "supplies"] })
      toast.success("Supply restocked")
    },
    onError: () => {
      toast.error("Failed to restock supply")
    },
  })

  const handleOpen = (supply?: Supply) => {
    if (supply) {
      setEditingSupply(supply)
      setForm({
        name: supply.name,
        quantity: supply.quantity.toString(),
        unit: supply.unit,
        reorder_level: supply.reorder_level.toString(),
        supplier_id: supply.supplier_id || "",
      })
    } else {
      setEditingSupply(null)
      setForm({
        name: "",
        quantity: "",
        unit: "",
        reorder_level: "",
        supplier_id: "",
      })
    }
    setIsOpen(true)
  }

  const handleClose = () => {
    setIsOpen(false)
    setEditingSupply(null)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveMutation.mutate({ ...form, id: editingSupply?.id })
  }

  const handleRestock = (id: string) => {
    const amount = prompt("Enter restock amount:")
    if (amount && !isNaN(parseInt(amount))) {
      restockMutation.mutate({ id, amount: parseInt(amount) })
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-2xl font-bold lg:text-3xl">Supplies</h1>
          <p className="mt-1 text-muted-foreground">Track inventory supplies</p>
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpen()} className="gap-2">
              <Plus className="h-4 w-4" />
              Add Supply
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="font-serif">
                {editingSupply ? "Edit Supply" : "Add New Supply"}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="quantity">Quantity *</Label>
                  <Input
                    id="quantity"
                    type="number"
                    min="0"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="unit">Unit *</Label>
                  <Input
                    id="unit"
                    value={form.unit}
                    onChange={(e) => setForm({ ...form, unit: e.target.value })}
                    placeholder="kg, lbs, bags, etc."
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reorder">Reorder Level</Label>
                <Input
                  id="reorder"
                  type="number"
                  min="0"
                  value={form.reorder_level}
                  onChange={(e) => setForm({ ...form, reorder_level: e.target.value })}
                  placeholder="Alert when stock falls below this"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supplier">Supplier</Label>
                <Select
                  value={form.supplier_id}
                  onValueChange={(value) => setForm({ ...form, supplier_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select supplier" />
                  </SelectTrigger>
                  <SelectContent>
                    {suppliers?.map((supplier) => (
                      <SelectItem key={supplier.id} value={supplier.id}>
                        {supplier.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={saveMutation.isPending}>
                  {saveMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editingSupply ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="font-serif">All Supplies</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : supplies && supplies.length > 0 ? (
            <div className="space-y-3">
              {supplies.map((supply) => {
                const isLow = supply.quantity <= supply.reorder_level
                return (
                  <div
                    key={supply.id}
                    className={`flex items-center justify-between rounded-lg border p-4 ${
                      isLow ? "border-destructive/50 bg-destructive/5" : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      {isLow && <AlertTriangle className="h-5 w-5 text-destructive" />}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{supply.name}</p>
                          {supply.supplier && (
                            <Badge variant="secondary">{supply.supplier.name}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {supply.quantity} {supply.unit} • Reorder at: {supply.reorder_level}
                        </p>
                        {supply.last_restocked && (
                          <p className="text-xs text-muted-foreground">
                            Last restocked:{" "}
                            {new Date(supply.last_restocked).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRestock(supply.id)}
                      >
                        Restock
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleOpen(supply)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-muted-foreground">No supplies yet. Add your first supply!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
