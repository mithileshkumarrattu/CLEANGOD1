"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { firebaseService } from "@/lib/firebase-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Calendar, MapPin, Phone, Star, Package } from "lucide-react"
import type { Booking } from "@/lib/types"

export default function OrdersPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadBookings()
    }
  }, [user, loading, router])

  const loadBookings = async () => {
    if (!user) return

    try {
      const userBookings = await firebaseService.getUserBookings(user.id)
      setBookings(userBookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()))
    } catch (error) {
      console.error("Error loading bookings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "default"
      case "in-progress":
        return "secondary"
      case "completed":
        return "default"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmed"
      case "in-progress":
        return "In Progress"
      case "completed":
        return "Completed"
      case "cancelled":
        return "Cancelled"
      default:
        return "Pending"
    }
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your service bookings</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <Package className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
              <p className="text-gray-600 mb-4">Start by booking a service</p>
              <Button onClick={() => router.push("/services")}>Browse Services</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">Booking #{booking.id.slice(-8).toUpperCase()}</CardTitle>
                      <p className="text-sm text-gray-600">
                        Booked on {new Date(booking.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant={getStatusColor(booking.status)}>{getStatusText(booking.status)}</Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Service Details */}
                  <div>
                    <h4 className="font-semibold mb-2">Services</h4>
                    <div className="space-y-2">
                      {booking.services.map((service, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <span className="text-sm">{service.name}</span>
                          <span className="text-sm font-medium">₹{service.price}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Schedule */}
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">
                      {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                    </span>
                  </div>

                  {/* Address */}
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-gray-500 mt-0.5" />
                    <div className="text-sm">
                      <p>
                        {booking.address.street}, {booking.address.area}
                      </p>
                      <p>
                        {booking.address.city}, {booking.address.state} - {booking.address.pincode}
                      </p>
                    </div>
                  </div>

                  {/* Professional Details */}
                  {booking.professionalId && (
                    <div className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-semibold mb-2">Service Professional</h4>
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-blue-600">
                            {booking.professionalName?.charAt(0) || "P"}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium">{booking.professionalName || "Professional"}</p>
                          <div className="flex items-center space-x-2">
                            <Phone className="w-3 h-3 text-gray-500" />
                            <span className="text-xs text-gray-600">Contact available after confirmation</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <Separator />

                  {/* Payment Summary */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>₹{booking.subtotal}</span>
                    </div>
                    {booking.discount > 0 && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount</span>
                        <span>-₹{booking.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span>Taxes & Fees</span>
                      <span>₹{booking.taxes}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-semibold">
                      <span>Total Amount</span>
                      <span>₹{booking.totalAmount}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    {booking.status === "completed" && (
                      <Button variant="outline" size="sm">
                        <Star className="w-4 h-4 mr-1" />
                        Rate Service
                      </Button>
                    )}
                    {booking.status === "confirmed" && (
                      <Button variant="outline" size="sm">
                        Reschedule
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Get Help
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
