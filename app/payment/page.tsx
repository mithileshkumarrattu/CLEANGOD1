"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { PaymentGateway } from "@/components/payment-gateway"
import { Card, CardContent } from "@/components/ui/card"
import { firebaseService } from "@/lib/firebase-service"
import type { Booking } from "@/lib/types"

export default function PaymentPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get("bookingId")

  const [booking, setBooking] = useState<Booking | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (bookingId && user) {
      loadBooking()
    }
  }, [bookingId, user, loading, router])

  const loadBooking = async () => {
    if (!bookingId || !user) return

    try {
      const bookingData = await firebaseService.getBooking(bookingId)
      if (!bookingData || bookingData.customerId !== user.id) {
        setError("Booking not found or unauthorized")
        return
      }
      setBooking(bookingData)
    } catch (error) {
      console.error("Error loading booking:", error)
      setError("Failed to load booking details")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = (paymentId: string) => {
    router.push(`/booking/confirmation?bookingId=${bookingId}&paymentId=${paymentId}`)
  }

  const handlePaymentError = (error: string) => {
    setError(error)
  }

  if (loading || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Payment Error</h2>
            <p className="text-gray-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Not Found</h2>
            <p className="text-gray-600">The booking you're looking for doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Payment</h1>
          <p className="text-gray-600">Booking #{booking.id.slice(-8).toUpperCase()}</p>
        </div>

        <PaymentGateway booking={booking} onPaymentSuccess={handlePaymentSuccess} onPaymentError={handlePaymentError} />
      </div>
    </div>
  )
}
