import type { Metadata, Viewport } from 'next'
import { Sora, Fraunces } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Providers } from '@/components/providers'
import './globals.css'

const sora = Sora({ subsets: ["latin"], variable: '--font-sans' });
const fraunces = Fraunces({ subsets: ["latin"], variable: '--font-serif' });

export const viewport: Viewport = {
  themeColor: '#5c4033',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  title: 'CJ BrewKin Coffee | Premium Artisan Coffee Delivered',
  description: 'Order premium artisan coffee from CJ BrewKin Coffee. Fresh roasted beans, handcrafted drinks, and fast delivery to your door.',
  manifest: '/manifest.json',
  icons: {
    icon: '/images/logo.ico',
    apple: '/images/brewkin-logo.png',
    shortcut: '/images/brewkin-logo.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CJ BrewKin',
  },
  formatDetection: {
    telephone: false,
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${sora.variable} ${fraunces.variable}`}>
      <body className="font-sans antialiased bg-background text-foreground">
        <Providers>
          {children}
        </Providers>
        <Analytics />
      </body>
    </html>
  )
}
