"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { User } from "@/lib/types"

interface AuthContextType {
  currentUser: User | null
  token: string | null
  login: (user: User, token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  // Solo para migración inicial - recuperar datos de sessionStorage UNA VEZ
  useEffect(() => {
    const storedUser = sessionStorage.getItem("currentUser")
    const storedToken = sessionStorage.getItem("jwtToken")
    
    if (storedUser && storedToken) {
      try {
        setCurrentUser(JSON.parse(storedUser))
        setToken(storedToken)
        // Limpiar sessionStorage después de migrar
        sessionStorage.removeItem("currentUser")
        sessionStorage.removeItem("jwtToken")
      } catch (error) {
        console.error("Error parsing stored user:", error)
      }
    }
    
    setIsLoading(false)
  }, [])

  // Proteger rutas automáticamente
  useEffect(() => {
    if (!isLoading && !currentUser && pathname?.startsWith("/dashboard")) {
      router.push("/")
    }
  }, [currentUser, isLoading, pathname, router])

  const login = (user: User, authToken: string) => {
    setCurrentUser(user)
    setToken(authToken)
    router.push("/dashboard")
  }

  const logout = () => {
    setCurrentUser(null)
    setToken(null)
    router.push("/")
  }

  return (
    <AuthContext.Provider value={{ currentUser, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth debe ser usado dentro de un AuthProvider")
  }
  return context
}