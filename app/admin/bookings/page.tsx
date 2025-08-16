"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Eye, Phone, MapPin, Clock, User } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Booking } from "@/lib/types"

export default function AdminBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
    const interval = setInterval(fetchBookings, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchBookings = async () => {
    try {
      setLoading(true)
      const bookingsData = await firebaseService.getBookings()
      console.log("[v0] Fetched bookings data:", bookingsData)

      if (Array.isArray(bookingsData)) {
        setBookings(bookingsData)
      } else {
        console.warn("[v0] Bookings data is not an array:", bookingsData)
        setBookings([])
      }
    } catch (error) {
      console.error("[v0] Error fetching bookings:", error)
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string | undefined) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string | undefined) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "failed":
        return "bg-red-100 text-red-800"
      case "refunded":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const safeString = (value: any): string => {
    if (typeof value === "string") return value
    if (value && typeof value === "object" && value.toString) return value.toString()
    return ""
  }

  const filteredBookings = bookings.filter((booking) => {
    if (!booking) return false

    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      safeString(booking.customerName).toLowerCase().includes(searchLower) ||
      safeString(booking.id).toLowerCase().includes(searchLower) ||
      safeString(booking.serviceName).toLowerCase().includes(searchLower)

    const matchesStatus = statusFilter === "all" || booking.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const updateBookingStatus = async (bookingId: string, newStatus: string) => {
    if (!bookingId) return

    try {
      await firebaseService.updateBooking(bookingId, { status: newStatus })
      await fetchBookings()
    } catch (error) {
      alert("Error updating booking status. Please try again.")
      console.error("Error updating booking status:", error)
    }
  }

  const selectedBooking = bookings.find((b) => b?.id === selectedBookingId) || null

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-serif text-[#1B1F22]">Bookings</h1>
          <p className="text-gray-600">Manage customer bookings and assignments</p>
          <div className="flex items-center mt-2 text-sm text-gray-600">
            <div className="w-2 h-2 bg-[#2DCE89] rounded-full mr-2 animate-pulse"></div>
            <span>Live data - Auto-refreshing every 10 seconds</span>
          </div>
        </div>

        {/* Filters */}
        <Card className="bg-white border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search bookings..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 border-gray-200 focus:border-[#2DCE89]"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 border-gray-200 focus:border-[#2DCE89]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Bookings List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#2DCE89] mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading bookings...</p>
            </div>
          ) : filteredBookings.length === 0 ? (
            <Card className="bg-white border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <p className="text-gray-600">
                  {searchQuery || statusFilter !== "all"
                    ? "No bookings found matching your criteria."
                    : "No bookings found. Bookings will appear here when customers make reservations."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredBookings.map((booking) => (
              <Card key={booking?.id || Math.random()} className="bg-white border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <h3 className="text-lg font-semibold text-[#1B1F22]">
                        #{booking?.id && booking.id.length >= 8 ? booking.id.slice(-8) : booking?.id || "NoID"}
                      </h3>
                      <Badge className={getStatusColor(booking?.status)}>{booking?.status || "pending"}</Badge>
                      <Badge className={getPaymentStatusColor(booking?.paymentStatus)}>
                        {booking?.paymentStatus || "pending"}
                      </Badge>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-[#1B1F22]">₹{booking?.totalAmount || 0}</p>
                      <p className="text-xs text-gray-500">
                        {booking?.createdAt?.seconds
                          ? new Date(booking.createdAt.seconds * 1000).toLocaleDateString()
                          : "Unknown date"}
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {/* Customer Info */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-2">Customer</h4>
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-400" />
                          <span className="font-medium text-[#1B1F22]">
                            {booking?.customerName || "Unknown Customer"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{booking?.customerPhone || "No phone"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Service Info */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-2">Service</h4>
                      <div className="space-y-1">
                        <p className="font-medium text-[#1B1F22]">{booking?.serviceName || "Unknown Service"}</p>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{booking?.duration || 60} mins</span>
                        </div>
                      </div>
                    </div>

                    {/* Schedule & Address */}
                    <div>
                      <h4 className="font-medium text-sm text-gray-500 mb-2">Schedule</h4>
                      <div className="space-y-1">
                        <p className="font-medium text-[#1B1F22]">
                          {booking?.scheduledDate?.seconds
                            ? new Date(booking.scheduledDate.seconds * 1000).toLocaleDateString()
                            : "Not scheduled"}
                        </p>
                        <p className="text-sm text-gray-600">
                          {booking?.scheduledTime?.seconds
                            ? new Date(booking.scheduledTime.seconds * 1000).toLocaleTimeString()
                            : "No time set"}
                        </p>
                        <div className="flex items-start space-x-2">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 shrink-0" />
                          <span className="text-sm text-gray-600">{booking?.address || "No address provided"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions & Details */}
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <div className="flex space-x-2">
                      {booking?.status === "pending" && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "confirmed")}
                          className="bg-[#2DCE89] hover:bg-[#25b377] text-white"
                        >
                          Confirm
                        </Button>
                      )}
                      {booking?.status === "confirmed" && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "in-progress")}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white"
                        >
                          Start Service
                        </Button>
                      )}
                      {booking?.status === "in-progress" && (
                        <Button
                          size="sm"
                          onClick={() => updateBookingStatus(booking.id, "completed")}
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                    <Dialog
                      open={selectedBookingId === booking?.id}
                      onOpenChange={(open) => setSelectedBookingId(open ? booking?.id || null : null)}
                    >
                      <DialogTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-gray-200 text-[#1B1F22] hover:bg-gray-50 bg-transparent"
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          View Details
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle className="text-[#1B1F22]">
                            Booking Details - #
                            {booking?.id && booking.id.length >= 8 ? booking.id.slice(-8) : booking?.id || "NoID"}
                          </DialogTitle>
                        </DialogHeader>
                        {selectedBooking && (
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="font-medium mb-2 text-[#1B1F22]">Customer Information</h4>
                                <div className="space-y-1 text-sm">
                                  <p>Name: {selectedBooking.customerName || "Unknown"}</p>
                                  <p>Phone: {selectedBooking.customerPhone || "Not provided"}</p>
                                  <p>Email: {selectedBooking.customerEmail || "Not provided"}</p>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2 text-[#1B1F22]">Service Details</h4>
                                <div className="space-y-1 text-sm">
                                  <p>Service: {selectedBooking.serviceName || "Unknown"}</p>
                                  <p>Duration: {selectedBooking.duration || 60} minutes</p>
                                  <p>Amount: ₹{selectedBooking.totalAmount || 0}</p>
                                  <p>Status: {selectedBooking.status || "pending"}</p>
                                </div>
                              </div>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2 text-[#1B1F22]">Address</h4>
                              <p className="text-sm">{selectedBooking.address || "No address provided"}</p>
                            </div>
                            {selectedBooking.notes && (
                              <div>
                                <h4 className="font-medium mb-2 text-[#1B1F22]">Special Instructions</h4>
                                <p className="text-sm">{selectedBooking.notes}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
