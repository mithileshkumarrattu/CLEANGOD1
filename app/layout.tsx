import type React from "react"
import type { Metadata, Viewport } from "next"
import { Inter, Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { CartProvider } from "@/contexts/cart-context"
import { MobileBottomNav } from "@/components/mobile-bottom-nav"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
})

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "CleanGod - Premium Home Services & Cleaning Products",
  description:
    "Professional cleaning services and premium cleaning products delivered to your doorstep. Magical Wow Clean experience at your fingertips.",
  generator: "CleanGod Platform",
  icons: {
    icon: "/cleangod-favicon.png",
    shortcut: "/cleangod-favicon.png",
    apple: "/cleangod-favicon.png",
  },
  openGraph: {
    title: "CleanGod - Premium Home Services & Cleaning Products",
    description:
      "Professional cleaning services and premium cleaning products delivered to your doorstep. Magical Wow Clean experience at your fingertips.",
    images: ["/cleangod-logo.png"],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} antialiased`}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        <link rel="icon" href="/cleangod-favicon.png" />
      </head>
      <body className="font-sans bg-off-white">
        <AuthProvider>
          <CartProvider>
            <div className="min-h-screen bg-off-white">
              {children}
              <MobileBottomNav />
            </div>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
