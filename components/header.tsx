"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useCart } from "@/contexts/cart-context"
import { UserMenu } from "./user-menu"
import { firebaseService } from "@/lib/firebase-service"
import type { Service, Product } from "@/lib/types"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ services: Service[]; products: Product[] }>({
    services: [],
    products: [],
  })
  const [showSearchResults, setShowSearchResults] = useState(false)
  const { getItemCount, isLoaded } = useCart()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const searchItems = async () => {
      if (searchQuery.length < 2) {
        setSearchResults({ services: [], products: [] })
        setShowSearchResults(false)
        return
      }

      try {
        const [services, products] = await Promise.all([firebaseService.getServices(), firebaseService.getProducts()])

        const filteredServices = services
          .filter(
            (service) =>
              service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              service.description.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 5)

        const filteredProducts = products
          .filter(
            (product) =>
              product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              product.description.toLowerCase().includes(searchQuery.toLowerCase()),
          )
          .slice(0, 5)

        setSearchResults({ services: filteredServices, products: filteredProducts })
        setShowSearchResults(true)
      } catch (error) {
        console.error("Search error:", error)
      }
    }

    const debounceTimer = setTimeout(searchItems, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  // Don't render cart count until mounted and cart is loaded
  const cartCount = mounted && isLoaded ? getItemCount() : 0

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/80 backdrop-blur-md supports-[backdrop-filter]:bg-white/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg text-white font-bold"
              style={{ backgroundColor: "#2DCE89" }}
            >
              CG
            </div>
            <span className="font-bold text-xl font-serif" style={{ color: "#2DCE89" }}>
              CleanGod
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/services"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "#1B1F22" }}
            >
              Services
            </Link>
            <Link
              href="/products"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "#1B1F22" }}
            >
              Products
            </Link>
            <Link
              href="/locations"
              className="text-sm font-medium hover:opacity-80 transition-opacity"
              style={{ color: "#1B1F22" }}
            >
              Locations
            </Link>
          </div>

          {/* Search Bar with Results */}
          <div className="hidden md:flex items-center space-x-2 flex-1 max-w-md mx-4 relative">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search for services..."
                className="pl-10 bg-gray-50 border-0 focus-visible:ring-1"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery.length >= 2 && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
              />

              {/* Search Results Popup */}
              {showSearchResults && (searchResults.services.length > 0 || searchResults.products.length > 0) && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg border z-50 max-h-96 overflow-y-auto">
                  {searchResults.services.length > 0 && (
                    <div className="p-2">
                      <h4 className="text-sm font-semibold text-gray-600 px-2 py-1">Services</h4>
                      {searchResults.services.map((service) => (
                        <Link
                          key={service.id}
                          href={`/services/details/${service.id}`}
                          className="block px-3 py-2 hover:bg-gray-50 rounded"
                        >
                          <div className="font-medium text-sm" style={{ color: "#1B1F22" }}>
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{service.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {searchResults.products.length > 0 && (
                    <div className="p-2 border-t">
                      <h4 className="text-sm font-semibold text-gray-600 px-2 py-1">Products</h4>
                      {searchResults.products.map((product) => (
                        <Link
                          key={product.id}
                          href={`/products/${product.id}`}
                          className="block px-3 py-2 hover:bg-gray-50 rounded"
                        >
                          <div className="font-medium text-sm" style={{ color: "#1B1F22" }}>
                            {product.name}
                          </div>
                          <div className="text-xs text-gray-500 truncate">{product.description}</div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-2">
            {/* Cart */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative hover:bg-gray-50">
                <ShoppingCart className="h-5 w-5" style={{ color: "#1B1F22" }} />
                {cartCount > 0 && (
                  <span
                    className="absolute -top-1 -right-1 h-5 w-5 rounded-full text-xs text-white flex items-center justify-center"
                    style={{ backgroundColor: "#2DCE89" }}
                  >
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {mounted && <UserMenu />}

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="sm" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-white py-4">
            <div className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search for services..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Mobile Navigation */}
              <div className="flex flex-col space-y-2">
                <Link
                  href="/services"
                  className="px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                  style={{ color: "#1B1F22" }}
                >
                  Services
                </Link>
                <Link
                  href="/products"
                  className="px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                  style={{ color: "#1B1F22" }}
                >
                  Products
                </Link>
                <Link
                  href="/locations"
                  className="px-3 py-2 text-sm font-medium hover:bg-gray-100 rounded-lg"
                  style={{ color: "#1B1F22" }}
                >
                  Locations
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
