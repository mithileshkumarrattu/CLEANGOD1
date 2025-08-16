"use client"

import { useEffect, useState } from "react"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Star, Clock, Plus } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import { useCart } from "@/contexts/cart-context"
import type { Service, Category } from "@/lib/types"
import Link from "next/link"

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filtered, setFiltered] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [sortBy, setSortBy] = useState("popular")

  const { addItem } = useCart()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, categoriesData] = await Promise.all([
          firebaseService.getServices(),
          firebaseService.getCategories(),
        ])

        const activeServices = servicesData.filter((s) => s.isActive !== false)
        setServices(activeServices)
        setFiltered(activeServices)
        setCategories(categoriesData)
      } catch (error) {
        console.error("Error fetching data:", error)
        setServices([])
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Filter and sort whenever dependencies change
  useEffect(() => {
    let list = [...services]
    const q = searchQuery.trim().toLowerCase()

    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.shortDescription.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q),
      )
    }

    if (selectedCategory !== "all") {
      list = list.filter((s) => s.categoryId === selectedCategory)
    }

    switch (sortBy) {
      case "price-low":
        list.sort((a, b) => {
          const a0 = a.pricing?.[0]
          const b0 = b.pricing?.[0] // Fixed syntax error
          const pa = a0?.sellingPrice ?? a0?.originalPrice ?? 0
          const pb = b0?.sellingPrice ?? b0?.originalPrice ?? 0
          return pa - pb
        })
        break
      case "price-high":
        list.sort((a, b) => {
          const a0 = a.pricing?.[0]
          const b0 = b.pricing?.[0] // Fixed syntax error
          const pa = a0?.sellingPrice ?? a0?.originalPrice ?? 0
          const pb = b0?.sellingPrice ?? b0?.originalPrice ?? 0
          return pb - pa
        })
        break
      case "rating":
        list.sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
        break
      default:
        // popular
        list.sort((a, b) => (b.totalBookings ?? 0) - (a.totalBookings ?? 0))
    }

    setFiltered(list)
  }, [services, searchQuery, selectedCategory, sortBy])

  const handleAddToCart = (svc: Service) => {
    const tier = svc.pricing?.[0]
    if (!tier) return
    addItem({
      type: "service",
      id: svc.id,
      pricingId: tier.id ?? tier.name,
      quantity: 1,
    })
  }

  const getCategoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id

  return (
    <div className="min-h-screen bg-[#FAFAFB]">
      <Header />
      <main className="container mx-auto px-4 md:px-6 py-6 md:py-8 pb-24 md:pb-8">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold mb-2 text-[#1B1F22] font-serif">All Services</h1>
          <p className="text-[#475569] text-sm md:text-base">Browse our complete home service offerings</p>
          <div className="flex items-center mt-2 text-xs md:text-sm text-[#475569]">
            <div className="w-2 h-2 bg-[#2DCE89] rounded-full mr-2 animate-pulse"></div>
            <span>Live data — updates automatically</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 md:h-10 text-base md:text-sm border-gray-200 focus:border-[#2DCE89] bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3 md:flex md:gap-4">
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="h-12 md:h-10 md:w-48 border-gray-200 focus:border-[#2DCE89] bg-white">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="h-12 md:h-10 md:w-48 border-gray-200 focus:border-[#2DCE89] bg-white">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popular">Most Popular</SelectItem>
                <SelectItem value="rating">Highest Rated</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-white border-0 shadow-sm">
                <div className="aspect-video bg-gray-200"></div>
                <CardContent className="p-4 md:p-6 space-y-2">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          /* Improved mobile grid layout with better card spacing and touch targets */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filtered.map((s) => (
              <Card
                key={s.id}
                className="group hover:shadow-lg transition duration-300 bg-white border-0 shadow-sm rounded-xl md:rounded-lg overflow-hidden"
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={s.images?.[0] ?? "/placeholder.svg?height=300&width=400"}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <CardContent className="p-4 md:p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg md:text-lg text-[#1B1F22] line-clamp-1">{s.name}</h3>
                    <Badge variant="secondary" className="bg-[#F1FCF7] text-[#2DCE89] border-0 ml-2 shrink-0">
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {s.rating ?? 0}
                    </Badge>
                  </div>
                  <p className="text-sm text-[#475569] mb-3 line-clamp-2">{s.shortDescription ?? s.description}</p>
                  <Badge variant="outline" className="mb-3 text-xs border-[#9FFFE1] text-[#2DCE89] bg-[#F1FCF7]">
                    {getCategoryName(s.categoryId)}
                  </Badge>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-lg text-[#2DCE89]">₹{s.pricing?.[0]?.sellingPrice ?? 0}</span>
                      {s.pricing?.[0]?.originalPrice &&
                        s.pricing[0].originalPrice > (s.pricing[0].sellingPrice ?? 0) && (
                          <span className="line-through text-sm text-[#475569]">₹{s.pricing[0].originalPrice}</span>
                        )}
                    </div>
                    <div className="flex items-center text-xs text-[#475569] space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{s.duration ?? 0} mins</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/services/details/${s.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full h-11 md:h-10 border-[#2DCE89] text-[#2DCE89] hover:bg-[#F1FCF7] bg-transparent font-medium"
                      >
                        View Details
                      </Button>
                    </Link>
                    <Button
                      onClick={() => handleAddToCart(s)}
                      className="px-4 h-11 md:h-10 bg-[#2DCE89] hover:bg-[#25b377] text-white"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-[#475569] mb-4">
              {searchQuery || selectedCategory !== "all" ? "No matching services." : "No services available."}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="bg-[#2DCE89] hover:bg-[#25b377] text-white h-11 px-6"
            >
              Clear Filters
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
