"use client"

import { useState, useEffect } from "react"
import { firebaseService } from "@/lib/firebase-service"
import { useCart } from "@/contexts/cart-context"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ShoppingCart, Search, Star } from "lucide-react"
import type { Product, Category } from "@/lib/types"
import Image from "next/image"

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("name")
  const { addItem } = useCart()

  useEffect(() => {
    loadData()
    // Set up real-time updates every 5 seconds
    const interval = setInterval(loadData, 5000)
    return () => clearInterval(interval)
  }, [])

  const loadData = async () => {
    try {
      const [productsData, categoriesData] = await Promise.all([
        firebaseService.getProducts(),
        firebaseService.getCategories(),
      ])

      const activeProducts = productsData.filter((product) => product.isActive !== false)

      setProducts(activeProducts)
      setCategories(categoriesData)
    } catch (error) {
      console.error("Error loading products:", error)
      setProducts([])
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products
    .filter((product) => {
      const matchesSearch =
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesCategory = selectedCategory === "all" || product.categoryId === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return a.price - b.price
        case "price-high":
          return b.price - a.price
        case "rating":
          return (b.rating || 0) - (a.rating || 0)
        default:
          return a.name.localeCompare(b.name)
      }
    })

  const handleAddToCart = (product: Product) => {
    addItem({
      type: "product",
      id: product.id,
      pricingId: "default",
      quantity: 1,
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Premium Cleaning Products</h1>

          {/* Real-time indicator */}
          <div className="flex items-center mb-4 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Live data - Auto-refreshing every 5 seconds</span>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Category" />
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

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price-low">Price: Low to High</SelectItem>
                <SelectItem value="price-high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <ShoppingCart className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">
              {searchQuery || selectedCategory !== "all"
                ? "Try adjusting your search or filters"
                : "Products will appear here once added by admin"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square relative">
                  <Image
                    src={product.images?.[0] || "/placeholder.svg?height=300&width=300&query=cleaning product"}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Badge variant="destructive">Out of Stock</Badge>
                    </div>
                  )}
                </div>

                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{product.name}</CardTitle>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </CardHeader>

                <CardContent className="pt-0">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span className="text-2xl font-bold text-blue-600">₹{product.price}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-sm text-gray-500 line-through">₹{product.originalPrice}</span>
                      )}
                    </div>
                    {product.rating && (
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.rating}</span>
                      </div>
                    )}
                  </div>

                  <Button onClick={() => handleAddToCart(product)} disabled={product.stock === 0} className="w-full">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to Cart
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
