"use client"

import type React from "react"
import { createContext, useContext, useReducer, useEffect, useState } from "react"
import type { CartItem } from "@/lib/types"

interface CartState {
  items: CartItem[]
  total: number
}

type CartAction =
  | { type: "ADD_ITEM"; payload: CartItem }
  | { type: "REMOVE_ITEM"; payload: { id: string; type: string } }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; type: string; quantity: number } }
  | { type: "CLEAR_CART" }
  | { type: "LOAD_CART"; payload: CartItem[] }

interface CartContextType extends CartState {
  addItem: (item: CartItem) => void
  removeFromCart: (id: string, type: string) => void
  updateQuantity: (id: string, type: string, quantity: number) => void
  clearCart: () => void
  getItemCount: () => number
  getTotalAmount: () => number
  isLoaded: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

function cartReducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "ADD_ITEM": {
      const existingItemIndex = state.items.findIndex(
        (item) => item.id === action.payload.id && item.type === action.payload.type,
      )

      if (existingItemIndex > -1) {
        const updatedItems = [...state.items]
        updatedItems[existingItemIndex].quantity += action.payload.quantity
        return { ...state, items: updatedItems }
      }

      return { ...state, items: [...state.items, action.payload] }
    }

    case "REMOVE_ITEM": {
      const filteredItems = state.items.filter(
        (item) => !(item.id === action.payload.id && item.type === action.payload.type),
      )
      return { ...state, items: filteredItems }
    }

    case "UPDATE_QUANTITY": {
      const updatedItems = state.items
        .map((item) =>
          item.id === action.payload.id && item.type === action.payload.type
            ? { ...item, quantity: action.payload.quantity }
            : item,
        )
        .filter((item) => item.quantity > 0)

      return { ...state, items: updatedItems }
    }

    case "CLEAR_CART":
      return { items: [], total: 0 }

    case "LOAD_CART":
      return { ...state, items: action.payload }

    default:
      return state
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(cartReducer, { items: [], total: 0 })
  const [isLoaded, setIsLoaded] = useState(false)

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("cleangod-cart")
      if (savedCart) {
        try {
          const cartItems = JSON.parse(savedCart)
          dispatch({ type: "LOAD_CART", payload: cartItems })
        } catch (error) {
          console.error("Error loading cart from localStorage:", error)
        }
      }
      setIsLoaded(true)
    }
  }, [])

  // Save cart to localStorage whenever it changes (client-side only)
  useEffect(() => {
    if (typeof window !== "undefined" && isLoaded) {
      localStorage.setItem("cleangod-cart", JSON.stringify(state.items))
    }
  }, [state.items, isLoaded])

  const addItem = (item: CartItem) => {
    dispatch({ type: "ADD_ITEM", payload: item })
  }

  const removeFromCart = (id: string, type: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: { id, type } })
  }

  const updateQuantity = (id: string, type: string, quantity: number) => {
    dispatch({ type: "UPDATE_QUANTITY", payload: { id, type, quantity } })
  }

  const clearCart = () => {
    dispatch({ type: "CLEAR_CART" })
  }

  const getItemCount = () => {
    return state.items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalAmount = () => {
    return state.items.reduce((total, item) => total + item.price * item.quantity, 0)
  }

  const value = {
    ...state,
    addItem,
    removeFromCart,
    updateQuantity,
    clearCart,
    getItemCount,
    getTotalAmount,
    isLoaded,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
