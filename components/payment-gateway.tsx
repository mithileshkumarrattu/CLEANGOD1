"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { CreditCard, Wallet, Building, Smartphone, Shield } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Booking, PaymentMethod } from "@/lib/types"

interface PaymentGatewayProps {
  booking: Booking
  onPaymentSuccess: (paymentId: string) => void
  onPaymentError: (error: string) => void
}

export function PaymentGateway({ booking, onPaymentSuccess, onPaymentError }: PaymentGatewayProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("card")
  const [processing, setProcessing] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  })

  const paymentMethods = [
    { id: "card", name: "Credit/Debit Card", icon: CreditCard, description: "Visa, Mastercard, RuPay" },
    { id: "upi", name: "UPI", icon: Smartphone, description: "PhonePe, GPay, Paytm" },
    { id: "netbanking", name: "Net Banking", icon: Building, description: "All major banks" },
    { id: "wallet", name: "Digital Wallet", icon: Wallet, description: "Paytm, Mobikwik" },
  ]

  const handlePayment = async () => {
    setProcessing(true)

    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // In a real implementation, you would integrate with Razorpay or similar
      const paymentId = `pay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Update booking with payment information
      await firebaseService.updateBooking(booking.id, {
        paymentStatus: "completed",
        paymentMethod: selectedMethod,
        paymentId,
        status: "confirmed",
        updatedAt: new Date(),
      })

      onPaymentSuccess(paymentId)
    } catch (error) {
      console.error("Payment error:", error)
      onPaymentError("Payment failed. Please try again.")
    } finally {
      setProcessing(false)
    }
  }

  const initializeRazorpay = () => {
    // This would be the actual Razorpay integration
    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: booking.totalAmount * 100, // Amount in paise
      currency: "INR",
      name: "CleanGod",
      description: `Booking #${booking.id.slice(-8)}`,
      order_id: booking.id,
      handler: (response: any) => {
        onPaymentSuccess(response.razorpay_payment_id)
      },
      prefill: {
        name: booking.customerName,
        email: booking.customerEmail,
        contact: booking.customerPhone,
      },
      theme: {
        color: "#2563eb",
      },
    }

    // const rzp = new window.Razorpay(options)
    // rzp.open()
  }

  return (
    <div className="space-y-6">
      {/* Payment Methods */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Choose Payment Method</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedMethod === method.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedMethod(method.id as PaymentMethod)}
              >
                <div className="flex items-center space-x-3">
                  <method.icon className="w-6 h-6 text-blue-600" />
                  <div>
                    <h3 className="font-medium">{method.name}</h3>
                    <p className="text-sm text-gray-500">{method.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Details Form */}
      {selectedMethod === "card" && (
        <Card>
          <CardHeader>
            <CardTitle>Card Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Card Number</label>
              <Input
                placeholder="1234 5678 9012 3456"
                value={cardDetails.number}
                onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                maxLength={19}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Expiry Date</label>
                <Input
                  placeholder="MM/YY"
                  value={cardDetails.expiry}
                  onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                  maxLength={5}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">CVV</label>
                <Input
                  placeholder="123"
                  value={cardDetails.cvv}
                  onChange={(e) => setCardDetails({ ...cardDetails, cvv: e.target.value })}
                  maxLength={4}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Cardholder Name</label>
              <Input
                placeholder="Name on card"
                value={cardDetails.name}
                onChange={(e) => setCardDetails({ ...cardDetails, name: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "upi" && (
        <Card>
          <CardHeader>
            <CardTitle>UPI Payment</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">UPI ID</label>
              <Input placeholder="yourname@paytm" />
            </div>
          </CardContent>
        </Card>
      )}

      {selectedMethod === "netbanking" && (
        <Card>
          <CardHeader>
            <CardTitle>Net Banking</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium mb-2">Select Bank</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Choose your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sbi">State Bank of India</SelectItem>
                  <SelectItem value="hdfc">HDFC Bank</SelectItem>
                  <SelectItem value="icici">ICICI Bank</SelectItem>
                  <SelectItem value="axis">Axis Bank</SelectItem>
                  <SelectItem value="kotak">Kotak Mahindra Bank</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
          <div className="flex justify-between font-semibold text-lg">
            <span>Total Amount</span>
            <span>₹{booking.totalAmount}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Button */}
      <Button onClick={handlePayment} disabled={processing} className="w-full" size="lg">
        {processing ? "Processing Payment..." : `Pay ₹${booking.totalAmount}`}
      </Button>

      {/* Security Notice */}
      <div className="text-center text-sm text-gray-500">
        <Shield className="w-4 h-4 inline mr-1" />
        Your payment information is secure and encrypted
      </div>
    </div>
  )
}
