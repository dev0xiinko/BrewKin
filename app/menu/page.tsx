"use client"

import { useQuery } from "@tanstack/react-query"
import { fetchAvailableProducts, fetchCategories } from "@/lib/queries"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useState } from "react"

export default function MenuPage() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [search, setSearch] = useState("")

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["products", "available"],
    queryFn: fetchAvailableProducts,
  })

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  })

  const filteredProducts = (products || [])
    .filter((p) =>
      (!selectedCategory || p.category_id === selectedCategory) &&
      (search.trim() === "" ||
        p.name.toLowerCase().includes(search.trim().toLowerCase()) ||
        (p.description?.toLowerCase().includes(search.trim().toLowerCase()) ?? false))
    )

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1">
        <div className="bg-secondary py-16">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Handcrafted Beverages</p>
            <h1 className="mt-2 font-serif text-4xl font-bold md:text-5xl">Our Menu</h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Explore our handcrafted selection of premium coffee drinks, each made with care and the finest ingredients.
            </p>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-6 py-12">
          {/* Search Bar */}
          <div className="mb-6 flex justify-center">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search for a drink..."
              className="w-full max-w-md rounded border border-border px-4 py-2 text-base focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          {/* Category Filter */}
          <div className="mb-10 flex flex-wrap gap-3 border-b border-border pb-6">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              onClick={() => setSelectedCategory(null)}
              className="uppercase tracking-wider"
            >
              All
            </Button>
            {categoriesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-28" />
                ))
              : categories?.map((cat) => (
                  <Button
                    key={cat.id}
                    variant={selectedCategory === cat.id ? "default" : "outline"}
                    onClick={() => setSelectedCategory(cat.id)}
                    className="uppercase tracking-wider"
                  >
                    {cat.name}
                  </Button>
                ))}
          </div>

          {/* Products Grid */}
          {productsLoading ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="space-y-4">
                  <Skeleton className="aspect-square w-full" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredProducts && filteredProducts.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="py-20 text-center">
              <p className="text-lg text-muted-foreground">No products found in this category.</p>
            </div>
          )}
        </div>
      </main>

      <StoreFooter />
    </div>
  )
}
