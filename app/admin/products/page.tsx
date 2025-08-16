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
import { Plus, Edit, Trash2, Package } from "lucide-react"
import { firebaseService } from "@/lib/firebase-service"
import type { Product } from "@/lib/types"

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    originalPrice: 0,
    category: "",
    image: "",
    inStock: true,
    featured: false,
  })

  useEffect(() => {
    loadProducts()
  }, [])

  const loadProducts = async () => {
    try {
      setLoading(true)
      const data = await firebaseService.getProducts()
      setProducts(data)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingProduct) {
        await firebaseService.updateProduct(editingProduct.id, formData)
      } else {
        await firebaseService.createProduct(formData)
      }
      await loadProducts()
      setIsDialogOpen(false)
      resetForm()
    } catch (error) {
      console.error("Error saving product:", error)
    }
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice || product.price,
      category: product.category,
      image: product.image || "",
      inStock: product.inStock,
      featured: product.featured || false,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await firebaseService.deleteProduct(id)
        await loadProducts()
      } catch (error) {
        console.error("Error deleting product:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: 0,
      originalPrice: 0,
      category: "",
      image: "",
      inStock: true,
      featured: false,
    })
    setEditingProduct(null)
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
            <h1 className="text-3xl font-bold font-serif">Products</h1>
            <p className="text-muted-foreground">Manage CleanGod cleaning products</p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingProduct ? "Edit Product" : "Add New Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="e.g., Floor Cleaner, Bathroom Cleaner"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="originalPrice">Original Price (₹)</Label>
                    <Input
                      id="originalPrice"
                      type="number"
                      value={formData.originalPrice}
                      onChange={(e) => setFormData({ ...formData, originalPrice: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="image">Image URL</Label>
                  <Input
                    id="image"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://example.com/product-image.jpg"
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="inStock"
                      checked={formData.inStock}
                      onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    />
                    <Label htmlFor="inStock">In Stock</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="featured"
                      checked={formData.featured}
                      onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    />
                    <Label htmlFor="featured">Featured Product</Label>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingProduct ? "Update" : "Create"}</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {products.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products yet</h3>
              <p className="text-muted-foreground mb-4">Add your first CleanGod product to get started</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Product
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                        {product.image ? (
                          <img
                            src={product.image || "/placeholder.svg"}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Package className="h-6 w-6 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{product.name}</h3>
                        <p className="text-muted-foreground text-sm">{product.description}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="font-semibold text-primary">₹{product.price}</span>
                          {product.originalPrice && product.originalPrice > product.price && (
                            <span className="text-sm text-muted-foreground line-through">₹{product.originalPrice}</span>
                          )}
                          <Badge variant="outline">{product.category}</Badge>
                          <Badge variant={product.inStock ? "default" : "secondary"}>
                            {product.inStock ? "In Stock" : "Out of Stock"}
                          </Badge>
                          {product.featured && <Badge variant="secondary">Featured</Badge>}
                        </div>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEdit(product)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(product.id)}>
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
