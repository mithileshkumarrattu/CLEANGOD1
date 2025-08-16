"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Header } from "@/components/header"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Clock } from "lucide-react"
import { format, addDays, isSameDay } from "date-fns"

export default function TimeSelectionPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const serviceId = searchParams.get("serviceId")
  const pricingId = searchParams.get("pricingId")

  const [selectedDate, setSelectedDate] = useState<Date>(new Date())
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [serviceName, setServiceName] = useState("1 BHK Deep Cleaning")

  // Available time slots
  const timeSlots = ["11:30 AM", "12:30 PM", "01:00 PM", "02:30 PM", "03:30 PM", "04:30 PM"]

  const handleContinue = () => {
    if (!selectedTime) return

    const bookingData = {
      serviceId,
      pricingId,
      date: selectedDate.toISOString(),
      time: selectedTime,
    }

    const params = new URLSearchParams(bookingData as any)
    router.push(`/booking/address-selection?${params.toString()}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={() => router.back()} className="p-0 h-auto">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Summary
          </Button>
        </div>

        {/* Selected Service */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted">
                <img
                  src="/placeholder.svg?height=64&width=64"
                  alt={serviceName}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{serviceName}</h3>
                <p className="text-sm text-muted-foreground">₹3609</p>
                <div className="flex items-center space-x-2 mt-1">
                  <Clock className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">45 mins</span>
                  <span className="text-xs text-muted-foreground">• For all skin types</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Selection */}
        <Card>
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-6">Select time</h2>
            <p className="text-sm text-muted-foreground mb-6">Your service will take approx. 45 mins</p>

            {/* Date Selection */}
            <div className="mb-6">
              <div className="flex space-x-2 mb-4 overflow-x-auto pb-2">
                {Array.from({ length: 7 }).map((_, index) => {
                  const date = addDays(new Date(), index)
                  const isSelected = isSameDay(date, selectedDate)
                  const isToday = index === 0

                  return (
                    <button
                      key={index}
                      onClick={() => setSelectedDate(date)}
                      className={`flex flex-col items-center p-3 rounded-xl min-w-[80px] transition-all ${
                        isSelected ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                      }`}
                    >
                      <span className="text-xs font-medium">{isToday ? "Today" : format(date, "EEE")}</span>
                      <span className="text-lg font-bold mt-1">{format(date, "d")}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Time Slots */}
            <div className="grid grid-cols-3 gap-3 mb-6">
              {timeSlots.map((time) => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all ${
                    selectedTime === time ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Continue Button */}
            <Button onClick={handleContinue} disabled={!selectedTime} className="w-full h-12 text-base font-medium">
              Proceed to checkout
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
