"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { firebaseService } from "@/lib/firebase-service"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, MapPin, User, Phone } from "lucide-react"
import type { Booking } from "@/lib/types"

export default function BookingsPage() {
  const { user } = useAuth()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      loadBookings()
    }
  }, [user])

  const loadBookings = async () => {
    try {
      setLoading(true)
      const userBookings = await firebaseService.getUserBookings(user!.uid)
      setBookings(userBookings)
    } catch (error) {
      console.error("Error loading bookings:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Please Login</h1>
            <p className="text-muted-foreground">You need to login to view your bookings.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

        {loading ? (
          <div className="grid gap-6">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
            <p className="text-gray-500 mb-6">Book your first service to get started!</p>
            <Button onClick={() => (window.location.href = "/services")}>Browse Services</Button>
          </div>
        ) : (
          <div className="grid gap-6">
            {bookings.map((booking) => (
              <Card key={booking.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.serviceName}</CardTitle>
                    <Badge className={getStatusColor(booking.status)}>{booking.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(booking.scheduledDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {booking.scheduledTime}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        {booking.address}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="text-lg font-semibold">₹{booking.totalAmount}</div>
                      {booking.professionalName && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <User className="h-4 w-4" />
                          {booking.professionalName}
                        </div>
                      )}
                      {booking.professionalPhone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-4 w-4" />
                          {booking.professionalPhone}
                        </div>
                      )}
                    </div>
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
