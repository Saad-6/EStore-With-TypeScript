"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "../lib/theme-context"
import { SearchModal } from "./search-modal"
import { Shirt, Tag, Zap } from "lucide-react"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [announcement, setAnnouncement] = useState("🎉 Summer Sale! Use code SUMMER20 for 20% off!")
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()
  const router = useRouter()

  useEffect(() => {
    const announcements = [
      "🎉 Summer Sale! Use code SUMMER20 for 20% off!",
      "🚚 Free shipping on orders over $50!",
      "🆕 New arrivals every week!",
    ]
    let i = 0
    const intervalId = setInterval(() => {
      setAnnouncement(announcements[i % announcements.length])
      i++
    }, 13000)
    return () => clearInterval(intervalId)
  }, [])

  const handleSearch = (searchTerm: string) => {
    router.push(`/search-results?q=${encodeURIComponent(searchTerm)}`)
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      {/* Announcement Bar */}
      <div className="bg-slate-900 dark:bg-slate-700 px-4 py-2 text-white overflow-hidden">
        <p className="text-center text-sm font-medium whitespace-nowrap animate-marquee">{announcement}</p>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link href="/" className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                EStore
              </Link>
            </div>
          </div>

          {/* Center Links - Hidden on mobile */}
          <div className="hidden sm:flex sm:space-x-8 items-center">
            <Link
              href="/products"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium flex items-center"
            >
              <Shirt className="w-5 h-5 mr-2" />
              Products
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium flex items-center"
            >
              <Tag className="w-5 h-5 mr-2" />
              Categories
            </Link>
            <Link
              href="/deals"
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium flex items-center"
            >
              <Zap className="w-5 h-5 mr-2" />
              Deals
            </Link>
          </div>

          {/* Right Icons */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsSearchOpen(true)}
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <Link href="/cart">
              <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <ShoppingCartIcon className="h-6 w-6" />
              </button>
            </Link>
            <Link href="/profile">
              <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <UserIcon className="h-6 w-6" />
              </button>
            </Link>
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
            >
              {theme === "dark" ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="block h-6 w-6"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`sm:hidden ${isMenuOpen ? "block" : "hidden"}`}>
        <div className="px-2 pt-2 pb-3 space-y-1">
          <Link
            href="/products"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium flex items-center"
          >
            <Shirt className="w-5 h-5 mr-2" />
            Products
          </Link>
          <Link
            href="/categories"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium flex items-center"
          >
            <Tag className="w-5 h-5 mr-2" />
            Categories
          </Link>
          <Link
            href="/deals"
            className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium flex items-center"
          >
            <Zap className="w-5 h-5 mr-2" />
            Deals
          </Link>
        </div>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={handleSearch} />
    </nav>
  )
}

