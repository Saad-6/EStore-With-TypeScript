'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/hooks/admin-auth'
import { AdminMenu } from '../components/admin-menu'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthorized, isLoading } = useAdminAuth()
  const router = useRouter()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-gray-900">Loading...</div>
      </div>
    )
  }

  if (!isAuthorized) {
    router.push('/') // Redirect to home page if not authorized
    return null
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <AdminMenu />
      <div className="flex-1 flex flex-col overflow-hidden lg:ml-64">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}