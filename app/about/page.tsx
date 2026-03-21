import { StoreHeader } from "@/components/store-header"
import { StoreFooter } from "@/components/store-footer"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <StoreHeader />

      <main className="flex-1">
        {/* Page Header */}
        <section className="bg-secondary py-16">
          <div className="mx-auto max-w-4xl px-6">
            <h1 className="font-serif text-4xl font-bold md:text-5xl">About BrewKin Coffee Co.</h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Discover the story, passion, and values behind every cup
            </p>
          </div>
        </section>

        {/* About the Company */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-bold md:text-4xl">About the Company</h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  BrewKin Coffee Co. is a modern coffee brand dedicated to bringing people together through the love of coffee. 
                  Built on the idea of "brewing kinship," the company focuses on quality products, ethical sourcing, and a strong 
                  sense of community. Whether enjoyed at home or shared with others, BrewKin Coffee Co. aims to make every cup 
                  a moment worth savoring.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About the Products */}
        <section className="bg-secondary/50 py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-bold md:text-4xl">About the Products</h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  At BrewKin Coffee Co., we craft premium coffee products designed for both everyday drinkers and passionate 
                  coffee enthusiasts. Our offerings include freshly roasted beans, ground coffee, and specialty blends sourced 
                  from high-quality farms. Each product is carefully selected and roasted to highlight unique flavor profiles—from 
                  rich and bold to smooth and aromatic. We are committed to freshness, sustainability, and delivering a satisfying 
                  coffee experience in every cup.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* About the Owners */}
        <section className="py-16 md:py-24">
          <div className="mx-auto max-w-4xl px-6">
            <div className="space-y-8">
              <div>
                <h2 className="font-serif text-3xl font-bold md:text-4xl">About the Owners</h2>
                <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                  BrewKin Coffee Co. was founded by a group of coffee lovers who share a deep passion for great coffee and 
                  meaningful connections. The owners bring together their expertise in business, creativity, and coffee culture 
                  to build a brand that values quality and community. Their vision is to create a welcoming coffee experience 
                  that feels both personal and authentic.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-primary py-16 text-primary-foreground md:py-24">
          <div className="mx-auto max-w-4xl px-6 text-center">
            <h2 className="font-serif text-3xl font-bold md:text-4xl">Ready to Join Our Community?</h2>
            <p className="mx-auto mt-6 max-w-2xl leading-relaxed text-primary-foreground/80">
              Experience the difference quality coffee and genuine connection can make. Browse our menu and start your journey 
              with BrewKin Coffee Co. today.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/menu">
                <Button size="lg" className="gap-2 bg-white px-8 text-primary hover:bg-white/90">
                  <span className="font-semibold uppercase tracking-wider">Browse Menu</span>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/sign-up">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="border-2 border-white bg-transparent px-8 text-white hover:bg-white hover:text-primary"
                >
                  <span className="font-semibold uppercase tracking-wider">Create Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <StoreFooter />
    </div>
  )
}
