'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input } from '../components/ui/input'


  const API_BASE_URL = 'https://localhost:7007/api'

interface Category {
  id: string
  name: string
  description: string
  thumbNailUrl: string
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const router = useRouter()

  useEffect(() => {
    fetchCategories()
  }, [])

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('An error occurred while fetching categories')
    }
  }

  const handleCategoryClick = (e: React.MouseEvent<HTMLAnchorElement>, category: Category) => {
    e.preventDefault()
    const encodedCategory = encodeURIComponent(category.name)
    router.push(`/products?category=${encodedCategory}`)
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      <h1 className="text-4xl font-bold mb-8 text-center dark:text-white">Explore Our Categories</h1>

      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mx-auto dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden transition-colors duration-200"
          >
            <Link href={`/products?category=${encodeURIComponent(category.name)}`} onClick={(e) => handleCategoryClick(e, category)}>
              <div className="relative h-48">
                <Image
                  src={category.thumbNailUrl}
                  alt={category.name}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 ease-in-out transform hover:scale-110"
                />
              </div>
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2 dark:text-white">{category.name}</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-4">{category.description}</p>
              </div>
              <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <span className="text-blue-600 dark:text-blue-400 font-medium">Explore Category</span>
                <ChevronRightIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
          No categories found matching your search.
        </div>
      )}
    </div>
  )
}