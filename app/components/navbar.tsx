"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { MagnifyingGlassIcon, ShoppingCartIcon, UserIcon, MoonIcon, SunIcon } from "@heroicons/react/24/outline"
import { useTheme } from "../lib/theme-context"
import { SearchModal } from "./search-modal"
import { ChevronDown, Headphones, Shirt, Tag, Zap, Info, BookOpen, HelpCircle, Mail } from "lucide-react"
import TopStrip from "./ui/top-strip"

// Declare the API_BASE_URL variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

interface LinkDTO {
  id: number
  name: string
  url: string
  linkType: string
  displayOrder: number
  isActive: boolean
}

interface NavigationDTO {
  links: LinkDTO[]
  categoriesAsLinks: boolean
}

interface Category {
  id: number
  name: string
  slug: string
}

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [navigation, setNavigation] = useState<NavigationDTO | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false)

  const { theme, toggleTheme } = useTheme()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    fetchNavigation()
  }, [])

  useEffect(() => {
    if (navigation?.categoriesAsLinks) {
      fetchCategories()
    }
  }, [navigation?.categoriesAsLinks])

  // Replace the fetchNavigation function with this updated version
  const fetchNavigation = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/Navigation/active`)

      if (response.ok) {
        const data = await response.json()
        console.info("Data From The API: ", data)

        // Check if data is an array (direct links array) or an object with links property
        if (Array.isArray(data)) {
          // Create a NavigationDTO object with the links array
          setNavigation({
            links: data,
            categoriesAsLinks: false, // Default value
          })

          // Make an additional call to get navigation settings
          try {
            const settingsResponse = await fetch(`${API_BASE_URL}/Navigation`)
            if (settingsResponse.ok) {
              const settingsData = await settingsResponse.json()
              // Update navigation with the correct categoriesAsLinks value
              setNavigation((prev) => ({
                ...prev!,
                categoriesAsLinks: settingsData.isAllCategories || false,
              }))
            }
          } catch (error) {
            console.error("Error fetching navigation settings:", error)
          }
        } else {
          // Data is already in the expected format
          setNavigation(data)
        }
      }
    } catch (error) {
      console.error("Error fetching navigation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories")

      if (response.ok) {
        const data: Category[] = await response.json()
        setCategories(data)
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
    }
  }

  const handleSearch = (searchTerm: string) => {
    router.push(`/search-results?q=${encodeURIComponent(searchTerm)}`)
  }

  // Replace the getUniversalLinks function with this to show dynamic category links
  const getUniversalLinks = () => {
    return (
      navigation?.links
        ?.filter((link) => link.linkType === "universal")
        ?.sort((a, b) => a.displayOrder - b.displayOrder) || []
    )
  }

  // Add this new function to get category links when categories as links is enabled
  const getCategoryLinks = () => {
    return (
      navigation?.links
        ?.filter((link) => link.id === 0 && link.linkType === "navigation")
        ?.sort((a, b) => a.displayOrder - b.displayOrder) || []
    )
  }

  // Add this function to get customer service links
  const getCustomerServiceLinks = () => {
    return (
      navigation?.links
        ?.filter((link) => link.linkType === "customer_service")
        ?.sort((a, b) => a.displayOrder - b.displayOrder) || []
    )
  }

  // Get icon for link based on name
  const getLinkIcon = (name: string) => {
    switch (name.toLowerCase()) {
      case "products":
        return <Shirt className="w-5 h-5 mr-2" />
      case "categories":
        return <Tag className="w-5 h-5 mr-2" />
      case "deals":
        return <Zap className="w-5 h-5 mr-2" />
      case "about":
        return <Info className="w-5 h-5 mr-2" />
      case "blog":
        return <BookOpen className="w-5 h-5 mr-2" />
      case "faq":
      case "frequently asked questions":
        return <HelpCircle className="w-5 h-5 mr-2" />
      case "contact":
      case "contact us":
        return <Mail className="w-5 h-5 mr-2" />
      default:
        return null
    }
  }

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md">
      {/* Announcement Bar */}
      <TopStrip />

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
            {/* Dynamic Universal Links */}
            {getUniversalLinks().map((link) => (
              <Link
                key={link.id}
                href={link.url}
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium flex items-center ${
                  pathname === link.url ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                {getLinkIcon(link.name)}
                {link.name}
              </Link>
            ))}

            {/* Dynamic Category Links - These are the links with id=0 and linkType="navigation" */}
            {getCategoryLinks().map((link) => (
              <Link
                key={`category-${link.name}`}
                href={link.url}
                className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium flex items-center ${
                  pathname === link.url ? "text-blue-600 dark:text-blue-400" : ""
                }`}
              >
                <Tag className="w-5 h-5 mr-2" />
                {link.name}
              </Link>
            ))}

            {/* Categories Dropdown - Only shown if enabled and no dynamic category links */}
            {navigation?.categoriesAsLinks && categories.length > 0 && getCategoryLinks().length === 0 && (
              <div className="relative group">
                <button
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium flex items-center"
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                  onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                >
                  <Tag className="w-5 h-5 mr-2" />
                  Categories
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div
                  className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 z-10 ${
                    isCategoriesDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                  onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                  onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                >
                  <div className="py-1">
                    {categories.map((category) => (
                      <Link
                        key={category.id}
                        href={`/categories/${category.slug}`}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                      >
                        {category.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Customer Service Links */}
            {getCustomerServiceLinks().length > 0 && (
              <div className="relative group">
                <button
                  className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 text-sm font-medium flex items-center"
                  onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                  onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                  onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                >
                  <Headphones className="w-5 h-5 mr-2" />
                  Help
                  <ChevronDown className="ml-1 h-4 w-4" />
                </button>
                <div
                  className={`absolute left-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 transition-all duration-200 z-10 ${
                    isCategoriesDropdownOpen ? "opacity-100 visible" : "opacity-0 invisible"
                  }`}
                  onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                  onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                >
                  <div className="py-1">
                    {getCustomerServiceLinks().map((link) => (
                      <Link
                        key={link.id}
                        href={link.url}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        onClick={() => setIsCategoriesDropdownOpen(false)}
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Icons - These are the required links that stay in place */}
          <div className="flex items-center space-x-4">
            <button
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search"
            >
              <MagnifyingGlassIcon className="h-6 w-6" />
            </button>
            <Link href="/cart" aria-label="Shopping Cart">
              <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <ShoppingCartIcon className="h-6 w-6" />
              </button>
            </Link>
            <Link href="/profile" aria-label="User Profile">
              <button className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                <UserIcon className="h-6 w-6" />
              </button>
            </Link>
            <button
              onClick={toggleTheme}
              className="text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <SunIcon className="h-6 w-6" /> : <MoonIcon className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-600"
              aria-expanded={isMenuOpen}
              aria-label="Main menu"
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
          {/* Dynamic Universal Links for Mobile */}
          {getUniversalLinks().map((link) => (
            <Link
              key={link.id}
              href={link.url}
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium flex items-center ${
                pathname === link.url ? "text-blue-600 dark:text-blue-400" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {getLinkIcon(link.name)}
              {link.name}
            </Link>
          ))}

          {/* Dynamic Category Links for Mobile */}
          {getCategoryLinks().map((link) => (
            <Link
              key={`category-${link.name}`}
              href={link.url}
              className={`text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 block px-3 py-2 text-base font-medium flex items-center ${
                pathname === link.url ? "text-blue-600 dark:text-blue-400" : ""
              }`}
              onClick={() => setIsMenuOpen(false)}
            >
              <Tag className="w-5 h-5 mr-2" />
              {link.name}
            </Link>
          ))}

          {/* Categories in mobile menu - Only shown if enabled and no dynamic category links */}
          {navigation?.categoriesAsLinks && categories.length > 0 && getCategoryLinks().length === 0 && (
            <div className="px-3 py-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Categories</h3>
              <div className="mt-2 space-y-1">
                {categories.map((category) => (
                  <Link
                    key={category.id}
                    href={`/categories/${category.slug}`}
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {category.name}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Customer Service Links in mobile menu */}
          {getCustomerServiceLinks().length > 0 && (
            <div className="px-3 py-2">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Help</h3>
              <div className="mt-2 space-y-1">
                {getCustomerServiceLinks().map((link) => (
                  <Link
                    key={link.id}
                    href={link.url}
                    className="block pl-3 pr-4 py-2 text-base font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} onSearch={handleSearch} />
    </nav>
  )
}

