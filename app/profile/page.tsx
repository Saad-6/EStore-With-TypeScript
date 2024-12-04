'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingBagIcon, CreditCardIcon } from 'lucide-react'

import PastOrders from './past-orders'

import { jwtDecode } from 'jwt-decode'
import { useAuth } from '../lib/auth'
import { Button } from '../components/ui/button'

interface Token {
  userId: string
  email: string
  userName: string
  role: string
  exp: number
}

export default function ProfilePage() {
  const router = useRouter()
  const { isAuthenticated, logout } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
    }
  }, [isAuthenticated, router])

  const handleLogout = () => {
    logout()
    router.push('/login')
  }

  if (!isAuthenticated) {
    return null // or a loading spinner
  }

  const token = localStorage.getItem('token')
  let decodedToken: Token | null = null
  if (token) {
    decodedToken = jwtDecode(token)
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold mb-12 text-center">Your Profile</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-card rounded-lg shadow-lg p-6"
          >
            <div className="flex flex-col items-center">
              <img 
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${decodedToken?.userName}`} 
                alt={decodedToken?.userName} 
                className="w-32 h-32 rounded-full mb-4" 
              />
              <h2 className="text-2xl font-semibold mb-2">{decodedToken?.userName}</h2>
              <p className="text-muted-foreground mb-4">{decodedToken?.email}</p>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Log Out
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-card rounded-lg shadow-lg p-6 mt-8"
          >
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">         
              <li>
                <Link href="/orders" className="flex items-center text-primary hover:underline">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/profile/payment" className="flex items-center text-primary hover:underline">
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Payment Methods
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>
        <div className="md:col-span-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="bg-card rounded-lg shadow-lg p-6"
          >
            <h3 className="text-2xl font-semibold mb-6">Past Orders</h3>
            <PastOrders />
          </motion.div>
        </div>
      </div>
    </div>
  )
}