"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, FolderOpen } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Category } from "@/lib/types"

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "",
    image: "",
    active: true,
  })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setLoading(true)
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
        await firebaseService.updateCategory(editingCategory.id, formData)
      } else {
        await firebaseService.createCategory(formData)
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
      description: category.description || "",
      icon: category.icon || "",
      image: category.image || "",
      active: category.active !== false,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        await firebaseService.deleteCategory(id)
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
      image: "",
      active: true,
    })
    setEditingCategory(null)
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="space-y-6">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold font-serif">Categories</h1>
            <p className="text-muted-foreground">Manage service categories for CleanGod</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingCategory ? "Edit Category" : "Add New Category"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Category Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Deep Cleaning, Bathroom Cleaning"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="icon">Icon Name</Label>
                    <Input
                      id="icon"
                      value={formData.icon}
                      onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
                      placeholder="e.g., Sparkles, Home, Brush"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description of this category"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/category-image.jpg"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  />
                  <Label htmlFor="active">Active Category</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingCategory ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {categories.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No categories yet</h3>
              <p className="text-muted-foreground mb-4">Create your first service category to organize your services</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Category
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {categories.map((category) => (
              <Card key={category.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        {category.image ? (
                          <img
                            src={category.image || "/placeholder.svg"}
                            alt={category.name}
                            className="w-8 h-8 object-cover rounded"
                          />
                        ) : (
                          <FolderOpen className="h-6 w-6 text-primary" />
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{category.name}</h3>
                        {category.description && (
                          <p className="text-muted-foreground text-sm">{category.description}</p>
                        )}
                        <div className="flex items-center space-x-2 mt-2">
                          {category.icon && <Badge variant="outline">Icon: {category.icon}</Badge>}
                          <Badge variant={category.active !== false ? "default" : "secondary"}>
                            {category.active !== false ? "Active" : "Inactive"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            Created: {new Date(category.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(category.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
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
