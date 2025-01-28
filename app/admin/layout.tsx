'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

import { AdminMenu } from '../components/admin-menu'
import { useAuth } from '../lib/auth'
import { BouncingDotsLoader } from '../components/ui/Loaders'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, userRole, checkAuthStatus } = useAuth()
  const [isLoading, setIsLoading] = useState(true);

  
  useEffect(() => {
    const initAuth = async () => {
      try {
        await checkAuthStatus() // Ensure auth state is up-to-date
      } catch (error) {
        console.error('Error checking auth status:', error)
      }
      setIsLoading(false) 
    }

    initAuth()
  }, [checkAuthStatus])

  // Protect the admin route based on the user authentication state
  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && userRole === 'Admin') {
        router.push('/admin')
      } else{
        router.push('/not-found');
      }

    }
  }, [isAuthenticated, userRole, isLoading, router])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
      <BouncingDotsLoader color="primary" />
    </div>
    )
  }
  // Unauthorized state
  if (!isAuthenticated || userRole !== 'Admin') {
    return null
  }

  // If the user is authenticated and is an admin, render the admin layout
  return (
    <div className="min-h-screen bg-white flex">
      <AdminMenu />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50">
          <div className="container mx-auto py-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
