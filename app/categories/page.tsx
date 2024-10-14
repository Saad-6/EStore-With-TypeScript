'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ChevronRightIcon } from '@heroicons/react/24/outline'
import { Input } from '../components/ui/input'
import toast from 'react-hot-toast'


// Define our category type
interface Category {
  id: string
  name: string
  description: string
  thumbNailUrl: string
//  featured: boolean
//  subcategories: string[]
}

// Sample categories data

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  useEffect(()=>{
fetchCategories();
  },[])
  useEffect(()=>{
   console.log("cat",categories)
      },[categories])
  const [searchTerm, setSearchTerm] = useState('')

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description.toLowerCase().includes(searchTerm.toLowerCase())

  )
const API_BASE_URL = 'https://localhost:7007/api';
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
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">Explore Our Categories</h1>

      <div className="mb-8">
        <Input
          type="text"
          placeholder="Search categories..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full max-w-md mx-auto"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredCategories.map((category) => (
          <motion.div
            key={category.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-white rounded-lg shadow-lg overflow-hidden"
          >
            <Link href={`/categories/${category.id}`}>
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
                <h2 className="text-xl font-semibold mb-2">{category.name}</h2>
                <p className="text-gray-600 mb-4">{category.description}</p>
       
              </div>
              <div className="px-4 py-2 bg-gray-50 flex justify-between items-center">
                <span className="text-blue-600 font-medium">Explore Category</span>
                <ChevronRightIcon className="h-5 w-5 text-blue-600" />
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredCategories.length === 0 && (
        <div className="text-center text-gray-500 mt-8">
          No categories found matching your search.
        </div>
      )}
    </div>
  )
}