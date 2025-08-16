"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Shield } from "lucide-react"

const ADMIN_EMAIL = "rattumethelesh@gmail.com"

export default function AdminLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  useEffect(() => {
    // Check if admin is already logged in
    const checkAdminAuth = () => {
      const isAdminLoggedIn = localStorage.getItem("isAdminLoggedIn")
      const adminEmail = localStorage.getItem("adminEmail")
      if (isAdminLoggedIn === "true" && adminEmail === ADMIN_EMAIL) {
        router.push("/admin/dashboard")
      } else {
        setIsCheckingAuth(false)
      }
    }

    // Small delay to prevent flashing
    const timer = setTimeout(checkAdminAuth, 100)
    return () => clearTimeout(timer)
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      if (email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
        localStorage.setItem("isAdminLoggedIn", "true")
        localStorage.setItem("adminEmail", email)
        router.push("/admin/dashboard")
      } else {
        setError("Access denied. Only authorized admin email can access this dashboard.")
      }
    } catch (error: any) {
      setError("Login failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  // Show loading while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-secondary/5 to-accent/5 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <CardTitle className="text-2xl font-bold font-serif">CleanGod Admin</CardTitle>
          <p className="text-muted-foreground">Enter your authorized email to access the admin dashboard</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Admin Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your admin email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full h-11" disabled={isLoading}>
              {isLoading ? "Verifying..." : "Access Admin Dashboard"}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>Only authorized admin emails can access this dashboard</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
