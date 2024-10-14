'use client'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon } from '@heroicons/react/24/outline'
import { SearchModal } from './search-modal'

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [announcement, setAnnouncement] = useState('🎉 Summer Sale! Use code SUMMER20 for 20% off!')
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  useEffect(() => {
    const announcements = [
      '🎉 Summer Sale! Use code SUMMER20 for 20% off!',
      '🚚 Free shipping on orders over $50!',
      '🆕 New arrivals every week!',
    ]
    let i = 0
    const intervalId = setInterval(() => {
      setAnnouncement(announcements[i % announcements.length])
      i++
    }, 13000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <nav className="bg-white shadow-md">
      {/* Announcement Bar */}
      <div className="bg-slate-900 px-4 py-2 text-white overflow-hidden">
        <p className="text-center text-sm font-medium whitespace-nowrap animate-marquee">
          {announcement}
        </p>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600">
                EStore
              </Link>
            </div>
          </div>

          {/* Center Links - Hidden on mobile */}
          <div className="hidden sm:flex sm:space-x-8 items-center">
            <Link href="/products" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Products
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Categories
            </Link>
            <Link href="/deals" className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium">
              Deals
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-700 hover:text-blue-600" onClick={() => setIsSearchOpen(true)}>
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <Link href="/cart">
            <button className="text-gray-700 hover:text-blue-600">
              <ShoppingCartIcon className="h-6 w-6" />
            </button>
            </Link>
            <Link href="/profile">
            <button className="text-gray-700 hover:text-blue-600">
              <UserIcon className="h-6 w-6" />
            </button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`sm:hidden ${isMenuOpen ? 'block' : 'hidden'}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link href="/products" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
            Products
          </Link>
          <Link href="/categories" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
            Categories
          </Link>
          <Link href="/deals" className="text-gray-700 hover:text-blue-600 block px-3 py-2 text-base font-medium">
            Deals
          </Link>
        </div>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </nav>
  )
}