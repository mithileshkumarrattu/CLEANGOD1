"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Plus, Edit, Trash2, ImageIcon } from "lucide-react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { firebaseService } from "@/lib/firebase-service"

interface Banner {
  id: string
  title: string
  imageUrl: string
  isActive: boolean
  order: number
  createdAt: string
}

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    imageUrl: "",
    isActive: true,
    order: 1,
  })

  useEffect(() => {
    fetchBanners()
  }, [])

  const fetchBanners = async () => {
    try {
      setLoading(true)
      const bannersData = await firebaseService.getBanners()
      setBanners(bannersData.sort((a: Banner, b: Banner) => a.order - b.order))
    } catch (error) {
      console.error("Error fetching banners:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingBanner) {
        await firebaseService.updateBanner(editingBanner.id, formData)
      } else {
        await firebaseService.createBanner(formData)
      }
      await fetchBanners()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving banner:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this banner?")) {
      try {
        await firebaseService.deleteBanner(id)
        await fetchBanners()
      } catch (error) {
        console.error("Error deleting banner:", error)
      }
    }
  }

  const handleEdit = (banner: Banner) => {
    setEditingBanner(banner)
    setFormData({
      title: banner.title,
      imageUrl: banner.imageUrl,
      isActive: banner.isActive,
      order: banner.order,
    })
    setIsDialogOpen(true)
  }

  const resetForm = () => {
    setEditingBanner(null)
    setFormData({
      title: "",
      imageUrl: "",
      isActive: true,
      order: 1,
    })
  }

  const toggleBannerStatus = async (id: string, isActive: boolean) => {
    try {
      await firebaseService.updateBanner(id, { isActive })
      await fetchBanners()
    } catch (error) {
      console.error("Error updating banner status:", error)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-[#1B1F22]">Banner Management</h1>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-[#2DCE89] hover:bg-[#25b377] text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Banner
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{editingBanner ? "Edit Banner" : "Add New Banner"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="order">Display Order</Label>
                  <Input
                    id="order"
                    type="number"
                    min="1"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: Number.parseInt(e.target.value) })}
                    required
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
                <Button type="submit" className="w-full bg-[#2DCE89] hover:bg-[#25b377] text-white">
                  {editingBanner ? "Update Banner" : "Create Banner"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {loading ? (
          <div className="text-center py-8">Loading banners...</div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {banners.map((banner) => (
              <Card key={banner.id} className="overflow-hidden">
                <div className="relative h-48">
                  {banner.imageUrl ? (
                    <img
                      src={banner.imageUrl || "/placeholder.svg"}
                      alt={banner.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2">
                    <Switch
                      checked={banner.isActive}
                      onCheckedChange={(checked) => toggleBannerStatus(banner.id, checked)}
                      size="sm"
                    />
                  </div>
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{banner.title}</CardTitle>
                  <p className="text-sm text-gray-500">Order: {banner.order}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(banner)} className="flex-1">
                      <Edit className="w-4 h-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(banner.id)} className="flex-1">
                      <Trash2 className="w-4 h-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {banners.length === 0 && !loading && (
          <div className="text-center py-12">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No banners yet</h3>
            <p className="text-gray-500 mb-4">Create your first banner to display in the hero section.</p>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
