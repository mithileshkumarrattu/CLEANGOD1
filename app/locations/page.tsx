"use client"

import { useState, useEffect } from "react"
import { firebaseService } from "@/lib/firebase-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MapPin, Search, Navigation } from "lucide-react"
import type { Location } from "@/lib/types"

export default function LocationsPage() {
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    loadLocations()
  }, [])

  const loadLocations = async () => {
    try {
      const availableLocations = await firebaseService.getLocations()
      setLocations(availableLocations)
    } catch (error) {
      console.error("Error loading locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredLocations = locations.filter(
    (location) =>
      location.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      location.state.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Service Locations</h1>
          <p className="text-gray-600">We provide premium cleaning services in these cities</p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Locations Grid */}
        {filteredLocations.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                <MapPin className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No locations found</h3>
              <p className="text-gray-600">
                {searchQuery ? "Try adjusting your search" : "Service locations will appear here once added by admin"}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLocations.map((location) => (
              <Card key={location.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <CardTitle className="text-lg">{location.name}</CardTitle>
                    </div>
                    <Badge variant={location.isServiceable ? "default" : "secondary"}>
                      {location.isServiceable ? "Available" : "Coming Soon"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {location.state}, {location.country}
                    </p>

                    {location.coordinates && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Navigation className="w-3 h-3" />
                        <span>
                          {location.coordinates.latitude.toFixed(4)}, {location.coordinates.longitude.toFixed(4)}
                        </span>
                      </div>
                    )}

                    {location.isServiceable && (
                      <div className="pt-2">
                        <p className="text-sm font-medium text-green-600">✓ Full service available</p>
                        <p className="text-xs text-gray-500">All cleaning services and products</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
