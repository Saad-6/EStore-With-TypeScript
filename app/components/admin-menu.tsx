'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChartBarIcon, 
  CubeIcon, 
  UserGroupIcon, 
  CogIcon, 
  ShoppingBagIcon,
  ChartBarSquareIcon,
} from '@heroicons/react/24/outline'
import { BookAIcon, FolderIcon, Footprints, Home, MenuIcon, NotebookPenIcon, NotebookTextIcon, NotepadTextDashed, QuoteIcon, Settings, XIcon } from 'lucide-react'
import { DesktopIcon } from '@radix-ui/react-icons'

const menuItems = [
  { name: 'Dashboard', icon: ChartBarIcon, href: '/admin' },
  { name: 'Categories', icon: FolderIcon, href: '/admin/categories' },
  { name: 'Products', icon: CubeIcon, href: '/admin/products' },
  { name: 'Orders', icon: ShoppingBagIcon, href: '/admin/orders' },
  { name: 'Customers', icon: UserGroupIcon, href: '/admin/customers' },
  { name: 'Home Page', icon: Home, href: '/admin/settings' },
  { name: 'Top Strip', icon: DesktopIcon, href: '/admin/top-strip' },
  { name: 'Navigation', icon: DesktopIcon, href: '/admin/navigation' },
  { name: 'Logs', icon : NotebookTextIcon, href: '/admin/logs' },
  { name: 'App Settings', icon: Settings, href: '/admin/app-settings' },
  { name: 'FAQs', icon: QuoteIcon, href: '/admin/faq' },
  { name: 'Forms', icon: BookAIcon, href: '/admin/contact-us-forms' },
  { name: 'Footer', icon: Footprints, href: '/admin/footer' },
  { name: 'Fonts', icon: ChartBarSquareIcon, href: '/admin/fonts' },
]

export function AdminMenu() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen)

  return (
    <>
      {/* Desktop Menu */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:border-r lg:border-gray-700 lg:bg-gray-900 lg:pt-5 lg:pb-4">
        <div className="flex items-center flex-shrink-0 px-6">
          <span className="text-2xl font-semibold text-white">Admin Panel</span>
        </div>
        <nav className="mt-5 flex-1 flex flex-col divide-y divide-gray-700 overflow-y-auto">
          <div className="px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`group flex items-center px-2 py-2 text-sm leading-6 font-medium rounded-md ${
                  pathname === item.href
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon
                  className={`mr-4 flex-shrink-0 h-6 w-6 ${
                    pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-white'
                  }`}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </div>
        </nav>
      </div>

      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-0 left-0 m-4 z-20">
        <button
          onClick={toggleMobileMenu}
          className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
        >
          <span className="sr-only">Open sidebar</span>
          <MenuIcon className="h-6 w-6" aria-hidden="true" />
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.3 }}
            className="fixed inset-0 flex z-40 lg:hidden"
          >
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-75"
              aria-hidden="true"
              onClick={toggleMobileMenu}
            ></motion.div>

            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.3 }}
              className="relative flex-1 flex flex-col max-w-xs w-full bg-gray-900"
            >
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                  onClick={toggleMobileMenu}
                >
                  <span className="sr-only">Close sidebar</span>
                  <XIcon className="h-6 w-6 text-white" aria-hidden="true" />
                </button>
              </div>
              <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                <div className="flex-shrink-0 flex items-center px-4">
                  <span className="text-2xl font-semibold text-white">Admin Panel</span>
                </div>
                <nav className="mt-5 px-2 space-y-1">
                  {menuItems.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                        pathname === item.href
                          ? 'bg-gray-800 text-white'
                          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                      }`}
                      onClick={toggleMobileMenu}
                    >
                      <item.icon
                        className={`mr-4 flex-shrink-0 h-6 w-6 ${
                          pathname === item.href ? 'text-white' : 'text-gray-400 group-hover:text-white'
                        }`}
                        aria-hidden="true"
                      />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}