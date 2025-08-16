"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft, MapPin, Clock, Percent, CreditCard } from "lucide-react"
import { format } from "date-fns"
import { firebaseService } from "@/lib/firebase-service"
import type { Service, Address } from "@/lib/types"

export default function BookingSummaryPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [service, setService] = useState<Service | null>(null)
  const [address, setAddress] = useState<Address | null>(null)
  const [couponCode, setCouponCode] = useState("")
  const [appliedCoupon, setAppliedCoupon] = useState<any>(null)
  const [paymentMethod, setPaymentMethod] = useState("cash")
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)

  // Extract booking details from URL params
  const serviceId = searchParams.get("serviceId")
  const date = searchParams.get("date")
  const time = searchParams.get("time")
  const addressId = searchParams.get("addressId")

  useEffect(() => {
    const loadBookingData = async () => {
      if (!serviceId || !user) return

      try {
        const serviceData = await firebaseService.getService(serviceId)
        setService(serviceData)

        if (addressId) {
          const userAddresses = await firebaseService.getUserAddresses(user.uid)
          const selectedAddress = userAddresses.find((addr) => addr.id === addressId)
          setAddress(selectedAddress || null)
        }
      } catch (error) {
        console.error("Error loading booking data:", error)
      } finally {
        setLoading(false)
      }
    }

    loadBookingData()
  }, [serviceId, addressId, user])

  if (loading || !service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = service.pricing?.sellingPrice || service.pricing?.servicePrice || 0
  const discount = appliedCoupon ? Math.min(appliedCoupon.discount, subtotal * 0.2) : 0
  const taxes = Math.round((subtotal - discount) * 0.18)
  const total = subtotal - discount + taxes

  const applyCoupon = () => {
    if (couponCode.toLowerCase() === "clean20") {
      setAppliedCoupon({
        code: "CLEAN20",
        discount: 200,
        description: "₹200 off on first booking",
      })
    }
  }

  const removeCoupon = () => {
    setAppliedCoupon(null)
    setCouponCode("")
  }

  const handleBooking = async () => {
    if (!user || !service || !address) return

    setBooking(true)
    try {
      const bookingData = {
        customerId: user.uid,
        customerName: user.displayName || user.email || "Customer",
        customerEmail: user.email || "",
        customerPhone: user.phoneNumber || "",
        serviceId: service.id,
        serviceName: service.name,
        categoryId: service.categoryId || "",
        address: address,
        scheduledDate: date ? new Date(date) : new Date(),
        scheduledTime: time || "12:30 PM",
        status: "confirmed",
        paymentMethod: paymentMethod,
        paymentStatus: paymentMethod === "cash" ? "pending" : "paid",
        subtotal: subtotal,
        discount: discount,
        taxes: taxes,
        totalAmount: total,
        appliedCoupon: appliedCoupon?.code || null,
        notes: "",
        providerId: null,
        providerName: null,
        completedAt: null,
        rating: null,
        review: null,
      }

      const bookingId = await firebaseService.createBooking(bookingData)

      router.push(`/booking/confirmation?bookingId=${bookingId}`)
    } catch (error) {
      console.error("Error creating booking:", error)
      alert("Failed to create booking. Please try again.")
    } finally {
      setBooking(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: "#FAFAFB" }}>
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Summary
          </Button>
        </div>

        {/* Selected Service */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <h3 className="font-semibold mb-4" style={{ color: "#1B1F22" }}>
              Selected Services
            </h3>
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden" style={{ backgroundColor: "#F1FCF7" }}>
                <img
                  src={service.image || "/placeholder.svg?height=64&width=64"}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h4 className="font-medium" style={{ color: "#1B1F22" }}>
                  {service.name}
                </h4>
                <p className="text-sm" style={{ color: "#475569" }}>
                  {service.description}
                </p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-3 w-3" style={{ color: "#475569" }} />
                  <span className="text-xs" style={{ color: "#475569" }}>
                    {service.duration || 240} mins
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="font-semibold" style={{ color: "#1B1F22" }}>
                  ₹{subtotal}
                </div>
                {service.pricing?.originalPrice && service.pricing.originalPrice > subtotal && (
                  <div className="text-xs line-through" style={{ color: "#475569" }}>
                    ₹{service.pricing.originalPrice}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date & Time */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center"
                style={{ backgroundColor: "#F1FCF7" }}
              >
                <Clock className="h-5 w-5" style={{ color: "#2DCE89" }} />
              </div>
              <div>
                <h4 className="font-medium" style={{ color: "#1B1F22" }}>
                  {date ? format(new Date(date), "EEEE, MMMM d") : "Today"}
                </h4>
                <p className="text-sm" style={{ color: "#475569" }}>
                  {time || "12:30 PM"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Address */}
        {address && (
          <Card className="mb-6 border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: "#F1FCF7" }}
                >
                  <MapPin className="h-5 w-5" style={{ color: "#2DCE89" }} />
                </div>
                <div>
                  <h4 className="font-medium" style={{ color: "#1B1F22" }}>
                    {address.type || "Address"}
                  </h4>
                  <p className="text-sm" style={{ color: "#475569" }}>
                    {address.street}, {address.area}
                  </p>
                  <p className="text-sm" style={{ color: "#475569" }}>
                    {address.city}, {address.state} - {address.pincode}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Coupons */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-3">
              <Percent className="h-4 w-4" style={{ color: "#2DCE89" }} />
              <h4 className="font-medium" style={{ color: "#1B1F22" }}>
                Coupons and offers
              </h4>
            </div>

            {!appliedCoupon ? (
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 border-0 shadow-sm"
                  style={{ backgroundColor: "#F1FCF7" }}
                />
                <Button onClick={applyCoupon} variant="outline" style={{ borderColor: "#2DCE89", color: "#2DCE89" }}>
                  Apply
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: "#F1FCF7" }}>
                <div>
                  <div className="font-medium" style={{ color: "#2DCE89" }}>
                    {appliedCoupon.code}
                  </div>
                  <div className="text-xs" style={{ color: "#475569" }}>
                    {appliedCoupon.description}
                  </div>
                </div>
                <Button onClick={removeCoupon} variant="ghost" size="sm">
                  Remove
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Summary */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <h4 className="font-medium mb-4" style={{ color: "#1B1F22" }}>
              Payment summary
            </h4>

            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: "#475569" }}>Item total</span>
                <span style={{ color: "#1B1F22" }}>₹{subtotal}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-sm" style={{ color: "#2DCE89" }}>
                  <span>Coupon discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}

              <div className="flex justify-between text-sm">
                <span style={{ color: "#475569" }}>Taxes and Fee</span>
                <span style={{ color: "#1B1F22" }}>₹{taxes}</span>
              </div>

              <Separator />

              <div className="flex justify-between font-bold text-lg">
                <span style={{ color: "#1B1F22" }}>Amount to pay</span>
                <span style={{ color: "#2DCE89" }}>₹{total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payment Method */}
        <Card className="mb-6 border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center space-x-2 mb-4">
              <CreditCard className="h-4 w-4" style={{ color: "#2DCE89" }} />
              <h4 className="font-medium" style={{ color: "#1B1F22" }}>
                Payment Method
              </h4>
            </div>

            <div className="space-y-2">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-emerald-500"
                />
                <span style={{ color: "#1B1F22" }}>Cash on Service</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="payment"
                  value="online"
                  checked={paymentMethod === "online"}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="accent-emerald-500"
                />
                <span style={{ color: "#1B1F22" }}>Pay Online (UPI, Cards, Net Banking)</span>
              </label>
            </div>
          </CardContent>
        </Card>

        {/* Book Button */}
        <div className="sticky bottom-0 pt-4 pb-6" style={{ backgroundColor: "#FAFAFB" }}>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-bold" style={{ color: "#1B1F22" }}>
                  Amount to pay
                </span>
                <span className="text-2xl font-bold" style={{ color: "#2DCE89" }}>
                  ₹{total}
                </span>
              </div>
              <Button
                onClick={handleBooking}
                disabled={booking || !address}
                className="w-full h-12 text-base font-medium text-white hover:opacity-90"
                style={{ backgroundColor: "#2DCE89" }}
              >
                {booking ? "Booking..." : paymentMethod === "online" ? "Pay Now" : "Book Service"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
