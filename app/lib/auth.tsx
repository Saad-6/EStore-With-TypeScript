'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode'

interface DecodedToken {
  userId: string
  email: string
  role: string
  exp: number
}

interface AuthContextType {
  isAuthenticated: boolean
  userRole: string | null
  login: (token: string) => void
  logout: () => void
  checkAuthStatus: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userRole, setUserRole] = useState<string | null>(null)
  const router = useRouter()

  const checkAuthStatus = async () => {
    const token = localStorage.getItem('token')

    if (!token) {
      setIsAuthenticated(false)
      setUserRole(null)
      return
    }

    try {
      const decodedToken: DecodedToken = jwtDecode(token)

      if (decodedToken.exp * 1000 < Date.now()) {
        localStorage.removeItem('token')
        setIsAuthenticated(false)
        setUserRole(null)
        return
      }

      setIsAuthenticated(true)
      setUserRole(decodedToken.role)
    } catch (error) {
      console.error('Error decoding token:', error)
      setIsAuthenticated(false)
      setUserRole(null)
    }
  }

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const login = (token: string) => {
    localStorage.setItem('token', token)
    checkAuthStatus()
  }

  const logout = () => {
    localStorage.removeItem('token')
    setIsAuthenticated(false)
    setUserRole(null)
    router.push('/login')
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, userRole, login, logout, checkAuthStatus }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}