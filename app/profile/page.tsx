"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { User, MapPin, Phone, Mail, Calendar, Package, Plus, Home, Briefcase } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Booking, Address } from "@/lib/types"

export default function ProfilePage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [addresses, setAddresses] = useState<Address[]>([])
  const [isEditing, setIsEditing] = useState(false)
  const [showAddressForm, setShowAddressForm] = useState(false)
  const [newAddress, setNewAddress] = useState({
    type: "home" as "home" | "work" | "other",
    street: "",
    area: "",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    pincode: "",
    landmark: "",
  })
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  })

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
      })
      loadUserData()
    }
  }, [user, loading, router])

  const loadUserData = async () => {
    if (!user) return

    try {
      const [userBookings, userAddresses] = await Promise.all([
        firebaseService.getUserBookings(user.id),
        firebaseService.getUserAddresses(user.id),
      ])
      setBookings(userBookings)
      setAddresses(userAddresses)
    } catch (error) {
      console.error("Error loading user data:", error)
    }
  }

  const handleSave = async () => {
    if (!user) return

    try {
      await firebaseService.updateUser(user.id, formData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error updating profile:", error)
    }
  }

  const handleAddAddress = async () => {
    if (!user?.id) return

    try {
      const address: Omit<Address, "id"> = {
        ...newAddress,
        isDefault: addresses.length === 0,
      }

      await firebaseService.addAddress(user.id, address)

      const updatedAddresses = await firebaseService.getUserAddresses(user.id)
      setAddresses(updatedAddresses)

      setShowAddressForm(false)
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

  const handleSignOut = async () => {
    await signOut()
    router.push("/")
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
      <div className="min-h-screen flex items-center justify-center bg-off-white">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-off-white py-8 pb-24 lg:pb-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        {/* Profile Header */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-emerald/10 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-emerald" />
              </div>
              <div>
                <CardTitle className="text-2xl text-graphite">{user.name}</CardTitle>
                <p className="text-gray-600">{user.email}</p>
                <Badge variant={user.isVerified ? "default" : "secondary"} className="bg-emerald text-white">
                  {user.isVerified ? "Verified" : "Unverified"}
                </Badge>
              </div>
            </div>
            <Button
              onClick={handleSignOut}
              variant="outline"
              className="px-4 py-2 min-h-[40px] border-emerald text-emerald hover:bg-emerald hover:text-white transition-colors bg-transparent"
            >
              Sign Out
            </Button>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-graphite">Name</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="border-gray-200 focus:border-emerald"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-graphite">Phone</label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="border-gray-200 focus:border-emerald"
                  />
                </div>
                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button
                    onClick={handleSave}
                    className="px-6 py-2 min-h-[40px] bg-emerald hover:bg-emerald/90 text-white"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                    className="px-6 py-2 min-h-[40px] border-gray-300 text-graphite hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Phone className="w-4 h-4 text-gray-500" />
                  <span className="text-graphite">{user.phone}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="text-graphite">{user.email}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-graphite">Member since {new Date(user.createdAt).toLocaleDateString()}</span>
                </div>
                <Button
                  onClick={() => setIsEditing(true)}
                  className="mt-4 px-6 py-2 min-h-[40px] bg-emerald hover:bg-emerald/90 text-white"
                >
                  Edit Profile
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Bookings */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-graphite">
              <Package className="w-5 h-5 text-emerald" />
              <span>Recent Bookings</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {bookings.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No bookings yet</p>
            ) : (
              <div className="space-y-4">
                {bookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold text-graphite">Booking #{booking.id.slice(-8)}</h3>
                      <Badge
                        variant={
                          booking.status === "completed"
                            ? "default"
                            : booking.status === "cancelled"
                              ? "destructive"
                              : "secondary"
                        }
                        className={booking.status === "completed" ? "bg-emerald text-white" : ""}
                      >
                        {booking.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      {new Date(booking.scheduledDate).toLocaleDateString()} at {booking.scheduledTime}
                    </p>
                    <p className="font-medium text-graphite">₹{booking.totalAmount}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saved Addresses */}
        <Card className="bg-white border-0 shadow-sm">
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-graphite">
              <MapPin className="w-5 h-5 text-emerald" />
              <span>Saved Addresses</span>
            </CardTitle>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <Dialog open={showAddressForm} onOpenChange={setShowAddressForm}>
                <DialogTrigger asChild>
                  <Button
                    size="sm"
                    className="flex items-center justify-center space-x-1 px-4 py-2 min-h-[36px] bg-emerald hover:bg-emerald/90 text-white"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Here</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md mx-4">
                  <DialogHeader>
                    <DialogTitle className="text-graphite">Add New Address</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    {/* ... existing address form content ... */}
                    <div>
                      <Label htmlFor="type" className="text-graphite">
                        Address Type
                      </Label>
                      <Select
                        value={newAddress.type}
                        onValueChange={(value: any) => setNewAddress({ ...newAddress, type: value })}
                      >
                        <SelectTrigger className="border-gray-200 focus:border-emerald">
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
                      <Label htmlFor="street" className="text-graphite">
                        Street Address
                      </Label>
                      <Input
                        id="street"
                        placeholder="House/Flat/Office No., Street"
                        value={newAddress.street}
                        onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                        className="border-gray-200 focus:border-emerald"
                      />
                    </div>

                    <div>
                      <Label htmlFor="area" className="text-graphite">
                        Area (Optional)
                      </Label>
                      <Input
                        id="area"
                        placeholder="Area, Colony"
                        value={newAddress.area}
                        onChange={(e) => setNewAddress({ ...newAddress, area: e.target.value })}
                        className="border-gray-200 focus:border-emerald"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city" className="text-graphite">
                          City
                        </Label>
                        <Select
                          value={newAddress.city}
                          onValueChange={(value) => setNewAddress({ ...newAddress, city: value })}
                        >
                          <SelectTrigger className="border-gray-200 focus:border-emerald">
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
                        <Label htmlFor="pincode" className="text-graphite">
                          Pincode
                        </Label>
                        <Input
                          id="pincode"
                          placeholder="530013"
                          value={newAddress.pincode}
                          onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                          className="border-gray-200 focus:border-emerald"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="landmark" className="text-graphite">
                        Landmark (Optional)
                      </Label>
                      <Input
                        id="landmark"
                        placeholder="Near famous location"
                        value={newAddress.landmark}
                        onChange={(e) => setNewAddress({ ...newAddress, landmark: e.target.value })}
                        className="border-gray-200 focus:border-emerald"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                      <Button
                        onClick={handleAddAddress}
                        disabled={!newAddress.street || !newAddress.pincode}
                        className="flex-1 px-4 py-2 min-h-[40px] bg-emerald hover:bg-emerald/90 text-white disabled:bg-gray-300"
                      >
                        Add Address
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddressForm(false)}
                        className="px-4 py-2 min-h-[40px] border-gray-300 text-graphite hover:bg-gray-50"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                onClick={() => router.push("/booking/address-selection")}
                size="sm"
                variant="outline"
                className="flex items-center justify-center space-x-1 px-4 py-2 min-h-[36px] bg-transparent border-emerald text-emerald hover:bg-emerald hover:text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add via Page</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {addresses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No saved addresses</p>
                <Button
                  onClick={() => setShowAddressForm(true)}
                  variant="outline"
                  className="px-6 py-2 min-h-[40px] border-emerald text-emerald hover:bg-emerald hover:text-white transition-colors"
                >
                  Add Your First Address
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => {
                  const IconComponent = getAddressIcon(address.type)
                  return (
                    <div
                      key={address.id}
                      className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow"
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 rounded-full bg-emerald/10 flex items-center justify-center shrink-0">
                          <IconComponent className="h-5 w-5 text-emerald" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h3 className="font-semibold capitalize text-graphite">{address.type}</h3>
                            {address.isDefault && (
                              <Badge variant="outline" className="border-emerald text-emerald">
                                Default
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-600">
                            {address.street}
                            {address.area && `, ${address.area}`}
                          </p>
                          <p className="text-sm text-gray-600">
                            {address.city}, {address.state} - {address.pincode}
                          </p>
                          {address.landmark && (
                            <p className="text-xs text-gray-500 mt-1">Landmark: {address.landmark}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
