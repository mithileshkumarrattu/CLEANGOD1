"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { MapPin, Search, Navigation } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Location } from "@/lib/types"

interface LocationSelectorProps {
  onLocationSelect: (location: Location) => void
  currentLocation?: Location | null
}

export function LocationSelector({ onLocationSelect, currentLocation }: LocationSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [locations, setLocations] = useState<Location[]>([])
  const [loading, setLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(false)

  useEffect(() => {
    if (isOpen) {
      loadLocations()
    }
  }, [isOpen])

  const loadLocations = async () => {
    setLoading(true)
    try {
      const availableLocations = await firebaseService.getLocations()
      setLocations(availableLocations)
    } catch (error) {
      console.error("Error loading locations:", error)
    } finally {
      setLoading(false)
    }
  }

  const detectCurrentLocation = async () => {
    setDetectingLocation(true)
    try {
      if (!navigator.geolocation) {
        throw new Error("Geolocation is not supported")
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000,
        })
      })

      // Use reverse geocoding to get location details
      const response = await fetch(
        `https://api.opencagedata.com/geocode/v1/json?q=${position.coords.latitude}+${position.coords.longitude}&key=eaf4ca4e30c54ef39d3154e8c3d66e14`,
      )
      const data = await response.json()

      if (data.results && data.results.length > 0) {
        const result = data.results[0]
        const detectedLocation: Location = {
          id: `detected-${Date.now()}`,
          name: result.components.city || result.components.town || result.components.village,
          state: result.components.state,
          country: result.components.country,
          coordinates: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          },
          isServiceable: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        onLocationSelect(detectedLocation)
        setIsOpen(false)
      }
    } catch (error) {
      console.error("Error detecting location:", error)
      // Fallback to manual selection
    } finally {
      setDetectingLocation(false)
    }
  }

  const filteredLocations = locations.filter((location) =>
    location.name.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="relative">
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 text-left justify-start"
      >
        <MapPin className="w-4 h-4" />
        <div className="flex flex-col items-start">
          <span className="text-xs text-gray-500">Deliver to</span>
          <span className="text-sm font-medium truncate max-w-32">
            {currentLocation ? currentLocation.name : "Select location"}
          </span>
        </div>
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 mt-2 w-80 z-50 shadow-lg">
          <CardContent className="p-4">
            <div className="space-y-4">
              {/* Current Location Detection */}
              <Button
                onClick={detectCurrentLocation}
                disabled={detectingLocation}
                variant="outline"
                className="w-full justify-start bg-transparent"
              >
                <Navigation className="w-4 h-4 mr-2" />
                {detectingLocation ? "Detecting..." : "Use current location"}
              </Button>

              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search for your city"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Location List */}
              <div className="max-h-60 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                  </div>
                ) : filteredLocations.length === 0 ? (
                  <div className="text-center py-4 text-gray-500">
                    {searchQuery ? "No locations found" : "No serviceable locations available"}
                  </div>
                ) : (
                  filteredLocations.map((location) => (
                    <Button
                      key={location.id}
                      variant="ghost"
                      onClick={() => {
                        onLocationSelect(location)
                        setIsOpen(false)
                      }}
                      className="w-full justify-start text-left"
                    >
                      <div>
                        <div className="font-medium">{location.name}</div>
                        <div className="text-xs text-gray-500">{location.state}</div>
                      </div>
                    </Button>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
