"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Edit, Trash2, Eye, EyeOff } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Service, Category } from "@/lib/types"

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)

  const [newService, setNewService] = useState({
    name: "",
    categoryId: "",
    description: "",
    shortDescription: "",
    duration: 60,
    pricing: [{ name: "Standard", originalPrice: 0, sellingPrice: 0 }],
    features: [""],
    isActive: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [servicesData, categoriesData] = await Promise.all([
        firebaseService.getServices(),
        firebaseService.getCategories(),
      ])
      setServices(servicesData)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error fetching data:", error)
      setServices([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const filteredServices = services.filter((service) => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "all" || service.categoryId === selectedCategory
    return matchesSearch && matchesCategory
  })

  const handleAddService = async () => {
    try {
      const serviceData = {
        ...newService,
        images: [],
        rating: 0,
        totalBookings: 0,
        sortOrder: services.length + 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const id = await firebaseService.createService(serviceData)
      const newServiceWithId = { ...serviceData, id }
      setServices([...services, newServiceWithId as Service])
      setIsAddDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error adding service:", error)
    }
  }

  const handleToggleActive = async (service: Service) => {
    try {
      await firebaseService.updateService(service.id, { isActive: !service.isActive })
      setServices(services.map((s) => (s.id === service.id ? { ...s, isActive: !s.isActive } : s)))
    } catch (error) {
      console.error("Error updating service:", error)
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      await firebaseService.deleteService(serviceId)
      setServices(services.filter((s) => s.id !== serviceId))
    } catch (error) {
      console.error("Error deleting service:", error)
    }
  }

  const resetForm = () => {
    setNewService({
      name: "",
      categoryId: "",
      description: "",
      shortDescription: "",
      duration: 60,
      pricing: [{ name: "Standard", originalPrice: 0, sellingPrice: 0 }],
      features: [""],
      isActive: true,
    })
  }

  const addPricingTier = () => {
    setNewService({
      ...newService,
      pricing: [...newService.pricing, { name: "", originalPrice: 0, sellingPrice: 0 }],
    })
  }

  const updatePricingTier = (index: number, field: string, value: any) => {
    const updatedPricing = [...newService.pricing]
    updatedPricing[index] = { ...updatedPricing[index], [field]: value }
    setNewService({ ...newService, pricing: updatedPricing })
  }

  const addFeature = () => {
    setNewService({ ...newService, features: [...newService.features, ""] })
  }

  const updateFeature = (index: number, value: string) => {
    const updatedFeatures = [...newService.features]
    updatedFeatures[index] = value
    setNewService({ ...newService, features: updatedFeatures })
  }

  return (
    <AdminLayout>
      <div className="space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold font-serif">Services</h1>
            <p className="text-muted-foreground">Manage your service offerings</p>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Service
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
              <DialogHeader>
                <DialogTitle>Add New Service</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Service Name</Label>
                    <Input
                      id="name"
                      value={newService.name}
                      onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                      placeholder="e.g., 1 BHK Deep Cleaning"
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={newService.categoryId}
                      onValueChange={(value) => setNewService({ ...newService, categoryId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="shortDescription">Short Description</Label>
                  <Input
                    id="shortDescription"
                    value={newService.shortDescription}
                    onChange={(e) => setNewService({ ...newService, shortDescription: e.target.value })}
                    placeholder="Brief description for cards"
                  />
                </div>

                <div>
                  <Label htmlFor="description">Full Description</Label>
                  <Textarea
                    id="description"
                    value={newService.description}
                    onChange={(e) => setNewService({ ...newService, description: e.target.value })}
                    placeholder="Detailed service description"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="duration">Duration (minutes)</Label>
                  <Input
                    id="duration"
                    type="number"
                    value={newService.duration}
                    onChange={(e) => setNewService({ ...newService, duration: Number.parseInt(e.target.value) })}
                  />
                </div>

                {/* Pricing Tiers */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Pricing Tiers</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addPricingTier}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Tier
                    </Button>
                  </div>
                  {newService.pricing.map((pricing, index) => (
                    <div key={index} className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-2">
                      <Input
                        placeholder="Tier name"
                        value={pricing.name}
                        onChange={(e) => updatePricingTier(index, "name", e.target.value)}
                      />
                      <Input
                        type="number"
                        placeholder="Original price"
                        value={pricing.originalPrice}
                        onChange={(e) => updatePricingTier(index, "originalPrice", Number.parseInt(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="Selling price"
                        value={pricing.sellingPrice}
                        onChange={(e) => updatePricingTier(index, "sellingPrice", Number.parseInt(e.target.value))}
                      />
                    </div>
                  ))}
                </div>

                {/* Features */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Features</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addFeature}>
                      <Plus className="h-3 w-3 mr-1" />
                      Add Feature
                    </Button>
                  </div>
                  {newService.features.map((feature, index) => (
                    <Input
                      key={index}
                      placeholder="Feature description"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="mb-2"
                    />
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button variant="outline" onClick={() => setIsAddDialogOpen(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button onClick={handleAddService} className="w-full sm:w-auto">
                    Add Service
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Services List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-pulse space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          ) : filteredServices.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {services.length === 0
                    ? "No services found. Create your first service to get started."
                    : "No services match your search criteria."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id}>
                <CardContent className="p-4 md:p-6">
                  <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                    <div className="flex-1 w-full">
                      <div className="flex flex-wrap items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <Badge variant={service.isActive ? "default" : "secondary"}>
                          {service.isActive ? "Active" : "Inactive"}
                        </Badge>
                        <Badge variant="outline">{service.duration} mins</Badge>
                      </div>
                      <p className="text-muted-foreground mb-3">{service.shortDescription}</p>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span>Rating: {service.rating || "N/A"}</span>
                        <span>Bookings: {service.totalBookings || 0}</span>
                        <span>
                          Price: ₹{service.pricing?.[0]?.sellingPrice || 0}
                          {service.pricing?.[0]?.originalPrice &&
                            service.pricing[0].originalPrice > service.pricing[0].sellingPrice && (
                              <span className="line-through ml-1">₹{service.pricing[0].originalPrice}</span>
                            )}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(service)}
                        className="bg-transparent flex-1 sm:flex-none"
                      >
                        {service.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" className="bg-transparent flex-1 sm:flex-none">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive bg-transparent flex-1 sm:flex-none"
                        onClick={() => handleDeleteService(service.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
