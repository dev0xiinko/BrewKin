"use client"

import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import type { Product } from "@/lib/types"
import { formatPHP } from "@/lib/utils"

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="group flex flex-col overflow-hidden border border-border bg-card transition-all hover:shadow-lg">
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-secondary">
            <span className="text-6xl text-primary/30">&#9749;</span>
          </div>
        )}
        {product.category && (
          <div className="absolute left-0 top-4 bg-primary px-3 py-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary-foreground">
              {product.category.name}
            </span>
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-xl font-semibold tracking-tight text-foreground">{product.name}</h3>
        {product.description && (
          <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
        )}
        <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
          <span className="text-xl font-bold text-primary">{formatPHP(product.price)}</span>
          <Link href={`/menu/${product.id}`}>
            <Button size="sm" className="uppercase tracking-wider">Order</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
