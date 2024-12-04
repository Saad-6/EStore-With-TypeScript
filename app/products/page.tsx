'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Category, Product } from '@/interfaces/product-interfaces'
import toast from 'react-hot-toast'

import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '../components/ui/input'
import ModernProductCard from '../components/modern-product-card'

interface ProductsPageProps {
  initialName?: string
  initialDescription?: string
}

export default function ProductsPage({ initialName, initialDescription }: ProductsPageProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [priceFrom, setPriceFrom] = useState(0)
  const [priceTo, setPriceTo] = useState(10000)  // Increased to 10000 to ensure it doesn't filter out high-priced items
  const [isLoading, setIsLoading] = useState(true)

  const searchParams = useSearchParams()

  const getProducts = useCallback(async () => {
    try {
      const res = await fetch('https://localhost:7007/api/Product/')
      if (res.ok) {
        const fetchedProducts: Product[] = await res.json()
        setProducts(fetchedProducts)
        console.log("Fetched products:", fetchedProducts.length)
        console.log("Sample product:", fetchedProducts[0])  // Log a sample product
      } else {
        const errorText = await res.text()
        console.error("Failed to fetch products:", errorText)
        toast.error(`Failed to fetch products. Server response: ${errorText}`, { duration: 20000 })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error(`An error occurred while fetching products: ${error}`, { duration: 20000 })
    } finally {
      setIsLoading(false)
    }
  }, [])

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('https://localhost:7007/api/Category')
      if (response.ok) {
        const data: Category[] = await response.json()
        setCategories(data)
        console.log("Fetched categories:", data.length)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('An error occurred while fetching categories')
    }
  }, [])

  useEffect(() => {
    getProducts()
    fetchCategories()
  }, [getProducts, fetchCategories])

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category')
    if (categoryFromUrl) {
      const decodedCategory = decodeURIComponent(categoryFromUrl)
      setSelectedCategory(decodedCategory)
      console.log("Decoded Category name from url:", decodedCategory)
    } else {
      setSelectedCategory('All')
    }
  }, [searchParams])

  const filterProducts = useCallback(() => {
    console.log("Filtering products:", products.length)
    console.log("Selected category:", selectedCategory)
    console.log("Price range:", priceFrom, "-", priceTo)
    const filtered = products.filter(product => {
      const categoryMatch = selectedCategory === 'All' || product.category.name.toLowerCase() === selectedCategory.toLowerCase()
      const priceMatch = product.price >= priceFrom && product.price <= priceTo
      const nameMatch = !initialName || product.name.toLowerCase().includes(initialName.toLowerCase())
      const descriptionMatch = !initialDescription || product.description.toLowerCase().includes(initialDescription.toLowerCase())
      
      console.log(`Product ${product.name}: Category Match: ${categoryMatch}, Price Match: ${priceMatch}, Name Match: ${nameMatch}, Description Match: ${descriptionMatch}`)
      
      return categoryMatch && priceMatch && nameMatch && descriptionMatch
    })
    console.log("Filtered products:", filtered.length)
    setFilteredProducts(filtered)
  }, [products, selectedCategory, priceFrom, priceTo, initialName, initialDescription])

  useEffect(() => {
    if (products.length > 0) {
      filterProducts()
    }
  }, [products, filterProducts])

  if (isLoading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8 dark:bg-gray-900">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Our Products</h1>
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters */}
        <div className="w-full lg:w-1/4">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow mb-4 lg:mb-0">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Filters</h2>
            
            {/* Category Filter */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2 dark:text-white">Category</h3>
              <div className="flex items-center mb-2">
                <Checkbox
                  id="category-All"
                  checked={selectedCategory === 'All'}
                  onCheckedChange={() => setSelectedCategory('All')}
                />
                <Label htmlFor="category-All" className="ml-2 dark:text-white">All</Label>
              </div>
              {categories.map(category => (
                <div key={category.id} className="flex items-center mb-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategory.toLowerCase() === category.name.toLowerCase()}
                    onCheckedChange={(checked) => setSelectedCategory(checked ? category.name : 'All')}
                  />
                  <Label htmlFor={`category-${category.id}`} className="ml-2 dark:text-white">
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-semibold mb-2 dark:text-white">Price Range</h3>
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  placeholder="From"
                  value={priceFrom}
                  onChange={(e) => setPriceFrom(Number(e.target.value))}
                  className="w-1/2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
                />
                <span className="dark:text-white">-</span>
                <Input
                  type="number"
                  placeholder="To"
                  value={priceTo}
                  onChange={(e) => setPriceTo(Number(e.target.value))}
                  className="w-1/2 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full lg:w-3/4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map(product => (
              <Link href={`/${product.slug}`} key={product.id}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ModernProductCard
                    name={product.name}
                    price={product.price}
                    image={product.primaryImage.url}
                    category={product.category.name}
                  />
                </motion.div>
              </Link>
            ))}
          </div>
          {filteredProducts.length === 0 && !isLoading && (
            <p className="text-center text-gray-500 dark:text-gray-400 mt-8">No products found matching your criteria.</p>
          )}
        </div>
      </div>
    </div>
  )
}

