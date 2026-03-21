import Link from "next/link"
import Image from "next/image"

export function StoreFooter() {
  return (
    <footer className="bg-primary text-primary-foreground">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 overflow-hidden">
                <Image
                  src="/images/brewkin-logo.png"
                  alt="CJ BrewKin"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-lg font-bold tracking-wide">CJ BREWKIN</span>
                <span className="text-[10px] uppercase tracking-[0.2em] text-primary-foreground/70">Coffee Co.</span>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-primary-foreground/70">
              Premium artisan coffee, crafted with passion and delivered fresh to your door. Est. 2024
            </p>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.2em]">Quick Links</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>
                <Link href="/menu" className="transition-colors hover:text-primary-foreground">
                  Our Menu
                </Link>
              </li>
              <li>
                <Link href="/about" className="transition-colors hover:text-primary-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/orders" className="transition-colors hover:text-primary-foreground">
                  Track Order
                </Link>
              </li>
              <li>
                <Link href="/account" className="transition-colors hover:text-primary-foreground">
                  My Account
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.2em]">Contact</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>Cebu City, Cebu, Philippines</li>
              <li>cjbrewkin@gmail.com</li>
              <li>+63 917 123 4567</li>
            </ul>
          </div>

          <div>
            <h4 className="mb-6 text-xs font-bold uppercase tracking-[0.2em]">Store Hours</h4>
            <ul className="space-y-3 text-sm text-primary-foreground/70">
              <li>Mon - Fri: 6am - 8pm</li>
              <li>Saturday: 7am - 9pm</li>
              <li>Sunday: 8am - 6pm</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-primary-foreground/20 pt-8 text-center text-sm text-primary-foreground/60">
          <p>&copy; {new Date().getFullYear()} CJ BrewKin Coffee Co. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
