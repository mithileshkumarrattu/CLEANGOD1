"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { Home, Search, ShoppingBag, Calendar, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/auth-context"

const navItems = [
  { href: "/", icon: Home, label: "Home" },
  { href: "/services", icon: Search, label: "Services" },
  { href: "/cart", icon: ShoppingBag, label: "Cart" },
  { href: "/orders", icon: Calendar, label: "Orders" },
  { href: "/profile", icon: User, label: "Profile" },
]

export function MobileBottomNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  // Don't show on auth pages or admin pages
  if (pathname.startsWith("/auth") || pathname.startsWith("/admin")) {
    return null
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 pb-safe">
      <div className="mx-3 mb-3 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl">
        <nav className="flex items-center justify-around px-1 py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.href}
                href={user || item.href === "/" || item.href === "/services" ? item.href : "/auth/login"}
                className={cn(
                  "flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 min-w-[60px]",
                  isActive
                    ? "bg-[#2DCE89] text-white scale-105 shadow-lg"
                    : "text-gray-600 hover:text-[#2DCE89] hover:bg-[#F1FCF7] active:scale-95",
                )}
              >
                <Icon className={cn("h-5 w-5 mb-1", isActive && "animate-pulse")} />
                <span className={cn("text-xs font-medium", isActive ? "text-white" : "text-gray-600")}>
                  {item.label}
                </span>
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
