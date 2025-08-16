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
const SERVICES = [
  {
    name: "Paint Services",
    icon: "https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1750845033589-98cdfb.jpeg",
    path: "/services/paint",
  },
  {
    name: "Home Cleaning",
    icon: "https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1678864013225-bfc1de.jpeg",
    path: "/services/home-cleaning",
  },
  {
    name: "Appliance Repair",
    icon: "https://res.cloudinary.com/urbanclap/image/upload/t_high_res_category/w_56,dpr_2,fl_progressive:steep,q_auto:low,f_auto,c_limit/images/supply/customer-app-supply/1741326936056-c3a39a.jpeg",
    path: "/services/appliance-repair",
  },
]
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

  // Function to split services into pairs for window layout
  const getServiceRows = () => {
    const rows = []
    const perRow = 2
    for (let i = 0; i < SERVICES.length; i += perRow) {
      rows.push(SERVICES.slice(i, i + perRow))
    }
    return rows
  }

  return (
    <>
      {/* Desktop Hero Section */}
      <section className="hidden md:block relative bg-white overflow-hidden w-full">
        {/* Banner Carousel: FULL WIDTH, BELOW HEADER */}
        <div className="w-full">
          <div className="relative w-full h-[370px] md:h-[450px] lg:h-[525px] overflow-hidden">
            {banners.length > 0 && (
              <>
                <img
                  src={banners[currentBannerIndex]?.imageUrl || "/placeholder.svg"}
                  alt={banners[currentBannerIndex]?.title}
                  className="w-full h-full object-cover"
                />
                {banners.length > 1 && (
                  <>
                    <button
                      onClick={prevBanner}
                      className="absolute left-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md transition-all z-10 border border-gray-200"
                    >
                      <ChevronLeft className="w-4 h-4 text-black" />
                    </button>
                    <button
                      onClick={nextBanner}
                      className="absolute right-5 top-1/2 -translate-y-1/2 w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center shadow-md transition-all z-10 border border-gray-200"
                    >
                      <ChevronRight className="w-4 h-4 text-black" />
                    </button>
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {banners.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentBannerIndex(index)}
                          className={`w-2.5 h-2.5 rounded-full transition-all border ${index === currentBannerIndex ? "bg-black border-black" : "bg-gray-200 border-gray-300"}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
        {/* Section BELOW the banner, with 2 columns: Left (buttons), Right (service window) */}
        <div className="container mx-auto px-8 flex mt-6 items-start">
          {/* LEFT: Actions (stacked vertically, detect location first) */}
          <div className="flex flex-col justify-start items-start w-1/2 pt-2" style={{ minHeight: "340px" }}>
            <Button
              onClick={detectLocation}
              disabled={detectingLocation}
              className="mb-6 py-4 px-8 rounded-2xl font-semibold text-lg bg-white border border-gray-200 text-black hover:bg-gray-100 shadow-md transition focus:outline-none flex items-center gap-2"
            >
              <MapPin className={`w-6 h-6 text-black ${detectingLocation ? "animate-pulse" : ""}`} />
              {detectingLocation ? "Detecting..." : "Detect Location"}
            </Button>
            {currentLocation && (
              <div className="mb-6 p-4 bg-white rounded-xl border border-gray-200 shadow-sm flex items-center gap-3 max-w-md">
                <MapPin className="w-5 h-5 text-black" />
                <div>
                  <p className="text-sm text-gray-600">Deliver to</p>
                  <p className="font-medium text-black truncate max-w-xs">{currentLocation.name}</p>
                </div>
              </div>
            )}
            <Button
              onClick={() => router.push("/services")}
              className="mb-4 py-4 px-8 rounded-2xl font-semibold text-lg bg-blue-600 hover:bg-blue-700 text-white shadow-md transition focus:outline-none w-full"
            >
              <div className="flex items-center gap-2 justify-center w-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                </svg>
                Explore Services
              </div>
            </Button>
            <Button
              onClick={() => router.push("/products")}
              className="py-4 px-8 rounded-2xl font-semibold text-lg bg-cyan-600 hover:bg-cyan-700 text-white shadow-md transition focus:outline-none w-full"
            >
              <div className="flex items-center gap-2 justify-center w-full">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
                </svg>
                Explore Products
              </div>
            </Button>
          </div>
          {/* RIGHT: Service Selector Window: 2-PADDED services per row */}
          <div className="w-1/2 flex flex-col items-center justify-start">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 mb-4 max-w-sm w-full">
              <h3 className="font-semibold text-lg mb-5 text-center">Select Service Type</h3>
              <div className="flex flex-col gap-3">
                {getServiceRows().map((pair, rowIdx) => (
                  <div key={rowIdx} className="flex gap-3">
                    {pair.map((service) => (
                      <button
                        key={service.name}
                        onClick={() => router.push(service.path)}
                        className="flex-1 flex items-center gap-3 px-3 py-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 transition cursor-pointer shadow-sm"
                      >
                        <img src={service.icon} alt={service.name} width={40} height={40} className="rounded-xl border" />
                        <span className="font-medium text-gray-900 text-base">{service.name}</span>
                      </button>
                    ))}
                    {pair.length < 2 && <div className="flex-1"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Mobile Hero Section (unchanged except layout) */}
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
                      className={`w-[0.4rem] h-[0.4rem] rounded-full transition-all border ${
                        index === currentBannerIndex ? "bg-black border-black" : "bg-gray-200 border-gray-300"
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
          <div className="flex-1 flex flex-col justify-center space-y-6">
            <Button
              onClick={detectLocation}
              disabled={detectingLocation}
              className="mb-4 w-full bg-white text-black hover:bg-gray-100 rounded-2xl py-4 px-6 flex items-center justify-center text-lg font-semibold shadow-sm border border-gray-200 hover:border-black transition"
            >
              <MapPin className={`w-6 h-6 text-black mr-2 ${detectingLocation ? "animate-pulse" : ""}`} />
              {detectingLocation ? "Detecting Location..." : "Detect Location"}
            </Button>
            {currentLocation && (
              <div className="p-4 bg-white rounded-2xl border border-gray-200 mb-4">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-black" />
                  <div>
                    <p className="text-sm text-gray-600">Deliver to</p>
                    <p className="font-medium text-black truncate">{currentLocation.name}</p>
                  </div>
                </div>
              </div>
            )}
            <Button
              onClick={() => router.push("/services")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-4 px-6 flex items-center justify-center text-lg font-semibold shadow-sm border border-blue-700 transition"
            >
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M12 3L2 12h3v8h6v-6h2v6h6v-8h3L12 3z" />
                </svg>
                Home Services
              </div>
            </Button>
            <Button
              onClick={() => router.push("/products")}
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white rounded-2xl py-4 px-6 flex items-center justify-center text-lg font-semibold shadow-sm border border-cyan-700 transition"
            >
              <div className="flex items-center gap-2">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path d="M19 7h-3V6a4 4 0 0 0-8 0v1H5a1 1 0 0 0-1 1v11a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8a1 1 0 0 0-1-1z" />
                </svg>
                Premium Products
              </div>
            </Button>
            {/* SERVICE SELECTOR - two-per-row for mobile */}
            <div className="w-full mt-4">
              <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-4 flex flex-col gap-3">
                <div className="text-center font-semibold text-base mb-1">Choose a Service</div>
                {getServiceRows().map((pair, rowIdx) => (
                  <div key={rowIdx} className="flex gap-2">
                    {pair.map((service) => (
                      <button
                        key={service.name}
                        onClick={() => router.push(service.path)}
                        className="flex-1 flex items-center gap-2 px-3 py-3 rounded-lg border border-gray-100 bg-gray-50 hover:bg-blue-50 transition shadow"
                      >
                        <img src={service.icon} alt={service.name} width={32} height={32} className="rounded-xl border" />
                        <span className="font-medium text-gray-900 text-sm">{service.name}</span>
                      </button>
                    ))}
                    {pair.length < 2 && <div className="flex-1"></div>}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
