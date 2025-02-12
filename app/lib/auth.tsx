"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { jwtDecode } from "jwt-decode"

interface DecodedTokenRaw {
  userId: string;
  email: string;
  "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"?: string;
  exp: number;
}
interface DecodedTokenRaw {
  userId: string
  email: string
  role: string
  exp: number
}

interface AuthContextType {
  isAuthenticated: boolean
  userRole: string | null
  token: DecodedTokenRaw | null
  login: (token: string) => void
  logout: () => void
  checkAuthStatus: () => Promise<void>
  getToken: () => string | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const [token, setToken] = useState<DecodedTokenRaw | null>(null)
  const router = useRouter()

  const checkAuthStatus = async () => {
    const storedToken = localStorage.getItem("token")

    if (!storedToken) {
      setIsAuthenticated(false)
      setUserRole(null)
      setToken(null)
      return
    }

    try {
      const decodedToken: DecodedTokenRaw = jwtDecode(storedToken)

      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem("token")
        setIsAuthenticated(false)
        setUserRole(null)
        setToken(null)
        return
      }

      setIsAuthenticated(true)
      setUserRole(decodedToken.role)
      setToken((prevToken) => {
        if (JSON.stringify(prevToken) !== JSON.stringify(decodedToken)) {
          return decodedToken
        }
        return prevToken
      })
    } catch (error) {
      console.error("Error decoding token:", error)
      setIsAuthenticated(false)
      setUserRole(null)
      setToken(null)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const login = (token: string) => {
    localStorage.setItem("token", token)
    checkAuthStatus()
  }

  const logout = () => {
    localStorage.removeItem("token")
    setIsAuthenticated(false)
    setUserRole(null)
    setToken(null)
    router.push("/login")
  }

  const getToken = () => {
    
    return localStorage.getItem("token")
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, token, login, logout, checkAuthStatus, getToken }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

