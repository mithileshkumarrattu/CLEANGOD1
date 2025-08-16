"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { firebaseService } from "@/lib/firebase-service"
import type { Category } from "@/lib/types"
import { Sparkles, Home, Wrench, Droplets, Wind, Zap, Brush, Shield } from "lucide-react"

// Icon mapping for categories
const categoryIcons = {
  "deep-cleaning": Sparkles,
  "bathroom-cleaning": Droplets,
  "kitchen-cleaning": Home,
  maintenance: Wrench,
  "ac-repair": Wind,
  electrical: Zap,
  painting: Brush,
  "pest-control": Shield,
}

export function ServiceCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await firebaseService.getCategories()
        const activeCategories = data.filter((category) => category.isActive !== false)
        setCategories(activeCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
        setCategories([])
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  if (loading) {
    return (
      <section className="py-16" style={{ backgroundColor: "#F1FCF7" }}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-96 mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4" />
                  <div className="h-4 bg-gray-200 rounded mb-2" />
                  <div className="h-3 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (categories.length === 0) {
    return (
      <section className="py-16" style={{ backgroundColor: "#F1FCF7" }}>
        <div className="container mx-auto px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold font-serif mb-4" style={{ color: "#1B1F22" }}>
              Service Categories
            </h2>
            <p style={{ color: "#475569" }}>No service categories available. Please check back later.</p>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16" style={{ backgroundColor: "#F1FCF7" }}>
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold font-serif mb-4" style={{ color: "#1B1F22" }}>
            Our Service Categories
          </h2>
          <p className="max-w-2xl mx-auto" style={{ color: "#475569" }}>
            Choose from our wide range of professional home services and premium cleaning products
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {categories.map((category) => {
            const IconComponent = categoryIcons[category.icon as keyof typeof categoryIcons] || Home

            return (
              <Link key={category.id} href={`/services?category=${category.id}`}>
                <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-0 bg-white/90 backdrop-blur-sm">
                  <CardContent className="p-6 text-center">
                    <div
                      className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: "#9FFFE1" }}
                    >
                      <IconComponent className="h-8 w-8" style={{ color: "#2DCE89" }} />
                    </div>
                    <h3
                      className="font-semibold text-sm mb-2 group-hover:scale-105 transition-transform"
                      style={{ color: "#1B1F22" }}
                    >
                      {category.name}
                    </h3>
                    <p className="text-xs line-clamp-2" style={{ color: "#475569" }}>
                      {category.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
