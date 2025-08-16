"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { authService } from "@/lib/auth-service"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<User>
  signUp: (email: string, password: string, name: string, phone: string) => Promise<User>
  signInWithGoogle: () => Promise<User>
  signOut: () => Promise<void>
  adminSignIn: (email: string, password: string) => Promise<User>
  isLoaded: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Only initialize auth on client side
    if (typeof window !== "undefined") {
      const unsubscribe = authService.onAuthStateChange((user) => {
        setUser(user)
        setLoading(false)
        setIsLoaded(true)
      })

      return unsubscribe
    } else {
      // On server side, just set loading to false
      setLoading(false)
      setIsLoaded(true)
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    const user = await authService.signIn(email, password)
    setUser(user)
    return user
  }

  const signUp = async (email: string, password: string, name: string, phone: string) => {
    const user = await authService.signUp(email, password, name, phone)
    setUser(user)
    return user
  }

  const signInWithGoogle = async () => {
    const user = await authService.signInWithGoogle()
    setUser(user)
    return user
  }

  const signOut = async () => {
    await authService.signOut()
    setUser(null)
  }

  const adminSignIn = async (email: string, password: string) => {
    const user = await authService.adminSignIn(email, password)
    setUser(user)
    return user
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    adminSignIn,
    isLoaded,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
