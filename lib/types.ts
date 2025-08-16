// Core data types for CleanGod platform

export interface User {
  id: string
  email?: string
  phone: string
  name: string
  avatar?: string
  addresses: Address[]
  role: "customer" | "provider" | "admin"
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Address {
  id: string
  type: "home" | "work" | "other"
  street: string
  area: string
  city: string
  state: string
  pincode: string
  landmark?: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  isDefault: boolean
}

export interface Location {
  id: string
  name: string
  state: string
  country: string
  coordinates?: {
    latitude: number
    longitude: number
  }
  isServiceable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  description: string
  icon: string
  image: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface ServiceCategory {
  id: string
  name: string
  description: string
  icon: string
  image: string
  isActive: boolean
  sortOrder: number
  createdAt: Date
  updatedAt: Date
}

export interface Service {
  id: string
  categoryId: string
  name: string
  description: string
  shortDescription: string
  images: string[]
  pricing: ServicePricing[]
  duration: number // in minutes
  isActive: boolean
  features: string[]
  requirements?: string[]
  sortOrder: number
  rating: number
  totalBookings: number
  createdAt: Date
  updatedAt: Date
}

export interface ServicePricing {
  id: string
  name: string // e.g., "1 BHK Empty", "2 BHK Occupied"
  originalPrice: number
  sellingPrice: number
  description?: string
}

export interface Product {
  id: string
  categoryId: string
  name: string
  description: string
  shortDescription?: string
  images: string[]
  price: number
  originalPrice?: number
  stock: number
  isActive: boolean
  rating?: number
  totalSales?: number
  createdAt: Date
  updatedAt: Date
}

export interface ProductVariant {
  id: string
  name: string // e.g., "250ml", "500ml"
  price: number
  originalPrice?: number
  stock: number
  sku: string
}

export interface Booking {
  id: string
  customerId: string
  customerName?: string
  customerEmail?: string
  customerPhone?: string
  services: BookingService[]
  professionalId?: string
  professionalName?: string
  status: "pending" | "confirmed" | "in-progress" | "completed" | "cancelled"
  scheduledDate: string
  scheduledTime: string
  address: Address
  subtotal: number
  discount: number
  taxes: number
  totalAmount: number
  paymentStatus: "pending" | "completed" | "failed" | "refunded"
  paymentMethod?: PaymentMethod
  paymentId?: string
  specialInstructions?: string
  createdAt: Date
  updatedAt: Date
}

export interface BookingService {
  id: string
  name: string
  price: number
  duration?: number
}

export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet"

export interface Order {
  id: string
  customerId: string
  items: OrderItem[]
  status: "pending" | "confirmed" | "shipped" | "delivered" | "cancelled"
  totalAmount: number
  deliveryAddress: Address
  paymentStatus: "pending" | "paid" | "failed" | "refunded"
  paymentId?: string
  trackingId?: string
  createdAt: Date
  updatedAt: Date
}

export interface OrderItem {
  productId: string
  variantId: string
  quantity: number
  price: number
}

export interface Review {
  id: string
  customerId: string
  bookingId?: string
  orderId?: string
  rating: number
  comment: string
  images?: string[]
  createdAt: Date
}

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  type: "service" | "product"
  quantity: number
  variantId?: string
  pricingId?: string
  scheduledDate?: Date
  scheduledTime?: string
  address?: Address
}

export interface AdminUser {
  id: string
  email: string
  name: string
  role: "super_admin" | "admin" | "manager"
  permissions: string[]
  isActive: boolean
  createdAt: Date
}

export interface SystemSettings {
  id: string
  key: string
  value: any
  description: string
  updatedAt: Date
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: "booking" | "order" | "payment" | "general"
  isRead: boolean
  data?: any
  createdAt: Date
}

export interface Coupon {
  id: string
  code: string
  title: string
  description: string
  type: "percentage" | "fixed"
  value: number
  minOrderAmount?: number
  maxDiscount?: number
  usageLimit?: number
  usedCount: number
  validFrom: Date
  validUntil: Date
  isActive: boolean
  applicableFor: "services" | "products" | "both"
  createdAt: Date
}
