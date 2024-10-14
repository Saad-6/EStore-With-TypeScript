'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { UserCircleIcon, CogIcon, ShoppingBagIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/ui/button'
import PastOrders from './past-orders'

// Mock user data
const user = {
  name: 'John Doe',
  email: 'john.doe@example.com',
  avatar: 'https://i.pravatar.cc/150?img=68'
}

// Mock function to simulate logout
const handleLogout = () => {
  console.log('User logged out')
  // Implement actual logout logic here
}

export default function ProfilePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(true) // This would normally be determined by your auth state

  if (!isLoggedIn) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-4xl font-bold mb-8">Profile</h1>
        <p className="text-xl mb-8">Please log in to view your profile.</p>
        <Link href="/login">
          <Button size="lg">Log In</Button>
        </Link>
      </div>
    )
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
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <div className="flex flex-col items-center">
              <img src={user.avatar} alt={user.name} className="w-32 h-32 rounded-full mb-4" />
              <h2 className="text-2xl font-semibold mb-2">{user.name}</h2>
              <p className="text-gray-600 mb-4">{user.email}</p>
              <Button onClick={handleLogout} variant="outline" className="w-full">
                Log Out
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-lg shadow-lg p-6 mt-8"
          >
            <h3 className="text-xl font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">         
              <li>
                <Link href="/orders" className="flex items-center text-blue-600 hover:underline">
                  <ShoppingBagIcon className="w-5 h-5 mr-2" />
                  Order History
                </Link>
              </li>
              <li>
                <Link href="/profile/payment" className="flex items-center text-blue-600 hover:underline">
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
            className="bg-white rounded-lg shadow-lg p-6"
          >
            <h3 className="text-2xl font-semibold mb-6">Past Orders</h3>
            <PastOrders />
          </motion.div>
        </div>
      </div>
    </div>
  )
}