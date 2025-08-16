"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Star, Users, MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { LocationSelector } from "./location-selector"
import { firebaseService } from "@/lib/firebase-service"
import type { Location } from "@/lib/types"

interface Banner {
  id: string
  title: string
  imageUrl: string
  isActive: boolean
  order: number
}

export function HeroSection() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [mounted, setMounted] = useState(false)
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)

  useEffect(() => {
    setMounted(true)
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
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      const bannersData = await firebaseService.getBanners()
      const activeBanners = bannersData
        .filter((banner: Banner) => banner.isActive)
        .sort((a: Banner, b: Banner) => a.order - b.order)
      setBanners(activeBanners)
    } catch (error) {
      console.error("Error fetching banners:", error)
      setBanners([
        {
          id: "1",
          title: "Professional Cleaning Services",
          imageUrl: "/professional-cleaning-service.png",
          isActive: true,
          order: 1,
        },
      ])
    }
  }

  const handleLocationSelect = (location: Location) => {
    setCurrentLocation(location)
    if (typeof window !== "undefined") {
      localStorage.setItem("selectedLocation", JSON.stringify(location))
    }
  }

  const nextBanner = () => {
    setCurrentBannerIndex((prev) => (prev + 1) % banners.length)
  }

  const prevBanner = () => {
    setCurrentBannerIndex((prev) => (prev - 1 + banners.length) % banners.length)
  }

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(nextBanner, 5000)
      return () => clearInterval(interval)
    }
  }, [banners.length])

  return (
    <>
      {/* Desktop Hero Section */}
      <section className="hidden md:block relative min-h-screen bg-[#FAFAFB] overflow-hidden">
        <div className="container mx-auto px-4 py-8 min-h-screen flex flex-col">
          <div className="text-center pt-16 pb-8">
            <h1 className="font-bold text-5xl lg:text-6xl text-[#1B1F22] leading-tight mb-4">
              Bringing home services,
              <br />
              at your <span style={{ color: "#2DCE89" }}>fingertips</span>
            </h1>
          </div>

          <div className="flex-1 grid grid-cols-2 gap-8 items-center">
            {/* Left column - Image Carousel (50% width) */}
            <div className="relative">
              {banners.length > 0 && (
                <div className="relative h-96 rounded-2xl overflow-hidden shadow-2xl">
                  <img
                    src={banners[currentBannerIndex]?.imageUrl || "/placeholder.svg"}
                    alt={banners[currentBannerIndex]?.title}
                    className="w-full h-full object-cover"
                  />

                  {/* Carousel controls */}
                  {banners.length > 1 && (
                    <>
                      <button
                        onClick={prevBanner}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      >
                        <ChevronLeft className="w-5 h-5 text-[#1B1F22]" />
                      </button>
                      <button
                        onClick={nextBanner}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-lg transition-all"
                      >
                        <ChevronRight className="w-5 h-5 text-[#1B1F22]" />
                      </button>

                      {/* Dots indicator */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {banners.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentBannerIndex(index)}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentBannerIndex ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Stats below carousel */}
              <div className="mt-8 space-y-4">
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

            {/* Right column - Clean aesthetic buttons and location */}
            <div className="space-y-8 pl-8">
              <div className="space-y-6">
                <p className="text-lg text-[#475569] leading-relaxed">
                  Discover a simpler way to manage your home with professional cleaning services and premium products.
                </p>

                {/* Location Selector */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#1B1F22]">Select your location</label>
                  {mounted && (
                    <LocationSelector
                      onLocationSelect={handleLocationSelect}
                      currentLocation={currentLocation}
                      className="w-full"
                    />
                  )}
                </div>
              </div>

              {/* Clean aesthetic buttons */}
              <div className="space-y-4">
                <Button className="w-full rounded-xl flex items-center py-6 px-6 bg-gradient-to-r from-[#2DCE89] to-[#25b377] hover:from-[#25b377] hover:to-[#2DCE89] text-white font-semibold text-lg shadow-lg justify-start transition-all duration-300 transform hover:scale-105">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                    </svg>
                  </div>
                  Explore Services
                </Button>

                <Button className="w-full rounded-xl flex items-center py-6 px-6 bg-gradient-to-r from-[#1B1F22] to-[#2a2f35] hover:from-[#2a2f35] hover:to-[#1B1F22] text-white font-semibold text-lg shadow-lg justify-start transition-all duration-300 transform hover:scale-105">
                  <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
                    </svg>
                  </div>
                  Explore Products
                </Button>

                <Button className="w-full rounded-xl flex items-center py-6 px-6 bg-white border-2 border-[#2DCE89] hover:bg-[#F1FCF7] text-[#1B1F22] font-semibold text-lg shadow-lg justify-start transition-all duration-300 transform hover:scale-105">
                  <div className="w-12 h-12 bg-[#F1FCF7] rounded-xl flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6" style={{ color: "#2DCE89" }} />
                  </div>
                  Detect Location
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mobile Hero Section */}
      <section className="md:hidden min-h-screen bg-gradient-to-br from-[#2DCE89] to-[#25b377] relative overflow-hidden">
        {/* ... existing mobile code ... */}
        <div className="relative z-10 px-6 py-12 min-h-screen flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-lg">
                <img src="/cleangod-logo.png" alt="CleanGod" className="w-8 h-8 rounded-full" />
              </div>
              <span className="text-white font-bold text-xl">CleanGod</span>
            </div>
            <div className="w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm border border-white/30"></div>
          </div>

          {/* Full-width carousel */}
          {banners.length > 0 && (
            <div className="relative h-48 rounded-2xl overflow-hidden shadow-xl mb-8">
              <img
                src={banners[currentBannerIndex]?.imageUrl || "/placeholder.svg"}
                alt={banners[currentBannerIndex]?.title}
                className="w-full h-full object-cover"
              />

              {banners.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all ${
                        index === currentBannerIndex ? "bg-white" : "bg-white/50"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Main content */}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-white font-bold text-4xl leading-tight mb-6">
                Bringing home services
                <br />
                at your
                <br />
                fingertips
              </h1>
            </div>

            {/* Location input */}
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <MapPin className="w-6 h-6 text-[#2DCE89]" />
              </div>
              {mounted && (
                <LocationSelector
                  onLocationSelect={handleLocationSelect}
                  currentLocation={currentLocation}
                  className="pl-14 bg-white rounded-2xl h-16 text-lg shadow-lg border-0"
                />
              )}
            </div>

            {/* Service buttons */}
            <div className="space-y-4">
              <Button className="w-full bg-white text-[#1B1F22] hover:bg-gray-50 rounded-2xl py-5 px-6 flex items-center justify-between text-lg font-semibold shadow-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#F1FCF7] rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                    </svg>
                  </div>
                  Home Services
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>

              <Button className="w-full bg-white text-[#1B1F22] hover:bg-gray-50 rounded-2xl py-5 px-6 flex items-center justify-between text-lg font-semibold shadow-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#F1FCF7] rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
                    </svg>
                  </div>
                  Premium Products
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>

              <Button className="w-full bg-white text-[#1B1F22] hover:bg-gray-50 rounded-2xl py-5 px-6 flex items-center justify-between text-lg font-semibold shadow-lg">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-[#F1FCF7] rounded-xl flex items-center justify-center mr-4">
                    <svg className="w-6 h-6" style={{ color: "#2DCE89" }} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                    </svg>
                  </div>
                  Quality assured
                </div>
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>

          {/* Bottom stats */}
          <div className="mt-8 pt-8 border-t border-white/20">
            <div className="flex items-center justify-center gap-12 text-white">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Star className="h-5 w-5 fill-white" />
                  <span className="font-bold text-xl">4.8</span>
                </div>
                <span className="text-sm opacity-90">Rating</span>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Users className="h-5 w-5" />
                  <span className="font-bold text-xl">12M+</span>
                </div>
                <span className="text-sm opacity-90">Customers</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
