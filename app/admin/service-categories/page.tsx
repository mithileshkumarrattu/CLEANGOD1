"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit, Trash2, Tag } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Category } from "@/lib/types"

export default function ServiceCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    isActive: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      const data = await firebaseService.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("Error loading categories:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingCategory) {
        await firebaseService.updateById("categories", editingCategory.id, {
          ...formData,
          updatedAt: new Date(),
        })
      } else {
        await firebaseService.create("categories", {
          ...formData,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
      }

      await loadCategories()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving category:", error)
    }
  }

  const handleEdit = (category: Category) => {
    setEditingCategory(category)
    setFormData({
      name: category.name,
      description: category.description,
      icon: category.icon,
      isActive: category.isActive,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await firebaseService.deleteById("categories", id)
        await loadCategories()
      } catch (error) {
        console.error("Error deleting category:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      icon: "",
      isActive: true,
    })
    setEditingCategory(null)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    resetForm()
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold font-serif" style={{ color: "#1B1F22" }}>
              Service Categories
            </h1>
            <p style={{ color: "#475569" }}>Manage service categories to organize your services</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="text-white" style={{ backgroundColor: "#2DCE89" }}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Deep Cleaning"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of the category"
                    rows={3}
                  />
                </div>

                <div>
                  <Label htmlFor="icon">Icon (Lucide icon name)</Label>
                  <Input
                    id="icon"
                    value={formData.icon}
                    onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="e.g., Home, Sparkles, Wrench"
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

                <div className="flex space-x-2">
                  <Button type="submit" className="flex-1 text-white" style={{ backgroundColor: "#2DCE89" }}>
                    {editingCategory ? "Update" : "Create"} Category
                  </Button>
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Tag className="h-12 w-12 mx-auto mb-4" style={{ color: "#475569" }} />
              <h3 className="font-semibold mb-2" style={{ color: "#1B1F22" }}>
                No categories yet
              </h3>
              <p className="mb-4" style={{ color: "#475569" }}>
                Create your first service category to organize your services
              </p>
              <Button
                onClick={() => setIsDialogOpen(true)}
                className="text-white"
                style={{ backgroundColor: "#2DCE89" }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category) => (
              <Card key={category.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg" style={{ color: "#1B1F22" }}>
                      {category.name}
                    </CardTitle>
                    <Badge variant={category.isActive ? "default" : "secondary"}>
                      {category.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm mb-4" style={{ color: "#475569" }}>
                    {category.description || "No description"}
                  </p>

                  {category.icon && (
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-xs font-medium" style={{ color: "#475569" }}>
                        Icon: {category.icon}
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)} className="flex-1">
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
