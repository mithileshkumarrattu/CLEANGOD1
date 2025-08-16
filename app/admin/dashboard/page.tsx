"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Calendar, Package, DollarSign, Clock, Star, ArrowUpRight } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Booking } from "@/lib/types"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeBookings: 0,
    totalUsers: 0,
    servicesCompleted: 0,
  })
  const [recentBookings, setRecentBookings] = useState<Booking[]>([])
  const [topServices, setTopServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      const [bookings, users, services] = await Promise.all([
        firebaseService.getBookings(),
        firebaseService.getAllUsers(),
        firebaseService.getServices(),
      ])

      // Calculate stats from real data
      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
      const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "in-progress").length
      const servicesCompleted = bookings.filter((b) => b.status === "completed").length

      setStats({
        totalRevenue,
        activeBookings,
        totalUsers: users.length,
        servicesCompleted,
      })

      // Get recent bookings (last 10)
      const sortedBookings = bookings
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 4)
      setRecentBookings(sortedBookings)

      // Calculate top services
      const serviceStats = services
        .map((service) => {
          const serviceBookings = bookings.filter((b) => b.serviceId === service.id)
          const revenue = serviceBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
          return {
            name: service.name,
            bookings: serviceBookings.length,
            revenue: `₹${revenue.toLocaleString()}`,
          }
        })
        .sort((a, b) => b.bookings - a.bookings)
        .slice(0, 4)

      setTopServices(serviceStats)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-gray-100 text-gray-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-serif">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's what's happening with CleanGod today.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
                  <p className="text-2xl font-bold">₹{stats.totalRevenue.toLocaleString()}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Live Data</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Bookings</p>
                  <p className="text-2xl font-bold">{stats.activeBookings}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Live Data</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{stats.totalUsers}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Live Data</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Services Completed</p>
                  <p className="text-2xl font-bold">{stats.servicesCompleted}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <TrendingUp className="h-3 w-3 text-green-600" />
                    <span className="text-xs font-medium text-green-600">Live Data</span>
                  </div>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Package className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Bookings */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Recent Bookings</CardTitle>
                <Button variant="outline" size="sm" onClick={() => (window.location.href = "/admin/bookings")}>
                  View All
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </Button>
              </CardHeader>
              <CardContent>
                {recentBookings.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No bookings yet. Bookings will appear here once customers start booking services.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-medium">{booking.customerName || "Customer"}</h4>
                            <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{booking.serviceName}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-muted-foreground">
                            <span>#{booking.id?.slice(-8)}</span>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-3 w-3" />
                              <span>{new Date(booking.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">₹{booking.totalAmount}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Top Services */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Top Services</CardTitle>
              </CardHeader>
              <CardContent>
                {topServices.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No services data yet. Add services from the Services page.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {topServices.map((service, index) => (
                      <div key={service.name} className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center text-sm font-medium text-primary">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{service.name}</h4>
                          <p className="text-xs text-muted-foreground">{service.bookings} bookings</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-sm">{service.revenue}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent"
                onClick={() => (window.location.href = "/admin/services")}
              >
                <Package className="h-6 w-6" />
                <span className="text-sm">Manage Services</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent"
                onClick={() => (window.location.href = "/admin/users")}
              >
                <Users className="h-6 w-6" />
                <span className="text-sm">Manage Users</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent"
                onClick={() => (window.location.href = "/admin/bookings")}
              >
                <Calendar className="h-6 w-6" />
                <span className="text-sm">View Bookings</span>
              </Button>
              <Button
                variant="outline"
                className="h-20 flex-col space-y-2 bg-transparent"
                onClick={() => (window.location.href = "/admin/products")}
              >
                <Star className="h-6 w-6" />
                <span className="text-sm">Manage Products</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  )
}
