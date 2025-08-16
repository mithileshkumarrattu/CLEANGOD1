"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User, Package, MapPin, Settings, LogOut, UserCircle } from "lucide-react"

export function UserMenu() {
  const { user, signOut } = useAuth()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    setIsOpen(false)
    router.push("/")
  }

  if (!user) {
    return (
      <div className="flex space-x-2">
        <Link href="/auth/login">
          <Button variant="ghost" size="sm">
            Sign In
          </Button>
        </Link>
        <Link href="/auth/register">
          <Button size="sm">Sign Up</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="relative">
      <Button variant="ghost" onClick={() => setIsOpen(!isOpen)} className="flex items-center space-x-2">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-blue-600" />
        </div>
        <div className="hidden md:flex flex-col items-start">
          <span className="text-xs text-gray-500">Hello,</span>
          <span className="text-sm font-medium">{user.name}</span>
        </div>
      </Button>

      {isOpen && (
        <Card className="absolute top-full right-0 mt-2 w-64 z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* User Info */}
              <div className="flex items-center space-x-3 pb-3 border-b">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold">{user.name}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
              </div>

              {/* Menu Items */}
              <div className="space-y-2">
                <Link href="/profile" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <UserCircle className="w-4 h-4 mr-3" />
                    My Profile
                  </Button>
                </Link>

                <Link href="/orders" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Package className="w-4 h-4 mr-3" />
                    My Orders
                  </Button>
                </Link>

                <Link href="/profile#addresses" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <MapPin className="w-4 h-4 mr-3" />
                    Saved Addresses
                  </Button>
                </Link>

                <Link href="/settings" onClick={() => setIsOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-3" />
                    Settings
                  </Button>
                </Link>
              </div>

              {/* Sign Out */}
              <div className="pt-3 border-t">
                <Button onClick={handleSignOut} variant="ghost" className="w-full justify-start text-red-600">
                  <LogOut className="w-4 h-4 mr-3" />
                  Sign Out
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
