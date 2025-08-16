"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { AdminSidebar } from "./admin-sidebar"

const ADMIN_EMAILS = ["rattumethelesh@gmail.com", "terminatortheboss65@gmail.com"]

interface AdminLayoutProps {
  children: React.ReactNode
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace("/auth/login")
        return
      }

      if (!ADMIN_EMAILS.includes(user.email || "")) {
        router.replace("/")
        return
      }
    }
  }, [user, loading, router])

  if (loading || !user || !ADMIN_EMAILS.includes(user.email || "")) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#FAFAFB" }}>
        <div className="text-center">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4"
            style={{ borderColor: "#2DCE89" }}
          ></div>
          <p style={{ color: "#475569" }}>Checking authorization...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFB" }}>
      <AdminSidebar />
      <div className="lg:pl-64">
        <main className="p-4 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
