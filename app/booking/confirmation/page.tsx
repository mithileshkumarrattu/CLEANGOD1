"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, MapPin, Clock, Phone, MessageCircle } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Booking } from "@/lib/types"
import { format } from "date-fns"

export default function BookingConfirmationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadBooking = async () => {
      if (!bookingId) {
        router.push("/")
        return
      }

      try {
        const bookingData = await firebaseService.getBooking(bookingId)
        if (bookingData) {
          setBooking(bookingData)
        } else {
          router.push("/")
        }
      } catch (error) {
        console.error("Error loading booking:", error)
        router.push("/")
      } finally {
        setLoading(false)
      }
    }

    loadBooking()
  }, [bookingId, router])

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAFB" }}>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAFB" }}>
        <Header />
        <div className="container mx-auto px-4 py-8 max-w-2xl text-center">
          <p style={{ color: "#475569" }}>Booking not found</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Back to Home
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFB" }}>
      <Header />

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Success Message */}
        <div className="text-center mb-8">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: "#F1FCF7" }}
          >
            <CheckCircle className="h-12 w-12" style={{ color: "#2DCE89" }} />
          </div>
          <h1 className="text-2xl font-bold font-serif mb-2" style={{ color: "#1B1F22" }}>
            Booking Confirmed!
          </h1>
          <p style={{ color: "#475569" }}>
            Your service has been successfully booked. You will receive a confirmation message shortly.
          </p>
        </div>

        {/* Booking Details */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold" style={{ color: "#1B1F22" }}>
                Booking Details
              </h3>
              <Badge className="text-white" style={{ backgroundColor: "#2DCE89" }}>
                {booking.status === "confirmed" ? "Confirmed" : booking.status}
              </Badge>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-sm mb-1" style={{ color: "#475569" }}>
                  Booking ID
                </h4>
                <p className="font-mono text-lg" style={{ color: "#1B1F22" }}>
                  CG{booking.id?.slice(-6).toUpperCase()}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1" style={{ color: "#475569" }}>
                  Service
                </h4>
                <p style={{ color: "#1B1F22" }}>{booking.serviceName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm mb-1" style={{ color: "#475569" }}>
                    Date
                  </h4>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" style={{ color: "#2DCE89" }} />
                    <span style={{ color: "#1B1F22" }}>
                      {booking.scheduledDate ? format(new Date(booking.scheduledDate), "MMM d, yyyy") : "Today"}
                    </span>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-sm mb-1" style={{ color: "#475569" }}>
                    Time
                  </h4>
                  <p style={{ color: "#1B1F22" }}>{booking.scheduledTime}</p>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1" style={{ color: "#475569" }}>
                  Address
                </h4>
                <div className="flex items-start space-x-2">
                  <MapPin className="h-4 w-4 mt-0.5 shrink-0" style={{ color: "#2DCE89" }} />
                  <span className="text-sm" style={{ color: "#1B1F22" }}>
                    {booking.address?.street}, {booking.address?.area}, {booking.address?.city} -{" "}
                    {booking.address?.pincode}
                  </span>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1" style={{ color: "#475569" }}>
                  Payment Method
                </h4>
                <p style={{ color: "#1B1F22" }}>
                  {booking.paymentMethod === "cash" ? "Cash on Service" : "Online Payment"}
                </p>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-1" style={{ color: "#475569" }}>
                  Total Amount
                </h4>
                <p className="text-xl font-bold" style={{ color: "#2DCE89" }}>
                  ₹{booking.totalAmount}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Professional Details */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-6">
            <h3 className="font-semibold mb-4" style={{ color: "#1B1F22" }}>
              Your Professional
            </h3>

            <div className="flex items-center space-x-4 mb-4">
              <div
                className="w-16 h-16 rounded-full overflow-hidden flex items-center justify-center"
                style={{ backgroundColor: "#F1FCF7" }}
              >
                {booking.providerName ? (
                  <img
                    src="/placeholder.svg?height=64&width=64"
                    alt={booking.providerName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl font-bold" style={{ color: "#2DCE89" }}>
                    CG
                  </div>
                )}
              </div>
              <div className="flex-1">
                <h4 className="font-medium" style={{ color: "#1B1F22" }}>
                  {booking.providerName || "Professional will be assigned soon"}
                </h4>
                <div className="flex items-center space-x-1 mt-1">
                  <span className="text-sm font-medium" style={{ color: "#1B1F22" }}>
                    4.8
                  </span>
                  <div className="flex">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className={`w-3 h-3 ${i < 4 ? "text-amber-400" : "text-gray-300"}`}>
                        ★
                      </div>
                    ))}
                  </div>
                </div>
                <p className="text-xs mt-1" style={{ color: "#475569" }}>
                  Professional will arrive 15 mins before scheduled time
                </p>
              </div>
            </div>

            <div className="flex space-x-3">
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                style={{ borderColor: "#2DCE89", color: "#2DCE89" }}
                disabled={!booking.providerName}
              >
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button
                variant="outline"
                className="flex-1 bg-transparent"
                style={{ borderColor: "#2DCE89", color: "#2DCE89" }}
                disabled={!booking.providerName}
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                Chat
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button
            onClick={() => router.push("/bookings")}
            className="w-full h-12 text-white"
            style={{ backgroundColor: "#2DCE89" }}
          >
            View All Bookings
          </Button>
          <Button
            onClick={() => router.push("/")}
            variant="outline"
            className="w-full h-12"
            style={{ borderColor: "#2DCE89", color: "#2DCE89" }}
          >
            Back to Home
          </Button>
        </div>
      </main>
    </div>
  )
}
