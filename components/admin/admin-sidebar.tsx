"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Calendar,
  Users,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react"
import { useAuth } from "@/contexts/auth-context"

const navigation = [
  { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { name: "Services", href: "/admin/services", icon: Sparkles },
  { name: "Products", href: "/admin/products", icon: Package },
  { name: "Bookings", href: "/admin/bookings", icon: Calendar },
  { name: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { name: "Users", href: "/admin/users", icon: Users },
  { name: "Analytics", href: "/admin/analytics", icon: BarChart3 },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { signOut } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/admin/login")
  }

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white shadow-md"
        >
          {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-border transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center space-x-2 p-6 border-b">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              CG
            </div>
            <span className="font-bold text-xl text-primary font-serif">CleanGod</span>
            <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded">Admin</span>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link key={item.name} href={item.href} onClick={() => setIsMobileMenuOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              )
            })}
          </nav>

          {/* Sign out */}
          <div className="p-4 border-t">
            <Button variant="ghost" onClick={handleSignOut} className="w-full justify-start text-muted-foreground">
              <LogOut className="h-4 w-4 mr-3" />
              Sign Out
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
      )}
    </>
  )
}
