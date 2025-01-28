'use client'

import React, { useEffect, useState } from 'react'
import { Toaster } from 'react-hot-toast'
import Footer from './footer'
import Navbar from './navbar'
import { useAuth } from '../lib/auth'
import { useTheme } from '../lib/theme-context'

export default function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, userRole,checkAuthStatus } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const[showNav,setShowNav] = useState(false);
  useEffect(()=>{

    const initAuth = async () => {
      try {
        await checkAuthStatus() // Ensure auth state is up-to-date
      } catch (error) {
        console.error('Error checking auth status:', error)
      }
      setIsLoading(false) 
    }
    initAuth();
  },[checkAuthStatus])

  useEffect(()=>{
if(isAuthenticated && userRole ==='Admin'){
  setShowNav(false);
}else{
  setShowNav(true);
}

  }, [isAuthenticated, userRole, isLoading])

  const { theme } = useTheme()

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'dark' : ''}`}>
      <Toaster />
      
      {/* Only show Navbar if the user is not an admin */}
      {showNav ? <Navbar /> : null}
      
      <main className="flex-grow dark:bg-gray-900 dark:text-white ">
        {children}
      </main>

      {showNav ? <Footer /> : null}
    </div>
  )
}
