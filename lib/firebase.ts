// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app"
import { getAuth, GoogleAuthProvider, type Auth } from "firebase/auth"
import { getFirestore, type Firestore } from "firebase/firestore"
import { getStorage, type FirebaseStorage } from "firebase/storage"

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDtguy6mvq1bae6Q-tWwQtOGY2b0DX_p-s",
  authDomain: "vinroot-cleangod.firebaseapp.com",
  projectId: "vinroot-cleangod",
  storageBucket: "vinroot-cleangod.firebasestorage.app",
  messagingSenderId: "254098038770",
  appId: "1:254098038770:web:27f72c1889b276eba0556b",
  measurementId: "G-6P9VPDVKVF",
}

// Initialize Firebase app
let app: FirebaseApp

try {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp()
} catch (error) {
  console.error("Firebase initialization error:", error)
  app = initializeApp(firebaseConfig)
}

// Initialize services with lazy loading
let _auth: Auth | null = null
let _db: Firestore | null = null
let _storage: FirebaseStorage | null = null
let _googleProvider: GoogleAuthProvider | null = null
let _analytics: any = null

// Getter functions for lazy initialization
export const getAuthInstance = (): Auth => {
  if (!_auth) {
    _auth = getAuth(app)
  }
  return _auth
}

export const getDbInstance = (): Firestore => {
  if (!_db) {
    _db = getFirestore(app)
  }
  return _db
}

export const getStorageInstance = (): FirebaseStorage => {
  if (!_storage) {
    _storage = getStorage(app)
  }
  return _storage
}

export const getGoogleProvider = (): GoogleAuthProvider => {
  if (!_googleProvider) {
    _googleProvider = new GoogleAuthProvider()
    _googleProvider.setCustomParameters({
      prompt: "select_account",
    })
  }
  return _googleProvider
}

export const getAnalyticsInstance = () => {
  if (typeof window !== "undefined" && !_analytics) {
    try {
      import("firebase/analytics").then(({ getAnalytics }) => {
        _analytics = getAnalytics(app)
      })
    } catch (error) {
      console.warn("Analytics initialization failed:", error)
    }
  }
  return _analytics
}

// Export instances (will be initialized on first access)
export const auth = getAuthInstance()
export const db = getDbInstance()
export const storage = getStorageInstance()
export const googleProvider = getGoogleProvider()
export const analytics = getAnalyticsInstance()

export default app
