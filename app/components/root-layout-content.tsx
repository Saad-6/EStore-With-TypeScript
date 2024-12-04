'use client'

import React from 'react'
import { Toaster } from 'react-hot-toast'
import Footer from './footer'
import Navbar from './navbar'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme-context'

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userRole } = useAuth()
  const { theme } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Toaster />
      
      {/* Only show Navbar if the user is not an admin */}
      {!isAuthenticated || userRole !== 'Admin' ? <Navbar /> : null}
      
      <main className="flex-grow dark:bg-gray-900 dark:text-white ">
        {children}
      </main>

      {!isAuthenticated || userRole !== 'Admin' ? <Footer /> : null}
    </div>
  )
}
