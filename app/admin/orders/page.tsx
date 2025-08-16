"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Search, Plus, Edit, Trash2, Package, Calendar, User, DollarSign } from "lucide-react"
import { cleanGodService } from "@/lib/firebase-service"
import type { Order } from "@/lib/types"

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)

  const [formData, setFormData] = useState({
    customerId: "",
    customerName: "",
    customerEmail: "",
    items: [],
    totalAmount: 0,
    status: "pending" as Order["status"],
    shippingAddress: "",
    notes: "",
  })

  const fetchOrders = async () => {
    try {
      const ordersData = await cleanGodService.getAllOrders()
      setOrders(ordersData)
      setFilteredOrders(ordersData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching orders:", error)
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchOrders()
  }, [])

  useEffect(() => {
    let filtered = orders

    if (searchQuery) {
      filtered = filtered.filter(
        (order) =>
          order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.customerEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          order.id.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((order) => order.status === statusFilter)
    }

    setFilteredOrders(filtered)
  }, [orders, searchQuery, statusFilter])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingOrder) {
        await cleanGodService.updateOrder(editingOrder.id, formData)
      } else {
        await cleanGodService.createOrder(formData)
      }

      await fetchOrders()
      setIsCreateDialogOpen(false)
      setEditingOrder(null)
      resetForm()
    } catch (error) {
      console.error("Error saving order:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this order?")) {
      try {
        await cleanGodService.delete("orders", id)
        await fetchOrders()
      } catch (error) {
        console.error("Error deleting order:", error)
      }
    }
  }

  const resetForm = () => {
    setFormData({
      customerId: "",
      customerName: "",
      customerEmail: "",
      items: [],
      totalAmount: 0,
      status: "pending",
      shippingAddress: "",
      notes: "",
    })
  }

  const openEditDialog = (order: Order) => {
    setEditingOrder(order)
    setFormData({
      customerId: order.customerId || "",
      customerName: order.customerName || "",
      customerEmail: order.customerEmail || "",
      items: order.items || [],
      totalAmount: order.totalAmount || 0,
      status: order.status || "pending",
      shippingAddress: order.shippingAddress || "",
      notes: order.notes || "",
    })
    setIsCreateDialogOpen(true)
  }

  const getStatusColor = (status: Order["status"]) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "confirmed":
        return "bg-blue-100 text-blue-800"
      case "processing":
        return "bg-purple-100 text-purple-800"
      case "shipped":
        return "bg-indigo-100 text-indigo-800"
      case "delivered":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Orders Management</h1>
            <p className="text-muted-foreground">Manage customer orders and track deliveries</p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm}>
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingOrder ? "Edit Order" : "Create New Order"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Customer Name</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="customerEmail">Customer Email</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      value={formData.customerEmail}
                      onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="totalAmount">Total Amount (₹)</Label>
                    <Input
                      id="totalAmount"
                      type="number"
                      value={formData.totalAmount}
                      onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value: Order["status"]) => setFormData({ ...formData, status: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="shippingAddress">Shipping Address</Label>
                  <Textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => setFormData({ ...formData, shippingAddress: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={2}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">{editingOrder ? "Update" : "Create"} Order</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search orders..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="processing">Processing</SelectItem>
              <SelectItem value="shipped">Shipped</SelectItem>
              <SelectItem value="delivered">Delivered</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="grid gap-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-6 bg-muted rounded mb-2" />
                  <div className="h-4 bg-muted rounded mb-4" />
                  <div className="h-10 bg-muted rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <Card key={order.id}>
                <CardContent className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">Order #{order.id.slice(-8)}</h3>
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground mt-1">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {order.customerName || "Unknown Customer"}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {order.createdAt ? new Date(order.createdAt.seconds * 1000).toLocaleDateString() : "N/A"}
                        </div>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 mr-1" />₹{order.totalAmount || 0}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(order.status || "pending")}>{order.status || "pending"}</Badge>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(order)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDelete(order.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {order.shippingAddress && (
                    <div className="text-sm text-muted-foreground mb-2">
                      <strong>Shipping:</strong> {order.shippingAddress}
                    </div>
                  )}

                  {order.notes && (
                    <div className="text-sm text-muted-foreground">
                      <strong>Notes:</strong> {order.notes}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {filteredOrders.length === 0 && !loading && (
          <Card>
            <CardContent className="p-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No orders found</h3>
              <p className="text-muted-foreground mb-4">
                {searchQuery || statusFilter !== "all"
                  ? "No orders match your current filters."
                  : "No orders have been created yet. Create your first order to get started."}
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Order
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </AdminLayout>
  )
}
