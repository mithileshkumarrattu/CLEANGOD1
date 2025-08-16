"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, MapPin, Plus, Home, Briefcase } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import type { Address } from "@/lib/types"
import { firebaseService } from "@/lib/firebase-service"

export default function AddressSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [addresses, setAddresses] = useState<Address[]>([])
  const [selectedAddress, setSelectedAddress] = useState<string>("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [newAddress, setNewAddress] = useState({
    type: "home" as "home" | "work" | "other",
    street: "",
    area: "",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pincode: "",
    landmark: "",
  })

  useEffect(() => {
    const loadUserAddresses = async () => {
      if (!user?.id) {
        setLoading(false)
        return
      }

      try {
        const userDoc = await firebaseService.getById<any>("users", user.id)
        const userAddresses = userDoc?.addresses || []
        setAddresses(userAddresses)
        setSelectedAddress(userAddresses.find((a: Address) => a.isDefault)?.id || "")

        if (userAddresses.length === 0) {
          setShowAddForm(true)
        }
      } catch (error) {
        console.error("Error loading addresses:", error)
        setAddresses([])
        setShowAddForm(true) // Show form if error loading addresses
      } finally {
        setLoading(false)
      }
    }

    loadUserAddresses()
  }, [user])

  const handleAddAddress = async () => {
    if (!user?.id) return

    try {
      const address: Address = {
        id: Date.now().toString(),
        ...newAddress,
        isDefault: addresses.length === 0,
      }

      const updatedAddresses = [...addresses, address]
      await firebaseService.updateById("users", user.id, { addresses: updatedAddresses })

      setAddresses(updatedAddresses)
      setSelectedAddress(address.id)

      setShowAddForm(false)
      setNewAddress({
        type: "home",
        street: "",
        area: "",
        city: "Visakhapatnam",
        state: "Andhra Pradesh",
        pincode: "",
        landmark: "",
      })
    } catch (error) {
      console.error("Error adding address:", error)
    }
  }

  const handleContinue = async () => {
    if (!selectedAddress || !user?.id) return

    try {
      const selectedAddr = addresses.find((addr) => addr.id === selectedAddress)

      const bookingData = {
        userId: user.id,
        userEmail: user.email || "",
        userName: user.displayName || user.email || "User",
        customerName: user.displayName || user.email || "User",
        customerEmail: user.email || "",
        customerPhone: user.phoneNumber || "",
        serviceId: searchParams.get("serviceId"),
        productId: searchParams.get("productId"),
        serviceName: searchParams.get("serviceName") || "Service",
        address: selectedAddr,
        totalAmount: Number.parseFloat(searchParams.get("amount") || "0"),
        scheduledDate: searchParams.get("date") || new Date().toISOString().split("T")[0],
        scheduledTime: searchParams.get("time") || "10:00 AM",
        notes: searchParams.get("notes") || "",
        duration: Number.parseInt(searchParams.get("duration") || "60"),
      }

      // Store booking data in session storage for payment page
      sessionStorage.setItem("bookingData", JSON.stringify(bookingData))

      // Navigate to payment page
      router.push("/booking/payment")
    } catch (error) {
      console.error("Error preparing booking:", error)
      alert("Error preparing booking. Please try again.")
    }
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return Home
      case "work":
        return Briefcase
      default:
        return MapPin
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: "#FAFAFB" }}>
        <Header />
        <main className="container mx-auto px-4 py-6 max-w-2xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-32 bg-gray-200 rounded" />
            <div className="h-32 bg-gray-200 rounded" />
          </div>
        </main>
      </div>
    )
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

        <h1 className="text-2xl font-bold font-serif mb-6" style={{ color: "#1B1F22" }}>
          Select Address
        </h1>

        {addresses.length === 0 && !showAddForm && (
          <Card className="mb-6 bg-white/90 backdrop-blur-sm">
            <CardContent className="p-6 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4" style={{ color: "#475569" }} />
              <h3 className="font-semibold mb-2" style={{ color: "#1B1F22" }}>
                No addresses found
              </h3>
              <p className="mb-4" style={{ color: "#475569" }}>
                Add your address to complete the booking
              </p>
              <Button
                onClick={() => setShowAddForm(true)}
                className="text-white"
                style={{ backgroundColor: "#2DCE89" }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Existing Addresses */}
        <div className="space-y-4 mb-6">
          {addresses.map((address) => {
            const IconComponent = getAddressIcon(address.type)

            return (
              <Card
                key={address.id}
                className={`cursor-pointer transition-all ${
                  selectedAddress === address.id ? "ring-2 bg-white shadow-md" : "hover:shadow-md bg-white/90"
                }`}
                style={{
                  ringColor: selectedAddress === address.id ? "#2DCE89" : "transparent",
                }}
                onClick={() => setSelectedAddress(address.id)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start space-x-3">
                    <div
                      className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: "#F1FCF7" }}
                    >
                      <IconComponent className="h-5 w-5" style={{ color: "#2DCE89" }} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="font-semibold capitalize" style={{ color: "#1B1F22" }}>
                          {address.type}
                        </h3>
                        {address.isDefault && (
                          <span className="text-xs px-2 py-1 rounded text-white" style={{ backgroundColor: "#2DCE89" }}>
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: "#475569" }}>
                        {address.street}
                        {address.area && `, ${address.area}`}
                      </p>
                      <p className="text-sm" style={{ color: "#475569" }}>
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.landmark && (
                        <p className="text-xs mt-1" style={{ color: "#475569" }}>
                          Landmark: {address.landmark}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add New Address */}
        {addresses.length > 0 && !showAddForm && (
          <Button
            variant="outline"
            onClick={() => setShowAddForm(true)}
            className="w-full mb-6 h-12 bg-white border-2"
            style={{ borderColor: "#2DCE89", color: "#2DCE89" }}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add New Address
          </Button>
        )}

        {/* Add New Address Form */}
        {showAddForm && (
          <Card className="mb-6 bg-white">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-4" style={{ color: "#1B1F22" }}>
                Add New Address
              </h3>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="type">Address Type</Label>
                  <Select
                    value={newAddress.type}
                    onValueChange={(value: any) => setNewAddress({ ...newAddress, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="home">Home</SelectItem>
                      <SelectItem value="work">Work</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="street">Street Address</Label>
                  <Input
                    id="street"
                    placeholder="House/Flat/Office No., Street"
                    value={newAddress.street}
                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="area">Area (Optional)</Label>
                  <Input
                    id="area"
                    placeholder="Area, Colony"
                    value={newAddress.area}
                    onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="city">City</Label>
                    <Select
                      value={newAddress.city}
                      onValueChange={(value) => setNewAddress({ ...newAddress, city: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Visakhapatnam">Visakhapatnam</SelectItem>
                        <SelectItem value="Vijayawada">Vijayawada</SelectItem>
                        <SelectItem value="Rajahmundry">Rajahmundry</SelectItem>
                        <SelectItem value="Bangalore">Bangalore</SelectItem>
                        <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="pincode">Pincode</Label>
                    <Input
                      id="pincode"
                      placeholder="530013"
                      value={newAddress.pincode}
                      onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="landmark">Landmark (Optional)</Label>
                  <Input
                    id="landmark"
                    placeholder="Near famous location"
                    value={newAddress.landmark}
                    onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                  />
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={handleAddAddress}
                    disabled={!newAddress.street || !newAddress.pincode}
                    className="flex-1 text-white"
                    style={{ backgroundColor: "#2DCE89" }}
                  >
                    Add Address
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                    className="border-2"
                    style={{ borderColor: "#2DCE89", color: "#2DCE89" }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={!selectedAddress}
          className="w-full h-12 text-base font-medium text-white"
          style={{ backgroundColor: "#2DCE89" }}
        >
          Continue to Payment
        </Button>
      </main>
    </div>
  )
}
