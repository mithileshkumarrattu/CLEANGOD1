"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { MapPin, Plus, Edit, Trash2, Home, Building, MapIcon } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Address } from "@/lib/types"

interface AddressManagerProps {
  onAddressSelect?: (address: Address) => void
  selectedAddressId?: string
  showSelection?: boolean
}

export function AddressManager({ onAddressSelect, selectedAddressId, showSelection = false }: AddressManagerProps) {
  const { user } = useAuth()
  const [addresses, setAddresses] = useState<Address[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingAddress, setEditingAddress] = useState<Address | null>(null)
  const [formData, setFormData] = useState({
    type: "home" as "home" | "work" | "other",
    street: "",
    area: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
  })

  useEffect(() => {
    if (user) {
      loadAddresses()
    }
  }, [user])

  const loadAddresses = async () => {
    if (!user) return

    try {
      const userAddresses = await firebaseService.getUserAddresses(user.id)
      setAddresses(userAddresses)
    } catch (error) {
      console.error("Error loading addresses:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingAddress) {
        await firebaseService.updateAddress(editingAddress.id, formData)
      } else {
        await firebaseService.addAddress(user.id, formData)
      }

      await loadAddresses()
      resetForm()
    } catch (error) {
      console.error("Error saving address:", error)
    }
  }

  const handleDelete = async (addressId: string) => {
    try {
      await firebaseService.deleteAddress(addressId)
      await loadAddresses()
    } catch (error) {
      console.error("Error deleting address:", error)
    }
  }

  const handleEdit = (address: Address) => {
    setEditingAddress(address)
    setFormData({
      type: address.type,
      street: address.street,
      area: address.area,
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      landmark: address.landmark || "",
      isDefault: address.isDefault,
    })
    setShowForm(true)
  }

  const resetForm = () => {
    setFormData({
      type: "home",
      street: "",
      area: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: false,
    })
    setEditingAddress(null)
    setShowForm(false)
  }

  const getAddressIcon = (type: string) => {
    switch (type) {
      case "home":
        return <Home className="w-4 h-4" />
      case "work":
        return <Building className="w-4 h-4" />
      default:
        return <MapIcon className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Saved Addresses</h3>
        <Button onClick={() => setShowForm(true)} size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Address
        </Button>
      </div>

      {/* Address Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>{editingAddress ? "Edit Address" : "Add New Address"}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address Type</label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: any) => setFormData({ ...formData, type: value })}
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
                  <label className="block text-sm font-medium mb-2">Pincode</label>
                  <Input
                    value={formData.pincode}
                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                    placeholder="Enter pincode"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Street Address</label>
                <Input
                  value={formData.street}
                  onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                  placeholder="House/Flat/Office No, Building Name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Area/Locality</label>
                <Input
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                  placeholder="Area, Locality"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">City</label>
                  <Input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="City"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">State</label>
                  <Input
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    placeholder="State"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Landmark (Optional)</label>
                <Input
                  value={formData.landmark}
                  onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                  placeholder="Nearby landmark"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="isDefault" className="text-sm">
                  Set as default address
                </label>
              </div>

              <div className="flex space-x-2">
                <Button type="submit">{editingAddress ? "Update" : "Save"} Address</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {addresses.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No saved addresses</h3>
              <p className="text-gray-600 mb-4">Add an address to get started</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Address
              </Button>
            </CardContent>
          </Card>
        ) : (
          addresses.map((address) => (
            <Card
              key={address.id}
              className={`cursor-pointer transition-colors ${
                showSelection && selectedAddressId === address.id
                  ? "ring-2 ring-blue-500 bg-blue-50"
                  : "hover:bg-gray-50"
              }`}
              onClick={() => showSelection && onAddressSelect?.(address)}
            >
              <CardContent className="p-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">{getAddressIcon(address.type)}</div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h4 className="font-semibold capitalize">{address.type}</h4>
                        {address.isDefault && <Badge variant="outline">Default</Badge>}
                      </div>
                      <p className="text-sm text-gray-600">
                        {address.street}, {address.area}
                      </p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.landmark && <p className="text-xs text-gray-500">Near {address.landmark}</p>}
                    </div>
                  </div>

                  {!showSelection && (
                    <div className="flex space-x-2">
                      <Button size="sm" variant="ghost" onClick={() => handleEdit(address)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => handleDelete(address.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
