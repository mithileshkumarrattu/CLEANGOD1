"use client"

import { useState, useEffect } from "react"
import { useCart } from "@/contexts/cart-context"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { cleanGodService } from "@/lib/firebase-service"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { ShoppingCart, Plus, Minus, Trash2, Tag } from "lucide-react"
import type { Service, Product } from "@/lib/types"
import Image from "next/image"

interface CartItemWithDetails {
  id: string
  type: "service" | "product"
  quantity: number
  name: string
  price: number
  image?: string
  details?: Service | Product
}

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, getTotalAmount, clearCart, isLoaded } = useCart()
  const { user } = useAuth()
  const router = useRouter()
  const [couponCode, setCouponCode] = useState("")
  const [discount, setDiscount] = useState(0)
  const [appliedCoupon, setAppliedCoupon] = useState("")
  const [mounted, setMounted] = useState(false)
  const [itemsWithDetails, setItemsWithDetails] = useState<CartItemWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Fetch item details from Firestore
  useEffect(() => {
    const fetchItemDetails = async () => {
      if (!isLoaded || items.length === 0) {
        setItemsWithDetails([])
        setLoading(false)
        return
      }

      try {
        const detailedItems = await Promise.all(
          items.map(async (item) => {
            let details: Service | Product | null = null
            let name = "Unknown Item"
            let price = 0
            let image = ""

            if (item.type === "service") {
              details = await cleanGodService.getService(item.id)
              if (details) {
                name = details.name
                price = details.pricing?.[0]?.sellingPrice || 0
                image = details.images?.[0] || ""
              }
            } else if (item.type === "product") {
              details = await cleanGodService.getById<Product>("products", item.id)
              if (details) {
                name = details.name
                price = details.price
                image = details.images?.[0] || ""
              }
            }

            return {
              ...item,
              name,
              price,
              image,
              details,
            }
          }),
        )

        setItemsWithDetails(detailedItems)
      } catch (error) {
        console.error("Error fetching item details:", error)
        setItemsWithDetails([])
      } finally {
        setLoading(false)
      }
    }

    fetchItemDetails()
  }, [items, isLoaded])

  // Don't render until component is mounted and cart is loaded
  if (!mounted || !isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/6 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="w-20 h-20 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  const subtotal = itemsWithDetails.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const taxes = Math.round(subtotal * 0.18) // 18% GST
  const total = subtotal - discount + taxes

  const applyCoupon = async () => {
    try {
      const coupons = await cleanGodService.getActiveCoupons()
      const validCoupon = coupons.find((c) => c.code.toUpperCase() === couponCode.toUpperCase())

      if (validCoupon) {
        const discountAmount =
          validCoupon.discountType === "percentage"
            ? subtotal * (validCoupon.discountValue / 100)
            : validCoupon.discountValue

        setDiscount(Math.min(discountAmount, subtotal))
        setAppliedCoupon(couponCode.toUpperCase())
        setCouponCode("")
      } else {
        // Fallback to hardcoded coupons if no database coupons
        const fallbackCoupons: Record<string, number> = {
          CLEAN10: 0.1, // 10% off
          FIRST20: 0.2, // 20% off for first-time users
          SAVE50: 50, // ₹50 off
        }

        const couponValue = fallbackCoupons[couponCode.toUpperCase()]
        if (couponValue) {
          const discountAmount = couponValue < 1 ? subtotal * couponValue : couponValue
          setDiscount(Math.min(discountAmount, subtotal))
          setAppliedCoupon(couponCode.toUpperCase())
          setCouponCode("")
        }
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
    }
  }

  const removeCoupon = () => {
    setDiscount(0)
    setAppliedCoupon("")
  }

  const handleCheckout = () => {
    if (!user) {
      router.push("/auth/login?redirect=/cart")
      return
    }

    // Create booking and redirect to time selection
    router.push("/booking/time-selection")
  }

  if (itemsWithDetails.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-12 h-12 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-6">Add some services or products to get started</p>
              <div className="flex justify-center space-x-4">
                <Button onClick={() => router.push("/services")}>Browse Services</Button>
                <Button onClick={() => router.push("/products")} variant="outline">
                  Shop Products
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{itemsWithDetails.length} item(s) in your cart</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {itemsWithDetails.map((item) => (
              <Card key={`${item.id}-${item.type}`}>
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                      <Image
                        src={item.image || "/placeholder.svg?height=80&width=80&query=cleaning service"}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">{item.name}</h3>
                      <p className="text-sm text-gray-600 capitalize">{item.type}</p>
                      <p className="text-lg font-bold text-blue-600">₹{item.price}</p>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.type, Math.max(1, item.quantity - 1))}
                      >
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-8 text-center font-medium">{item.quantity}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.type, item.quantity + 1)}
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>

                    <Button size="sm" variant="ghost" onClick={() => removeFromCart(item.id, item.type)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Coupon Code */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Tag className="w-5 h-5" />
                  <span>Coupon Code</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appliedCoupon ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium text-green-800">{appliedCoupon} Applied</p>
                      <p className="text-sm text-green-600">You saved ₹{discount}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={removeCoupon}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Enter coupon code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                    />
                    <Button onClick={applyCoupon} disabled={!couponCode}>
                      Apply
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Order Summary */}
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Taxes & Fees</span>
                  <span>₹{taxes}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold text-lg">
                  <span>Total</span>
                  <span>₹{total}</span>
                </div>
              </CardContent>
            </Card>

            {/* Checkout Button */}
            <Button onClick={handleCheckout} className="w-full" size="lg">
              Proceed to Checkout
            </Button>

            {/* Clear Cart */}
            <Button onClick={clearCart} variant="outline" className="w-full bg-transparent">
              Clear Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
