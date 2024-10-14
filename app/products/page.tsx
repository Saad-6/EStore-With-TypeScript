'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Checkbox } from '../components/ui/checkbox'
import { Label } from '../components/ui/label'
import { Slider } from '../components/ui/slider'
import ModernProductCard from '../components/modern-product-card'
import Link from 'next/link'
import { Category, Product } from '@/interfaces/product-interfaces'
import toast from 'react-hot-toast'

const brands = ['All', 'TechAudio', 'SmartGear', 'TechPro', 'MobiTech', 'BrewMaster', 'FitTech', 'SoundWave', 'PureAir']

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedBrand, setSelectedBrand] = useState('All')
  const [priceRange, setPriceRange] = useState([0, 1000])
  const router = useRouter()

  useEffect(() => {
    GetProducts()
    fetchCategories()
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, selectedCategory, selectedBrand, priceRange])

  const GetProducts = async () => {
    try {
      const res = await fetch('https://localhost:7007/api/Product/')
      if (res.ok) {
        const fetchedProducts: Product[] = await res.json()
        setProducts(fetchedProducts)
        setFilteredProducts(fetchedProducts)
      } else {
        const errorText = await res.text()
        console.error("Failed to fetch products:", errorText)
        toast.error(`Failed to fetch products. Server response: ${errorText}`, { duration: 20000 })
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error(`An error occurred while fetching products: ${error}`, { duration: 20000 })
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://localhost:7007/api/Category')
      if (response.ok) {
        const data: Category[] = await response.json()
        setCategories(data)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('An error occurred while fetching categories')
    }
  }

  const filterProducts = () => {
    const filtered = products.filter(product => 
      (selectedCategory === 'All' || product.category.name === selectedCategory) &&
      (selectedBrand === 'All' || product.brand === selectedBrand) &&
      product.price >= priceRange[0] && product.price <= priceRange[1]
    )
    setFilteredProducts(filtered)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Our Products</h1>
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters */}
        <div className="w-full md:w-1/4">
          <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Filters</h2>
            
            {/* Category Filter */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Category</h3>
              <div className="flex items-center mb-2">
                <Checkbox
                  id="category-All"
                  checked={selectedCategory === 'All'}
                  onCheckedChange={() => setSelectedCategory('All')}
                />
                <Label htmlFor="category-All">All</Label>
              </div>
              {categories.map(category => (
                <div key={category.id} className="flex items-center mb-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategory === category.name}
                    onCheckedChange={(checked) => setSelectedCategory(checked ? category.name : 'All')}
                  />
                  <Label htmlFor={`category-${category.id}`}>
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>

            {/* Brand Filter */}
            <div className="mb-4">
              <h3 className="font-semibold mb-2">Brand</h3>
              {brands.map(brand => (
                <div key={brand} className="flex items-center mb-2">
                  <Checkbox
                    id={`brand-${brand}`}
                    checked={selectedBrand === brand}
                    onCheckedChange={(checked) => setSelectedBrand(checked ? brand : 'All')}
                  />
                  <Label htmlFor={`brand-${brand}`}>
                    {brand}
                  </Label>
                </div>
              ))}
            </div>

            {/* Price Range Filter */}
            <div>
              <h3 className="font-semibold mb-2">Price Range</h3>
              <Slider
                min={0}
                max={1000}
                step={10}
                value={[priceRange[1]]}
                onValueChange={(value) => setPriceRange([0, value[0]])}
              />
              <div className="flex justify-between text-sm text-gray-600 mt-2">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Product Grid */}
        <div className="w-full md:w-3/4">
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
        </div>
      </div>
    </div>
  )
}