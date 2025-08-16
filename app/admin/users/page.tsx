"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/admin-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Search, Eye, Phone, Mail, Calendar } from "lucide-react"
import { cleanGodService } from "@/lib/firebase-service"
import type { User } from "@/lib/types"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [roleFilter, setRoleFilter] = useState("all")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)

  useEffect(() => {
    fetchUsers()
    // Set up real-time updates every 10 seconds
    const interval = setInterval(fetchUsers, 10000)
    return () => clearInterval(interval)
  }, [])

  const fetchUsers = async () => {
    try {
      const usersData = await cleanGodService.getAllUsers()
      setUsers(usersData)
      setLoading(false)
    } catch (error) {
      console.error("Error fetching users:", error)
      setUsers([])
      setLoading(false)
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "customer":
        return "bg-blue-100 text-blue-800"
      case "professional":
        return "bg-green-100 text-green-800"
      case "admin":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.phone?.includes(searchQuery)
    const matchesRole = roleFilter === "all" || user.role === roleFilter
    return matchesSearch && matchesRole
  })

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold font-serif">Users</h1>
          <p className="text-muted-foreground">Manage customers and professionals</p>
          {/* Real-time indicator */}
          <div className="flex items-center mt-2 text-sm text-muted-foreground">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
            <span>Live data - Auto-refreshing every 10 seconds</span>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-2xl font-bold">{users.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Customers</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === "customer").length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Professionals</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.role === "professional").length}</p>
                </div>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Verified Users</p>
                  <p className="text-2xl font-bold">{users.filter((u) => u.isVerified).length}</p>
                </div>
                <div className="w-12 h-12 bg-secondary/20 rounded-lg flex items-center justify-center">
                  <Eye className="h-6 w-6 text-secondary" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full sm:w-48">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="customer">Customers</SelectItem>
                  <SelectItem value="professional">Professionals</SelectItem>
                  <SelectItem value="admin">Admins</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <div className="grid gap-4">
          {loading ? (
            <div className="text-center py-8">Loading users...</div>
          ) : filteredUsers.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">
                  {searchQuery || roleFilter !== "all"
                    ? "No users found matching your criteria."
                    : "No users found. Users will appear here when they register."}
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredUsers.map((user) => (
              <Card key={user.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="font-semibold text-primary">{user.name?.charAt(0) || "U"}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold">{user.name || "Unknown User"}</h3>
                          <Badge className={getRoleColor(user.role || "customer")}>{user.role || "customer"}</Badge>
                          {user.isVerified && <Badge variant="outline">Verified</Badge>}
                        </div>
                        <div className="grid md:grid-cols-2 gap-4 text-sm text-muted-foreground">
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{user.email || "No email"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone || "No phone"}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>
                                Joined{" "}
                                {user.createdAt
                                  ? new Date(user.createdAt.seconds * 1000).toLocaleDateString()
                                  : "Unknown"}
                              </span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <p>Addresses: {user.addresses?.length || 0}</p>
                            <p>Profile: {user.isVerified ? "Verified" : "Unverified"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="outline" size="sm" onClick={() => setSelectedUser(user)}>
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>User Details - {user.name}</DialogTitle>
                          </DialogHeader>
                          {selectedUser && (
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <h4 className="font-medium mb-2">Personal Information</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>Name: {selectedUser.name || "Not provided"}</p>
                                    <p>Email: {selectedUser.email || "Not provided"}</p>
                                    <p>Phone: {selectedUser.phone || "Not provided"}</p>
                                    <p>Role: {selectedUser.role || "customer"}</p>
                                    <p>Verified: {selectedUser.isVerified ? "Yes" : "No"}</p>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium mb-2">Activity</h4>
                                  <div className="space-y-1 text-sm">
                                    <p>
                                      Joined:{" "}
                                      {selectedUser.createdAt
                                        ? new Date(selectedUser.createdAt.seconds * 1000).toLocaleDateString()
                                        : "Unknown"}
                                    </p>
                                    <p>Addresses: {selectedUser.addresses?.length || 0}</p>
                                  </div>
                                </div>
                              </div>
                              <div>
                                <h4 className="font-medium mb-2">Addresses</h4>
                                {selectedUser.addresses && selectedUser.addresses.length > 0 ? (
                                  selectedUser.addresses.map((address, index) => (
                                    <div key={index} className="text-sm p-3 bg-muted rounded-lg mb-2">
                                      <p className="font-medium capitalize">{address.type || "Address"}</p>
                                      <p>{address.street}</p>
                                      <p>
                                        {address.city} - {address.pincode}
                                      </p>
                                    </div>
                                  ))
                                ) : (
                                  <p className="text-sm text-muted-foreground">No addresses added</p>
                                )}
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
