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

  // Subscribe to real-time updates
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesData, categoriesData] = await Promise.all([
          firebaseService.getServices(), // Direct collection fetch like admin
          firebaseService.getCategories(), // Direct collection fetch like admin
        ])

        // Filter active services on client side
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
    <div className="min-h-screen bg-slate-50">
      {" "}
      {/* Applied off-white background */}
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-slate-800 font-serif">
            {" "}
            {/* Applied graphite text */}
            All Services
          </h1>
          <p className="text-slate-600">
            {" "}
            {/* Applied muted graphite */}
            Browse our complete home service offerings
          </p>
          <div className="flex items-center mt-2 text-sm text-slate-600">
            <div className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></div>{" "}
            {/* Applied emerald accent */}
            <span>Live data — updates automatically</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
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
            <SelectTrigger className="w-full sm:w-48">
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

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse bg-white">
                {" "}
                {/* White card background */}
                <div className="aspect-video bg-slate-200"></div>
                <CardContent className="p-6 space-y-2">
                  <div className="h-6 bg-slate-200 rounded"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                  <div className="h-10 bg-slate-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((s) => (
              <Card
                key={s.id}
                className="group hover:shadow-xl transition duration-300 bg-white border-slate-200" // White cards with subtle borders
              >
                <div className="aspect-video overflow-hidden">
                  <img
                    src={s.images?.[0] ?? "/placeholder.svg?height=300&width=400"}
                    alt={s.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex justify-between mb-2">
                    <h3 className="font-semibold text-lg truncate text-slate-800">
                      {" "}
                      {/* Graphite text */}
                      {s.name}
                    </h3>
                    <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                      {" "}
                      {/* Emerald badge */}
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {s.rating ?? 0}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-2 truncate">
                    {" "}
                    {/* Muted graphite */}
                    {s.shortDescription ?? s.description}
                  </p>
                  <Badge variant="outline" className="mb-3 text-xs border-emerald-200 text-emerald-700">
                    {" "}
                    {/* Emerald outline */}
                    {getCategoryName(s.categoryId)}
                  </Badge>
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center space-x-1">
                      <span className="font-bold text-emerald-600">
                        {" "}
                        {/* Emerald price */}₹{s.pricing?.[0]?.sellingPrice ?? 0}
                      </span>
                      {s.pricing?.[0]?.originalPrice &&
                        s.pricing[0].originalPrice > (s.pricing[0].sellingPrice ?? 0) && (
                          <span className="line-through text-sm text-slate-500">₹{s.pricing[0].originalPrice}</span>
                        )}
                    </div>
                    <div className="flex items-center text-xs text-slate-500 space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>{s.duration ?? 0} mins</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/services/details/${s.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 bg-transparent"
                      >
                        {" "}
                        {/* Emerald outline button */}
                        View Details
                      </Button>
                    </Link>
                    <Button onClick={() => handleAddToCart(s)} className="px-3 bg-emerald-600 hover:bg-emerald-700">
                      {" "}
                      {/* Emerald primary button */}
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">
              {" "}
              {/* Muted graphite */}
              {searchQuery || selectedCategory !== "all" ? "No matching services." : "No services available."}
            </p>
            <Button
              onClick={() => {
                setSearchQuery("")
                setSelectedCategory("all")
              }}
              className="bg-emerald-600 hover:bg-emerald-700" // Emerald button
            >
              Clear
            </Button>
          </div>
        )}
      </main>
    </div>
  )
}
