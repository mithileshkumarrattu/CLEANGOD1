"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { ArrowLeft, CreditCard, Banknote, Loader2 } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import { useAuth } from "@/contexts/auth-context"

declare global {
  interface Window {
    Razorpay: any
  }
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery")
  const [loading, setLoading] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)

    // Get booking data from session storage
    const data = sessionStorage.getItem("bookingData")
    if (data) {
      setBookingData(JSON.parse(data))
    } else {
      router.push("/services")
    }

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script)
      }
    }
  }, [router])

  const handlePayment = async () => {
    if (!bookingData || !user) return

    setLoading(true)

    try {
      if (paymentMethod === "cash_on_delivery") {
        // Create booking with cash on delivery
        const booking = {
          ...bookingData,
          paymentMethod: "cash_on_delivery",
          paymentStatus: "pending",
          status: "pending",
          createdAt: new Date(),
          userId: user.uid,
          userName: user.displayName || user.email,
          customerName: user.displayName || user.email,
          customerEmail: user.email,
          customerPhone: user.phoneNumber || "",
        }

        const bookingId = await firebaseService.createBooking(booking)
        sessionStorage.removeItem("bookingData")
        router.push(`/booking/confirmation?id=${bookingId}`)
      } else {
        // Handle Razorpay payment
        const options = {
          key: "rzp_test_R5dl1I67HNcTvl",
          amount: bookingData.totalAmount * 100, // Amount in paise
          currency: "INR",
          name: "CleanGod",
          description: `Payment for ${bookingData.serviceName}`,
          image: "/cleangod-logo.png",
          handler: async (response: any) => {
            try {
              // Create booking with online payment
              const booking = {
                ...bookingData,
                paymentMethod: "online",
                paymentStatus: "completed",
                paymentId: response.razorpay_payment_id,
                status: "confirmed",
                createdAt: new Date(),
                userId: user.uid,
                userName: user.displayName || user.email,
                customerName: user.displayName || user.email,
                customerEmail: user.email,
                customerPhone: user.phoneNumber || "",
              }

              const bookingId = await firebaseService.createBooking(booking)
              sessionStorage.removeItem("bookingData")
              router.push(`/booking/confirmation?id=${bookingId}`)
            } catch (error) {
              console.error("Error creating booking:", error)
              alert("Payment successful but booking creation failed. Please contact support.")
            }
          },
          prefill: {
            name: user.displayName || "",
            email: user.email || "",
            contact: user.phoneNumber || "",
          },
          theme: {
            color: "#2DCE89",
          },
          modal: {
            ondismiss: () => {
              setLoading(false)
            },
          },
        }

        const razorpay = new window.Razorpay(options)
        razorpay.open()
      }
    } catch (error) {
      console.error("Payment error:", error)
      alert("Payment failed. Please try again.")
    } finally {
      if (paymentMethod === "cash_on_delivery") {
        setLoading(false)
      }
    }
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFB]">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FAFAFB] py-8">
      <div className="max-w-2xl mx-auto px-4">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-2xl font-bold text-[#1B1F22]">Payment</h1>
        </div>

        <div className="space-y-6">
          {/* Booking Summary */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1B1F22]">Booking Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-[#475569]">Service</span>
                <span className="font-medium text-[#1B1F22]">{bookingData.serviceName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Date & Time</span>
                <span className="font-medium text-[#1B1F22]">
                  {bookingData.scheduledDate} at {bookingData.scheduledTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#475569]">Address</span>
                <span className="font-medium text-right max-w-xs text-[#1B1F22]">
                  {typeof bookingData.address === "string"
                    ? bookingData.address
                    : `${bookingData.address?.street}, ${bookingData.address?.area}`}
                </span>
              </div>
              <hr />
              <div className="flex justify-between text-lg font-bold">
                <span className="text-[#1B1F22]">Total Amount</span>
                <span className="text-[#2DCE89]">₹{bookingData.totalAmount}</span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Method Selection */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-[#1B1F22]">Choose Payment Method</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-[#F1FCF7] transition-colors">
                  <RadioGroupItem value="cash_on_delivery" id="cash" />
                  <Label htmlFor="cash" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Banknote className="w-5 h-5 text-[#2DCE89]" />
                    <div>
                      <div className="font-medium text-[#1B1F22]">Cash on Delivery</div>
                      <div className="text-sm text-[#475569]">Pay when service is completed</div>
                    </div>
                  </Label>
                </div>

                <div className="flex items-center space-x-3 p-4 border rounded-lg hover:bg-[#F1FCF7] transition-colors">
                  <RadioGroupItem value="online" id="online" />
                  <Label htmlFor="online" className="flex items-center gap-3 cursor-pointer flex-1">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-[#1B1F22]">Pay Online</div>
                      <div className="text-sm text-[#475569]">UPI, Cards, Net Banking</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Confirm Payment Button */}
          <Button
            onClick={handlePayment}
            disabled={loading}
            className="w-full h-12 bg-[#2DCE89] hover:bg-[#25b377] text-white font-medium"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            {paymentMethod === "cash_on_delivery" ? "Confirm Booking" : `Pay ₹${bookingData.totalAmount}`}
          </Button>
        </div>
      </div>
    </div>
  )
}
