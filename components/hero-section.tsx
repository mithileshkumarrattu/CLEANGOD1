"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Star, Users, MapPin } from "lucide-react"
import { LocationSelector } from "./location-selector"
import type { Location } from "@/lib/types"

export function HeroSection() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Load saved location from localStorage on client side
    if (typeof window !== "undefined") {
      const savedLocation = localStorage.getItem("selectedLocation")
      if (savedLocation) {
        try {
          setCurrentLocation(JSON.parse(savedLocation))
        } catch (error) {
          console.error("Error loading saved location:", error)
        }
      }
    }
  }, [])

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location)
    // Store location in localStorage (client-side only)
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedLocation", JSON.stringify(location))
    }
  }

  return (
    <>
      {/* Desktop Hero Section */}
      <section className="hidden md:block relative min-h-screen bg-[#FAFAFB] overflow-hidden">
        {/* iPhone frame background - full width */}
        <div className="absolute inset-0 z-0">
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Close%20up.jpg-qz4pC6uz42gdNYavfeXHxu0PplPf62.jpeg"
            alt="iPhone Frame"
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Content overlay */}
        <div className="relative z-10 container mx-auto px-4 py-8 min-h-screen flex flex-col">
          <div className="text-center pt-16 pb-8">
            <h1 className="font-bold text-5xl lg:text-6xl text-[#1B1F22] leading-tight mb-4">
              Bringing home services,
              <br />
              at your <span style={{ color: "#2DCE89" }}>fingertips</span>
            </h1>
          </div>

          <div className="flex-1 grid grid-cols-12 gap-8 items-center">
            {/* Left column - Description and stats */}
            <div className="col-span-4 space-y-6">
              <p className="text-xl text-[#475569] leading-relaxed">
                Discover a simpler way to manage your home with professional cleaning services and premium products.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Star className="h-6 w-6 fill-amber-400 text-amber-400" />
                  <span className="font-bold text-2xl text-[#1B1F22]">4.8</span>
                  <span className="text-[#475569]">Service Rating*</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-6 w-6" style={{ color: "#2DCE89" }} />
                  <span className="font-bold text-2xl text-[#1B1F22]">12M+</span>
                  <span className="text-[#475569]">Customers Globally*</span>
                </div>
              </div>
            </div>

            {/* Center column - Phone with location selector */}
            <div className="col-span-4 flex flex-col items-center justify-center min-h-[600px] relative">
              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 pt-16">
                <h3 className="text-2xl font-semibold mb-2 text-center text-[#1B1F22]">Maintain your</h3>
                <h3 className="text-2xl font-semibold mb-8 text-center text-[#2DCE89]">home</h3>

                <div className="w-full max-w-sm space-y-4">
                  {mounted && (
                    <LocationSelector
                      onLocationSelect={handleLocationSelect}
                      currentLocation={currentLocation}
                      className="w-full"
                    />
                  )}

                  <div className="flex gap-2">
                    <Button className="flex-1 bg-[#2DCE89] hover:bg-[#25b377] text-white rounded-full py-3">
                      Explore Services
                    </Button>
                    <Button className="flex-1 bg-[#2DCE89] hover:bg-[#25b377] text-white rounded-full py-3">
                      Explore Products
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column - Service badges */}
            <div className="col-span-4 space-y-4">
              <Button className="w-full rounded-xl flex items-center py-4 px-6 bg-[#2DCE89] hover:bg-[#25b377] text-white font-semibold text-lg shadow-lg justify-start">
                <span className="bg-white rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                  </svg>
                </span>
                Home Services
              </Button>
              <Button className="w-full rounded-xl flex items-center py-4 px-6 bg-[#2DCE89] hover:bg-[#25b377] text-white font-semibold text-lg shadow-lg justify-start">
                <span className="bg-white rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1zM10 6a2 2 0 0 1 4 0v1h-4V6zm8 13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V9h2v1a1 1 0 0 0 2 0V9h4v1a1 1 0 0 0 2 0V9h2v10z" />
                  </svg>
                </span>
                Premium Products
              </Button>
              <Button className="w-full rounded-xl flex items-center py-4 px-6 bg-[#2DCE89] hover:bg-[#25b377] text-white font-semibold text-lg shadow-lg justify-start">
                <span className="bg-white rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                </span>
                Quality Assured
              </Button>
              <Button className="w-full rounded-xl flex items-center py-4 px-6 bg-[#2DCE89] hover:bg-[#25b377] text-white font-semibold text-lg shadow-lg justify-start">
                <span className="bg-white rounded-lg p-2 mr-3">
                  <svg className="w-6 h-6" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                </span>
                Top Rated
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="md:hidden min-h-screen bg-[#2DCE89] relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full"></div>
          <div className="absolute top-32 right-8 w-16 h-16 bg-white rounded-full"></div>
          <div className="absolute bottom-40 left-6 w-12 h-12 bg-white rounded-full"></div>
        </div>

        <div className="relative z-10 px-6 py-12 min-h-screen flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                <span className="text-[#2DCE89] font-bold">CG</span>
              </div>
              <span className="text-white font-bold text-lg">CleanGod</span>
            </div>
            <div className="w-10 h-10 bg-white/20 rounded-full"></div>
          </div>

          <div className="mb-8">
            <h1 className="text-white font-bold text-3xl leading-tight mb-4">
              Bringing home services
              <br />
              at your
              <br />
              fingertips
            </h1>
          </div>

          <div className="mb-8">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2DCE89]" />
              {mounted && (
                <LocationSelector
                  onLocationSelect={handleLocationSelect}
                  currentLocation={currentLocation}
                  className="pl-12 bg-white rounded-full h-14 text-lg"
                />
              )}
            </div>
          </div>

          <div className="space-y-4 mb-8">
            <Button className="w-full bg-white text-[#1B1F22] hover:bg-gray-50 rounded-2xl py-4 px-6 flex items-center justify-start text-lg font-semibold">
              <div className="w-8 h-8 bg-[#F1FCF7] rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                </svg>
              </div>
              Home services
            </Button>
            <Button className="w-full bg-white text-[#1B1F22] hover:bg-gray-50 rounded-2xl py-4 px-6 flex items-center justify-start text-lg font-semibold">
              <div className="w-8 h-8 bg-[#F1FCF7] rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
                </svg>
              </div>
              Premium Products
            </Button>
            <Button className="w-full bg-white text-[#1B1F22] hover:bg-gray-50 rounded-2xl py-4 px-6 flex items-center justify-start text-lg font-semibold">
              <div className="w-8 h-8 bg-[#F1FCF7] rounded-lg flex items-center justify-center mr-4">
                <svg className="w-5 h-5" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                </svg>
              </div>
              Quality Assured
            </Button>
          </div>

          <div className="mt-auto pt-8">
            <div className="flex items-center justify-center gap-8 text-white">
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Star className="h-4 w-4 fill-white" />
                  <span className="font-bold text-lg">4.8</span>
                </div>
                <span className="text-sm opacity-80">Rating</span>
              </div>
              <div className="text-center">
                <div className="flex items-center gap-1 mb-1">
                  <Users className="h-4 w-4" />
                  <span className="font-bold text-lg">12M+</span>
                </div>
                <span className="text-sm opacity-80">Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
