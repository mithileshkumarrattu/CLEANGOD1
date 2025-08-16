"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, ArrowRight } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service" // Using firebaseService instead of cleanGodService
import type { Service } from "@/lib/types"

export function FeaturedServices() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const data = await firebaseService.getServices()
        const activeServices = data.filter((s) => s.isActive !== false)
        setServices(activeServices.slice(0, 6))
      } catch (error) {
        console.error("Error fetching services:", error)
        setServices([])
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-slate-50">
        {" "}
        {/* Off-white background */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-3xl font-bold font-serif">Featured Services</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="aspect-video bg-muted" />
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded mb-4" />
                  <div className="h-8 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (services.length === 0) {
    return (
      <section className="py-16 bg-slate-50">
        {" "}
        {/* Off-white background */}
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold font-serif mb-2 text-slate-800">
                {" "}
                {/* Graphite text */}
                Featured Services
              </h2>
              <p className="text-slate-600">Most popular services chosen by our customers</p> {/* Muted graphite */}
            </div>
          </div>
          <Card className="text-center py-12">
            <CardContent>
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg mb-2">No services available</h3>
              <p className="text-muted-foreground">Services will appear here once added by admin</p>
            </CardContent>
          </Card>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-slate-50">
      {" "}
      {/* Off-white background */}
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold font-serif mb-2 text-slate-800">
              {" "}
              {/* Graphite text */}
              Featured Services
            </h2>
            <p className="text-slate-600">Most popular services chosen by our customers</p> {/* Muted graphite */}
          </div>
          <Link href="/services">
            <Button
              variant="outline"
              className="hidden sm:flex items-center space-x-2 bg-white border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            >
              {" "}
              {/* Emerald outline button */}
              <span>View All</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Link key={service.id} href={`/services/details/${service.id}`}>
              <Card className="group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden border-0 bg-white">
                {" "}
                {/* White card background */}
                <div className="aspect-video overflow-hidden">
                  <img
                    src={service.images?.[0] || "/placeholder.svg?height=300&width=400&query=cleaning service"}
                    alt={service.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="font-semibold text-lg group-hover:text-emerald-600 transition-colors line-clamp-1 text-slate-800">
                      {" "}
                      {/* Emerald hover, graphite text */}
                      {service.name}
                    </h3>
                    <Badge variant="secondary" className="ml-2 shrink-0 bg-emerald-100 text-emerald-800">
                      {" "}
                      {/* Emerald badge */}
                      <Star className="h-3 w-3 fill-current mr-1" />
                      {service.rating || 4.8}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">{service.shortDescription}</p>{" "}
                  {/* Muted graphite */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg font-bold text-emerald-600">
                        ₹{service.pricing?.[0]?.sellingPrice || 0}
                      </span>{" "}
                      {/* Emerald price */}
                      {service.pricing?.[0]?.originalPrice &&
                        service.pricing[0].originalPrice > service.pricing[0].sellingPrice && (
                          <span className="text-sm text-slate-500 line-through">
                            {" "}
                            {/* Muted graphite */}₹{service.pricing[0].originalPrice}
                          </span>
                        )}
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-slate-500">
                      {" "}
                      {/* Muted graphite */}
                      <Clock className="h-3 w-3" />
                      <span>{service.duration || 60} mins</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="text-center mt-8 sm:hidden">
          <Link href="/services">
            <Button className="w-full max-w-sm bg-emerald-600 hover:bg-emerald-700">
              {" "}
              {/* Emerald button */}
              View All Services
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  )
}
