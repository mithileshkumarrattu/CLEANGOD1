"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Star, Clock, Shield, ArrowLeft, Plus, Minus, Check } from "lucide-react"
import { cleanGodService } from "@/lib/firebase-service"
import { useCart } from "@/contexts/cart-context"
import type { Service } from "@/lib/types"

export default function ServiceDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const { addItem } = useCart()
  const [service, setService] = useState<Service | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPricing, setSelectedPricing] = useState<string>("")
  const [addOns, setAddOns] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    const fetchService = async () => {
      try {
        const data = await cleanGodService.getById<Service>("services", params.id as string)
        if (data) {
          setService(data)
          setSelectedPricing(data.pricing?.[0]?.id || "")
        }
      } catch (error) {
        console.error("Error fetching service:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchService()
  }, [params.id])

  const defaultAddOns = [
    { id: "fridge-cleaning", name: "Fridge Cleaning", price: 499, description: "Deep cleaning of refrigerator" },
    { id: "balcony-cleaning", name: "Balcony Cleaning", price: 299, description: "Complete balcony cleaning" },
    { id: "fan-cleaning", name: "Fan Cleaning", price: 149, description: "Ceiling fan cleaning (per fan)" },
  ]

  const handleAddOnChange = (addOnId: string, change: number) => {
    setAddOns((prev) => {
      const current = prev[addOnId] || 0
      const newValue = Math.max(0, current + change)
      if (newValue === 0) {
        const { [addOnId]: removed, ...rest } = prev
        return rest
      }
      return { ...prev, [addOnId]: newValue }
    })
  }

  const getSelectedPricing = () => {
    return service?.pricing?.find((p) => p.id === selectedPricing)
  }

  const getTotalPrice = () => {
    const basePrice = getSelectedPricing()?.sellingPrice || 0
    const addOnPrice = Object.entries(addOns).reduce((total, [addOnId, quantity]) => {
      const addOn = defaultAddOns.find((a) => a.id === addOnId)
      return total + (addOn?.price || 0) * quantity
    }, 0)
    return basePrice + addOnPrice
  }

  const handleBookNow = () => {
    if (!service) return

    // Add to cart and redirect to booking flow
    addItem({
      type: "service",
      id: service.id,
      pricingId: selectedPricing,
      quantity: 1,
    })

    router.push(`/booking/time-selection?serviceId=${service.id}&pricingId=${selectedPricing}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-1/3" />
            <div className="aspect-video bg-muted rounded-2xl" />
            <div className="h-6 bg-muted rounded w-1/2" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded" />
              <div className="h-4 bg-muted rounded w-3/4" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!service) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8 text-center">
          <h1 className="text-2xl font-bold mb-4">Service not found</h1>
          <p className="text-muted-foreground mb-4">This service may not exist or has been removed.</p>
          <Button onClick={() => router.push("/services")}>Browse All Services</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6">
        {/* Back Button */}
        <Button variant="ghost" onClick={() => router.back()} className="mb-6 p-0 h-auto">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Service Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Image Gallery */}
            <div className="space-y-4">
              <div className="aspect-video rounded-2xl overflow-hidden">
                <img
                  src={service.images?.[0] || "/placeholder.svg?height=400&width=600&query=cleaning service"}
                  alt={service.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {service.images && service.images.length > 1 && (
                <div className="grid grid-cols-3 gap-4">
                  {service.images.slice(1, 4).map((image, index) => (
                    <div key={index} className="aspect-video rounded-xl overflow-hidden">
                      <img
                        src={image || "/placeholder.svg"}
                        alt={`${service.name} ${index + 2}`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Service Info */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold font-serif mb-2">{service.name}</h1>
                  <p className="text-muted-foreground">{service.shortDescription}</p>
                </div>
                <Badge variant="secondary" className="shrink-0">
                  <Star className="h-3 w-3 fill-current mr-1" />
                  {service.rating}
                </Badge>
              </div>

              <div className="flex items-center space-x-6 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{service.duration} minutes</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Shield className="h-4 w-4" />
                  <span>{service.totalBookings}+ bookings</span>
                </div>
              </div>
            </div>

            {/* Description */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-3">Service Description</h3>
                <p className="text-muted-foreground leading-relaxed">{service.description}</p>
              </CardContent>
            </Card>

            {/* Features */}
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold mb-4">What's Included</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {service.features?.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-2">
                      <Check className="h-4 w-4 text-secondary shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Requirements */}
            {service.requirements && (
              <Card>
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Requirements</h3>
                  <ul className="space-y-2">
                    {service.requirements.map((requirement, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-start space-x-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{requirement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Booking Card */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6 space-y-6">
                {/* Pricing Options */}
                <div>
                  <h3 className="font-semibold mb-4">Select Package</h3>
                  <div className="space-y-3">
                    {service.pricing?.map((pricing) => (
                      <div
                        key={pricing.id}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                          selectedPricing === pricing.id
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setSelectedPricing(pricing.id)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{pricing.name}</h4>
                          <div className="text-right">
                            <div className="font-bold text-primary">₹{pricing.sellingPrice}</div>
                            {pricing.originalPrice && pricing.originalPrice > pricing.sellingPrice && (
                              <div className="text-xs text-muted-foreground line-through">₹{pricing.originalPrice}</div>
                            )}
                          </div>
                        </div>
                        {pricing.description && <p className="text-xs text-muted-foreground">{pricing.description}</p>}
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Add-ons */}
                <div>
                  <h3 className="font-semibold mb-4">Frequently Added Together</h3>
                  <div className="space-y-4">
                    {defaultAddOns.map((addOn) => (
                      <div key={addOn.id} className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium text-sm">{addOn.name}</h4>
                          <p className="text-xs text-muted-foreground">{addOn.description}</p>
                          <p className="text-sm font-medium text-primary">₹{addOn.price}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-transparent"
                            onClick={() => handleAddOnChange(addOn.id, -1)}
                            disabled={!addOns[addOn.id]}
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm">{addOns[addOn.id] || 0}</span>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 w-8 p-0 bg-transparent"
                            onClick={() => handleAddOnChange(addOn.id, 1)}
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                {/* Total */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Total Amount</span>
                    <span className="text-2xl font-bold text-primary">₹{getTotalPrice()}</span>
                  </div>
                  <Button onClick={handleBookNow} className="w-full h-12 text-base font-medium">
                    Book Now
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
