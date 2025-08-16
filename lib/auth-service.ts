import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from "firebase/auth"
import { doc, setDoc, getDoc } from "firebase/firestore"
import { auth, db, googleProvider } from "./firebase"
import type { User } from "./types"

export class AuthService {
  // Sign up with email and password
  async signUp(email: string, password: string, name: string, phone: string): Promise<User> {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Update Firebase Auth profile
      await updateProfile(firebaseUser, { displayName: name })

      // Create user document in Firestore with merge to avoid permission issues
      const userData: Omit<User, "id"> = {
        email,
        phone,
        name,
        addresses: [],
        role: "customer",
        isVerified: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      await setDoc(doc(db, "users", firebaseUser.uid), userData, { merge: true })

      return { id: firebaseUser.uid, ...userData }
    } catch (error: any) {
      console.error("Sign up error:", error)
      throw new Error(error.message || "Failed to create account")
    }
  }

  // Sign in with email and password
  async signIn(email: string, password: string): Promise<User> {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const firebaseUser = userCredential.user

      // Get user data from Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) {
        throw new Error("User data not found")
      }

      return { id: firebaseUser.uid, ...userDoc.data() } as User
    } catch (error: any) {
      console.error("Sign in error:", error)
      throw new Error(error.message || "Failed to sign in")
    }
  }

  // Sign in with Google
  async signInWithGoogle(): Promise<User> {
    try {
      const result = await signInWithPopup(auth, googleProvider)
      const firebaseUser = result.user

      // Check if user exists in Firestore
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))

      if (userDoc.exists()) {
        return { id: firebaseUser.uid, ...userDoc.data() } as User
      } else {
        // Create new user document
        const userData: Omit<User, "id"> = {
          email: firebaseUser.email || "",
          phone: firebaseUser.phoneNumber || "",
          name: firebaseUser.displayName || "User",
          addresses: [],
          role: "customer",
          isVerified: firebaseUser.emailVerified,
          createdAt: new Date(),
          updatedAt: new Date(),
        }

        await setDoc(doc(db, "users", firebaseUser.uid), userData, { merge: true })
        return { id: firebaseUser.uid, ...userData }
      }
    } catch (error: any) {
      console.error("Google sign in error:", error)
      throw new Error(error.message || "Failed to sign in with Google")
    }
  }

  // Sign out
  async signOut(): Promise<void> {
    await signOut(auth)
  }

  // Get current user data
  async getCurrentUser(): Promise<User | null> {
    const firebaseUser = auth.currentUser
    if (!firebaseUser) return null

    try {
      const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
      if (!userDoc.exists()) return null

      return { id: firebaseUser.uid, ...userDoc.data() } as User
    } catch (error) {
      console.error("Get current user error:", error)
      return null
    }
  }

  // Listen to auth state changes
  onAuthStateChange(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
          if (userDoc.exists()) {
            callback({ id: firebaseUser.uid, ...userDoc.data() } as User)
          } else {
            callback(null)
          }
        } catch (error) {
          console.error("Auth state change error:", error)
          callback(null)
        }
      } else {
        callback(null)
      }
    })
  }

  // Admin sign in with specific credentials
  async adminSignIn(email: string, password: string): Promise<User> {
    // Check for specific admin credentials
    if (email === "Vinroot@admin1" && password === "vinrootdevmith") {
      // Create or get admin user
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        const firebaseUser = userCredential.user

        // Get user data from Firestore
        const userDoc = await getDoc(doc(db, "users", firebaseUser.uid))
        if (userDoc.exists()) {
          const userData = { id: firebaseUser.uid, ...userDoc.data() } as User
          if (userData.role === "admin") {
            return userData
          }
        }
      } catch (error) {
        // If user doesn't exist, create admin user
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, email, password)
          const firebaseUser = userCredential.user

          await updateProfile(firebaseUser, { displayName: "CleanGod Admin" })

          const adminData: Omit<User, "id"> = {
            email,
            phone: "+91-9999999999",
            name: "CleanGod Admin",
            addresses: [],
            role: "admin",
            isVerified: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          }

          await setDoc(doc(db, "users", firebaseUser.uid), adminData, { merge: true })
          return { id: firebaseUser.uid, ...adminData }
        } catch (createError: any) {
          console.error("Failed to create admin user:", createError)
          throw new Error("Failed to create admin user: " + createError.message)
        }
      }
    }

    // For regular admin login
    const user = await this.signIn(email, password)
    if (user.role !== "admin") {
      await this.signOut()
      throw new Error("Unauthorized access - Admin privileges required")
    }
    return user
  }
}

export const authService = new AuthService()
