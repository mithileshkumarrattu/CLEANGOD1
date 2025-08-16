"use client"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { MapPin, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
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
  const router = useRouter()
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null)
  const [mounted, setMounted] = useState(false)
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0)
  const [detectingLocation, setDetectingLocation] = useState(false)
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
  const detectLocation = async () => {
    if (!("geolocation" in navigator)) {
      alert("Geolocation is not supported by your browser.")
      return
    }
    setDetectingLocation(true)
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
          )
          const data = await response.json()
          const location: Location = {
            id: `${latitude}-${longitude}`,
            name: data.display_name || `${latitude}, ${longitude}`,
            address: data.display_name || `${latitude}, ${longitude}`,
            coordinates: { lat: latitude, lng: longitude },
          }
          setCurrentLocation(location)
          if (typeof window !== "undefined") {
            localStorage.setItem("selectedLocation", JSON.stringify(location))
          }
        } catch (error) {
          console.error("Error getting address:", error)
          alert("Could not get your address. Please try again.")
        } finally {
          setDetectingLocation(false)
        }
      },
      (error) => {
        console.error("Geolocation error:", error)
        let message = "Could not get your location. "
        switch (error.code) {
          case 1: message += "Permission denied."; break
          case 2: message += "Position unavailable."; break
          case 3: message += "Request timed out."; break
          default: message += "Unknown error."
        }
        alert(message)
        setDetectingLocation(false)
      }
    )
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
      <section className="hidden md:block w-full bg-white overflow-hidden pt-0">
        {/* Banner Carousel: full width below the header */}
        <div className="w-full relative">
          {banners.length > 0 && (
            <div className="relative w-full h-[400px] md:h-[480px] lg:h-[540px] xl:h-[600px] overflow-hidden">
              <img
                src={banners[currentBannerIndex]?.imageUrl || "/placeholder.svg"}
                alt={banners[currentBannerIndex]?.title}
                className="w-full h-full object-cover object-center transition-all duration-500"
              />
              {/* Carousel controls */}
              {banners.length > 1 && (
                <>
                  <button
                    onClick={prevBanner}
                    className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md transition-all z-10 border border-gray-200"
                  >
                    <ChevronLeft className="w-5 h-5 text-black" />
                  </button>
                  <button
                    onClick={nextBanner}
                    className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md transition-all z-10 border border-gray-200"
                  >
                    <ChevronRight className="w-5 h-5 text-black" />
                  </button>
                  {/* Indicator Dots */}
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-10">
                    {banners.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentBannerIndex(index)}
                        className={`w-3 h-3 rounded-full transition-all border ${index === currentBannerIndex ? "bg-black border-black" : "bg-gray-200 border-gray-300"
                          }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
        {/* Content below banner, left-aligned and vertically centered in left half */}
        <div className="container mx-auto px-8 py-0 flex w-full">
          <div className="w-1/2 flex flex-col justify-center min-h-[420px] pt-14">
            <div>
              <h1 className="font-bold text-5xl lg:text-6xl text-black leading-tight mb-7">
                Bringing home services,<br />
                at your <span className="text-black">fingertips</span>
              </h1>
              <p className="text-lg text-[#111] leading-relaxed mb-10">
                Discover a simpler way to manage your home with professional cleaning services and premium products.
              </p>
            </div>
            {currentLocation && (
              <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 max-w-md mb-4">
                <MapPin className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Deliver to</p>
                  <p className="font-medium text-black truncate max-w-xs">{currentLocation.name}</p>
                </div>
              </div>
            )}
            {/* Action Buttons - Styled after reference with solid look, padding, rounded shape */}
            <div className="flex gap-4 max-w-md w-full">
              <Button
                onClick={() => router.push("/services")}
                className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-[#171c29] text-white hover:bg-[#10131d] transition-shadow shadow-none hover:shadow-md"
              >
                Explore Services
              </Button>
              <Button
                onClick={() => router.push("/products")}
                className="flex-1 py-4 px-6 rounded-2xl font-semibold text-lg bg-[#f5b94d] text-white hover:bg-[#e0993c] transition-shadow shadow-none hover:shadow-md"
              >
                Explore Products
              </Button>
            </div>
            <Button
              onClick={detectLocation}
              disabled={detectingLocation}
              className="mt-4 w-full max-w-md py-4 px-6 rounded-2xl font-semibold text-lg bg-white border border-[#171c29] text-[#171c29] hover:bg-gray-50 hover:border-black transition-shadow shadow-none hover:shadow-md flex gap-2 items-center justify-center"
            >
              <MapPin className={`w-6 h-6 ${detectingLocation ? "animate-pulse" : ""}`} />{detectingLocation ? "Detecting..." : "Detect Location"}
            </Button>
          </div>
        </div>
      </section>
      {/* Mobile Hero Section */}
      <section className="md:hidden min-h-screen bg-white relative overflow-hidden">
        <div className="relative z-10 px-6 py-12 min-h-screen flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm">
                <img src="/cleangod-logo.png" alt="CleanGod" className="w-8 h-8 rounded-full" />
              </div>
              <span className="text-black font-bold text-xl">CleanGod</span>
            </div>
          </div>
          {banners.length > 0 && (
            <div className="relative h-48 w-full rounded-2xl overflow-hidden shadow-md mb-8">
              <img
                src={banners[currentBannerIndex]?.imageUrl || "/placeholder.svg"}
                alt={banners[currentBannerIndex]?.title}
                className="w-full h-full object-cover"
              />
              {banners.length > 1 && (
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1">
                  {banners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBannerIndex(index)}
                      className={`w-[0.4rem] h-[0.4rem] rounded-full transition-all border ${index === currentBannerIndex ? "bg-black border-black" : "bg-gray-200 border-gray-300"
                        }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center space-y-8">
            <div>
              <h1 className="text-black font-bold text-4xl leading-tight mb-6">
                Bringing home services
                <br />
                at your
                <br />
                <span className="text-black">fingertips</span>
              </h1>
            </div>
            {currentLocation && (
              <div className="p-4 bg-white rounded-2xl border border-gray-200">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-sm text-gray-600">Deliver to</p>
                    <p className="font-medium text-black truncate">{currentLocation.name}</p>
                  </div>
                </div>
              </div>
            )}
            <div className="space-y-4">
              <Button
                onClick={() => router.push("/services")}
                className="w-full bg-[#171c29] text-white hover:bg-[#10131d] rounded-2xl py-5 px-6 flex items-center justify-between text-lg font-semibold shadow-none hover:shadow-md transition"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                    </svg>
                  </div>
                  Home Services
                </div>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                onClick={() => router.push("/products")}
                className="w-full bg-[#f5b94d] text-white hover:bg-[#e0993c] rounded-2xl py-5 px-6 flex items-center justify-between text-lg font-semibold shadow-none hover:shadow-md transition"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
                    </svg>
                  </div>
                  Premium Products
                </div>
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
              <Button
                onClick={detectLocation}
                disabled={detectingLocation}
                className="w-full bg-white text-[#171c29] border border-[#171c29] hover:bg-gray-50 hover:border-black rounded-2xl py-5 px-6 flex items-center justify-between text-lg font-semibold shadow-none hover:shadow-md transition"
              >
                <div className={`flex items-center ${detectingLocation ? "animate-pulse" : ""}`}>
                  <div className="w-10 h-10 flex items-center justify-center mr-4">
                    <MapPin className="w-6 h-6 text-[#171c29]" />
                  </div>
                  {detectingLocation ? "Detecting Location..." : "Detect Location"}
                </div>
                <svg className="w-5 h-5 text-[#171c29]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
