import { createClient } from "@/lib/supabase/server"
import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { ProductCard } from "@/components/product-card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Truck, Coffee, Award } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import type { Product } from "@/lib/types"

export default async function HomePage() {
  const supabase = await createClient()
  const { data: featuredProducts } = await supabase
    .from("products")
    .select("*, category:categories(*)")
    .eq("is_available", true)
    .gt("stock_quantity", 0)
    .limit(4)

  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1">
        {/* Hero Section with Cover Image */}
        <section className="relative min-h-[75vh] overflow-hidden md:min-h-[85vh]">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/hero-cover.png"
              alt="CJ BrewKin Coffee Co. - Local & Artisan Coffee Est. 2024"
              fill
              className="object-cover object-center"
              priority
            />
            {/* Dark Overlay */}
            <div className="absolute inset-0 bg-black/50" />
          </div>
          
          {/* Hero Content */}
          <div className="relative flex min-h-[75vh] flex-col items-center justify-center md:min-h-[85vh]">
            <div className="mx-auto max-w-4xl px-6 text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-white/80">Est. 2024</p>
              <h1 className="mt-4 font-serif text-4xl font-bold tracking-tight text-white md:text-6xl lg:text-7xl">
                <span className="text-balance">Local & Artisan</span>
                <br />
                <span className="text-white">Coffee Experience</span>
              </h1>
              <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-white/80 text-pretty md:text-lg">
                Premium beans, expertly roasted, delivered right to your doorstep.
              </p>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link href="/menu">
                  <Button size="lg" className="gap-2 bg-white px-8 text-primary hover:bg-white/90">
                    <span className="font-semibold uppercase tracking-wider">Browse Menu</span>
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button variant="outline" size="lg" className="border-2 border-white bg-transparent px-8 text-white hover:bg-white hover:text-primary">
                    <span className="font-semibold uppercase tracking-wider">Join Us</span>
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="bg-secondary py-20">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center bg-primary">
                  <Coffee className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold">Premium Beans</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Sourced from the finest coffee farms in the Philippines and around the world
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center bg-primary">
                  <Award className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold">Expert Roasting</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Crafted by master roasters with decades of combined experience
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center bg-primary">
                  <Truck className="h-8 w-8 text-primary-foreground" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold">Fast Delivery</h3>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  Get your fresh coffee delivered to your door within Metro Manila
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-20 md:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <div className="flex items-end justify-between border-b border-border pb-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">Handcrafted</p>
                <h2 className="mt-2 font-serif text-3xl font-bold md:text-4xl">Featured Drinks</h2>
              </div>
              <Link href="/menu">
                <Button variant="outline" className="gap-2 uppercase tracking-wider">
                  View All
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
            <div className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {(featuredProducts as Product[])?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-20 text-primary-foreground">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-foreground/70">Start Your Day Right</p>
            <h2 className="mt-4 font-serif text-3xl font-bold md:text-4xl">Ready to Experience CJ BrewKin?</h2>
            <p className="mx-auto mt-6 max-w-xl leading-relaxed text-primary-foreground/80">
              Join thousands of coffee lovers who start their morning with our premium handcrafted beverages.
            </p>
            <Link href="/menu">
              <Button size="lg" className="mt-10 bg-white px-10 text-primary hover:bg-white/90">
                <span className="font-semibold uppercase tracking-wider">Order Now</span>
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  )
}
