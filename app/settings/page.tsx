"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Bell, Shield, User, Smartphone, Mail } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"

export default function SettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    smsNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    bookingReminders: true,
    serviceUpdates: true,
  })
  const [isUpdating, setIsUpdating] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      loadUserPreferences()
    }
  }, [user, loading, router])

  const loadUserPreferences = async () => {
    if (!user) return

    try {
      // Load user preferences from Firestore
      const userPreferences = await firebaseService.getUserPreferences(user.id)
      if (userPreferences) {
        setPreferences(userPreferences)
      }
    } catch (error) {
      console.error("Error loading preferences:", error)
    }
  }

  const handlePreferenceChange = async (key: string, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)

    if (!user) return

    setIsUpdating(true)
    try {
      await firebaseService.updateUserPreferences(user.id, newPreferences)
    } catch (error) {
      console.error("Error updating preferences:", error)
      // Revert on error
      setPreferences(preferences)
    } finally {
      setIsUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 space-y-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
          <p className="text-gray-600">Manage your account preferences and notifications</p>
        </div>

        {/* Account Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Account Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Full Name</label>
                <Input value={user.name} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input value={user.email} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input value={user.phone} disabled />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Member Since</label>
                <Input value={new Date(user.createdAt).toLocaleDateString()} disabled />
              </div>
            </div>
            <Button variant="outline">Edit Profile</Button>
          </CardContent>
        </Card>

        {/* Notification Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5" />
              <span>Notification Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Email Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Email Notifications</span>
                </div>
              </div>
              <div className="space-y-3 ml-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Booking confirmations</p>
                    <p className="text-xs text-gray-500">Get notified when bookings are confirmed</p>
                  </div>
                  <Switch
                    checked={preferences.emailNotifications}
                    onCheckedChange={(checked) => handlePreferenceChange("emailNotifications", checked)}
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Service reminders</p>
                    <p className="text-xs text-gray-500">Reminders before scheduled services</p>
                  </div>
                  <Switch
                    checked={preferences.bookingReminders}
                    onCheckedChange={(checked) => handlePreferenceChange("bookingReminders", checked)}
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Service updates</p>
                    <p className="text-xs text-gray-500">Updates about your ongoing services</p>
                  </div>
                  <Switch
                    checked={preferences.serviceUpdates}
                    onCheckedChange={(checked) => handlePreferenceChange("serviceUpdates", checked)}
                    disabled={isUpdating}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Marketing emails</p>
                    <p className="text-xs text-gray-500">Promotional offers and new services</p>
                  </div>
                  <Switch
                    checked={preferences.marketingEmails}
                    onCheckedChange={(checked) => handlePreferenceChange("marketingEmails", checked)}
                    disabled={isUpdating}
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* SMS Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">SMS Notifications</span>
                </div>
                <Switch
                  checked={preferences.smsNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("smsNotifications", checked)}
                  disabled={isUpdating}
                />
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Receive important updates via SMS including booking confirmations and service reminders
              </p>
            </div>

            <Separator />

            {/* Push Notifications */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-gray-500" />
                  <span className="font-medium">Push Notifications</span>
                </div>
                <Switch
                  checked={preferences.pushNotifications}
                  onCheckedChange={(checked) => handlePreferenceChange("pushNotifications", checked)}
                  disabled={isUpdating}
                />
              </div>
              <p className="text-xs text-gray-500 ml-6">
                Get instant notifications on your device for real-time updates
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Privacy & Security */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Privacy & Security</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Two-factor authentication</p>
                <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
              </div>
              <Button variant="outline" size="sm">
                Enable
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Change password</p>
                <p className="text-sm text-gray-500">Update your account password</p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Delete account</p>
                <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
              </div>
              <Button variant="destructive" size="sm">
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
