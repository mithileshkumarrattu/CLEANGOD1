import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import type {
  ServiceCategory,
  Service,
  Product,
  Booking,
  Order,
  Review,
  Notification,
  Coupon,
  User,
  Address,
  Location,
  Category,
} from "./types"

// Generic Firestore service class
class FirebaseService {
  async initializeCollections() {
    if (typeof window === "undefined") {
      return
    }

    const collections = [
      "categories",
      "serviceCategories",
      "services",
      "products",
      "locations",
      "users",
      "bookings",
      "orders",
      "reviews",
      "notifications",
      "coupons",
      "banners", // Added banners collection to initialization
      "serviceboys", // Added serviceboys collection to initialization
    ]

    for (const collectionName of collections) {
      try {
        const snapshot = await getDocs(collection(db, collectionName))
        if (snapshot.empty) {
          // Create a placeholder document to initialize the collection
          await addDoc(collection(db, collectionName), {
            _placeholder: true,
            createdAt: Timestamp.now(),
          })
          console.log(`Initialized empty collection: ${collectionName}`)
        }
      } catch (error) {
        console.error(`Error initializing collection ${collectionName}:`, error)
      }
    }
  }

  async create<T>(collectionName: string, data: Omit<T, "id">): Promise<string> {
    if (typeof window === "undefined") {
      throw new Error("Firebase operations not available on server-side")
    }

    try {
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })
      return docRef.id
    } catch (error) {
      console.error(`Error creating document in ${collectionName}:`, error)
      throw error
    }
  }

  async getById<T>(collectionName: string, id: string): Promise<T | null> {
    if (typeof window === "undefined") {
      return null
    }

    try {
      const docRef = doc(db, collectionName, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists() && !docSnap.data()._placeholder) {
        return { id: docSnap.id, ...docSnap.data() } as T
      }
      return null
    } catch (error) {
      console.error(`Error getting document from ${collectionName}:`, error)
      return null
    }
  }

  async getAll<T>(collectionName: string, orderByField?: string): Promise<T[]> {
    if (typeof window === "undefined") {
      return []
    }

    try {
      const q = orderByField
        ? query(collection(db, collectionName), orderBy(orderByField))
        : collection(db, collectionName)

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs
        .filter((doc) => !doc.data()._placeholder) // Filter out placeholder docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
    } catch (error) {
      console.error(`Error getting all documents from ${collectionName}:`, error)
      return []
    }
  }

  async update<T>(collectionName: string, id: string, data: Partial<T>): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("Firebase operations not available on server-side")
    }

    try {
      const docRef = doc(db, collectionName, id)
      await updateDoc(docRef, {
        ...data,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error(`Error updating document in ${collectionName}:`, error)
      throw error
    }
  }

  async delete(collectionName: string, id: string): Promise<void> {
    if (typeof window === "undefined") {
      throw new Error("Firebase operations not available on server-side")
    }

    try {
      const docRef = doc(db, collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error(`Error deleting document from ${collectionName}:`, error)
      throw error
    }
  }

  async getWhere<T>(
    collectionName: string,
    field: string,
    operator: any,
    value: any,
    orderByField?: string,
    limitCount?: number,
  ): Promise<T[]> {
    if (typeof window === "undefined") {
      return []
    }

    try {
      let q = query(collection(db, collectionName), where(field, operator, value))

      if (orderByField) {
        q = query(q, orderBy(orderByField))
      }

      if (limitCount) {
        q = query(q, limit(limitCount))
      }

      const querySnapshot = await getDocs(q)
      return querySnapshot.docs
        .filter((doc) => !doc.data()._placeholder)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
    } catch (error) {
      console.error(`Error querying ${collectionName}:`, error)
      return []
    }
  }

  // Real-time listeners
  onSnapshot<T>(collectionName: string, callback: (data: T[]) => void, orderByField?: string) {
    if (typeof window === "undefined") {
      return () => {}
    }

    const q = orderByField
      ? query(collection(db, collectionName), orderBy(orderByField))
      : collection(db, collectionName)

    return onSnapshot(q, (snapshot) => {
      const data = snapshot.docs
        .filter((doc) => !doc.data()._placeholder)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as T[]
      callback(data)
    })
  }
}

// Service-specific methods
export class CleanGodService extends FirebaseService {
  constructor() {
    super()
    if (typeof window !== "undefined") {
      this.initializeCollections()
    }
  }

  async getDashboardStats() {
    try {
      const [bookings, users, services] = await Promise.all([
        this.getBookings(),
        this.getAllUsers(),
        this.getServices(),
      ])

      const totalRevenue = bookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0)
      const activeBookings = bookings.filter((b) => b.status === "confirmed" || b.status === "in-progress").length
      const servicesCompleted = bookings.filter((b) => b.status === "completed").length

      return {
        totalRevenue,
        activeBookings,
        totalUsers: users.length,
        servicesCompleted,
        recentBookings: bookings.slice(0, 5),
      }
    } catch (error) {
      console.error("Error getting dashboard stats:", error)
      return {
        totalRevenue: 0,
        activeBookings: 0,
        totalUsers: 0,
        servicesCompleted: 0,
        recentBookings: [],
      }
    }
  }

  // Categories
  async getCategories(): Promise<Category[]> {
    return this.getAll<Category>("categories", "sortOrder")
  }

  async getActiveCategories(): Promise<ServiceCategory[]> {
    return this.getWhere<ServiceCategory>("serviceCategories", "isActive", "==", true, "sortOrder")
  }

  async createCategory(category: Omit<ServiceCategory, "id">): Promise<string> {
    return this.create<ServiceCategory>("serviceCategories", category)
  }

  async updateCategory(id: string, data: Partial<ServiceCategory>): Promise<void> {
    return this.update<ServiceCategory>("serviceCategories", id, data)
  }

  async deleteCategory(id: string): Promise<void> {
    return this.delete("serviceCategories", id)
  }

  // Services
  async getServices(): Promise<Service[]> {
    return this.getAll<Service>("services", "sortOrder")
  }

  async getServicesByCategory(categoryId: string): Promise<Service[]> {
    return this.getWhere<Service>("services", "categoryId", "==", categoryId, "sortOrder")
  }

  async getActiveServices(): Promise<Service[]> {
    return this.getWhere<Service>("services", "isActive", "==", true, "sortOrder")
  }

  async getService(id: string): Promise<Service | null> {
    return this.getById<Service>("services", id)
  }

  async createService(service: Omit<Service, "id">): Promise<string> {
    return this.create<Service>("services", service)
  }

  async updateService(id: string, data: Partial<Service>): Promise<void> {
    return this.update<Service>("services", id, data)
  }

  async deleteService(id: string): Promise<void> {
    return this.delete("services", id)
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return this.getAll<Product>("products", "name")
  }

  async getActiveProducts(): Promise<Product[]> {
    return this.getWhere<Product>("products", "isActive", "==", true, "name")
  }

  async getProductsByCategory(categoryId: string): Promise<Product[]> {
    return this.getWhere<Product>("products", "categoryId", "==", categoryId, "name")
  }

  async createProduct(product: Omit<Product, "id">): Promise<string> {
    return this.create<Product>("products", product)
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<void> {
    return this.update<Product>("products", id, data)
  }

  async deleteProduct(id: string): Promise<void> {
    return this.delete("products", id)
  }

  // Locations
  async getLocations(): Promise<Location[]> {
    return this.getAll<Location>("locations", "name")
  }

  async getServiceableLocations(): Promise<Location[]> {
    return this.getWhere<Location>("locations", "isServiceable", "==", true, "name")
  }

  async createLocation(location: Omit<Location, "id">): Promise<string> {
    return this.create<Location>("locations", location)
  }

  async updateLocation(id: string, data: Partial<Location>): Promise<void> {
    return this.update<Location>("locations", id, data)
  }

  async deleteLocation(id: string): Promise<void> {
    return this.delete("locations", id)
  }

  // Users
  async getUser(id: string): Promise<User | null> {
    return this.getById<User>("users", id)
  }

  async updateUser(id: string, data: Partial<User>): Promise<void> {
    return this.update<User>("users", id, data)
  }

  async getAllUsers(): Promise<User[]> {
    return this.getAll<User>("users", "createdAt")
  }

  async getUserAddresses(userId: string): Promise<Address[]> {
    const user = await this.getUser(userId)
    return user?.addresses || []
  }

  async addAddress(userId: string, address: Omit<Address, "id">): Promise<void> {
    const user = await this.getUser(userId)
    if (user) {
      const newAddress = { ...address, id: `addr_${Date.now()}` }
      const updatedAddresses = [...(user.addresses || []), newAddress]
      await this.updateUser(userId, { addresses: updatedAddresses })
    }
  }

  async updateAddress(userId: string, addressId: string, data: Partial<Address>): Promise<void> {
    const user = await this.getUser(userId)
    if (user && user.addresses) {
      const updatedAddresses = user.addresses.map((addr) => (addr.id === addressId ? { ...addr, ...data } : addr))
      await this.updateUser(userId, { addresses: updatedAddresses })
    }
  }

  async deleteAddress(userId: string, addressId: string): Promise<void> {
    const user = await this.getUser(userId)
    if (user && user.addresses) {
      const updatedAddresses = user.addresses.filter((addr) => addr.id !== addressId)
      await this.updateUser(userId, { addresses: updatedAddresses })
    }
  }

  async getUserPreferences(userId: string): Promise<any> {
    const user = await this.getUser(userId)
    return user?.preferences || {}
  }

  async updateUserPreferences(userId: string, preferences: any): Promise<void> {
    await this.updateUser(userId, { preferences })
  }

  // Bookings
  async getBookings(): Promise<Booking[]> {
    return this.getAll<Booking>("bookings", "createdAt")
  }

  async getBooking(id: string): Promise<Booking | null> {
    return this.getById<Booking>("bookings", id)
  }

  async createBooking(booking: Omit<Booking, "id">): Promise<string> {
    return this.create<Booking>("bookings", booking)
  }

  async updateBooking(id: string, data: Partial<Booking>): Promise<void> {
    return this.update<Booking>("bookings", id, data)
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return this.getWhere<Booking>("bookings", "customerId", "==", userId, "createdAt")
  }

  async getProviderBookings(providerId: string): Promise<Booking[]> {
    return this.getWhere<Booking>("bookings", "providerId", "==", providerId, "scheduledDate")
  }

  // Orders
  async getUserOrders(userId: string): Promise<Order[]> {
    return this.getWhere<Order>("orders", "customerId", "==", userId, "createdAt")
  }

  async getAllOrders(): Promise<Order[]> {
    return this.getAll<Order>("orders", "createdAt")
  }

  async createOrder(order: Omit<Order, "id">): Promise<string> {
    return this.create<Order>("orders", order)
  }

  async updateOrder(id: string, data: Partial<Order>): Promise<void> {
    return this.update<Order>("orders", id, data)
  }

  // Reviews
  async getServiceReviews(serviceId: string): Promise<Review[]> {
    return this.getWhere<Review>("reviews", "serviceId", "==", serviceId, "createdAt")
  }

  async createReview(review: Omit<Review, "id">): Promise<string> {
    return this.create<Review>("reviews", review)
  }

  // Notifications
  async getUserNotifications(userId: string): Promise<Notification[]> {
    return this.getWhere<Notification>("notifications", "userId", "==", userId, "createdAt")
  }

  async createNotification(notification: Omit<Notification, "id">): Promise<string> {
    return this.create<Notification>("notifications", notification)
  }

  // Coupons
  async getActiveCoupons(): Promise<Coupon[]> {
    return this.getWhere<Coupon>("coupons", "isActive", "==", true, "createdAt")
  }

  async getAllCoupons(): Promise<Coupon[]> {
    return this.getAll<Coupon>("coupons", "createdAt")
  }

  async createCoupon(coupon: Omit<Coupon, "id">): Promise<string> {
    return this.create<Coupon>("coupons", coupon)
  }

  async updateCoupon(id: string, data: Partial<Coupon>): Promise<void> {
    return this.update<Coupon>("coupons", id, data)
  }

  async deleteCoupon(id: string): Promise<void> {
    return this.delete("coupons", id)
  }

  // Banners
  async getBanners(): Promise<any[]> {
    return this.getAll<any>("banners", "order")
  }

  async getActiveBanners(): Promise<any[]> {
    return this.getWhere<any>("banners", "isActive", "==", true, "order")
  }

  async createBanner(banner: any): Promise<string> {
    return this.create<any>("banners", banner)
  }

  async updateBanner(id: string, data: any): Promise<void> {
    return this.update<any>("banners", id, data)
  }

  async deleteBanner(id: string): Promise<void> {
    return this.delete("banners", id)
  }

  // Service Boys
  async getServiceBoys(): Promise<any[]> {
    return this.getAll<any>("serviceboys", "name")
  }

  async getActiveServiceBoys(): Promise<any[]> {
    return this.getWhere<any>("serviceboys", "isActive", "==", true, "name")
  }

  async createServiceBoy(serviceBoy: any): Promise<string> {
    return this.create<any>("serviceboys", serviceBoy)
  }

  async updateServiceBoy(id: string, data: any): Promise<void> {
    return this.update<any>("serviceboys", id, data)
  }

  async deleteServiceBoy(id: string): Promise<void> {
    return this.delete("serviceboys", id)
  }

  async assignTaskToServiceBoy(serviceBoyId: string, taskData: any): Promise<void> {
    const serviceBoy = await this.getById<any>("serviceboys", serviceBoyId)
    if (serviceBoy) {
      const tasks = serviceBoy.tasks || []
      const newTask = { ...taskData, id: `task_${Date.now()}`, assignedAt: new Date().toISOString() }
      await this.updateServiceBoy(serviceBoyId, { tasks: [...tasks, newTask] })
    }
  }
}

export const firebaseService = new CleanGodService()
export const cleanGodService = new CleanGodService()
