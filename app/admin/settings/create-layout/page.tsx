'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'react-hot-toast'
import { HomePageLayout, HomePageSettings, HeroCarouselSlide, SimpleProductDTO, SimpleCategoryDTO, SimpleCategory, SimpleProduct, Category } from '@/interfaces/product-interfaces'
import Image from 'next/image'
import { X } from 'lucide-react'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/app/lib/auth'

const API_BASE_URL = 'https://localhost:7007/api'

export default function CreateLayout() {
  const router = useRouter()
  const [layoutName, setLayoutName] = useState('')
  const [isActive, setIsActive] = useState(false)
  const [heroCarousel, setHeroCarousel] = useState<HeroCarouselSlide[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<SimpleProduct[]>([])
  const [newArrivals, setNewArrivals] = useState<SimpleProduct[]>([])
  const [categories, setCategories] = useState<SimpleCategory[]>([])
  const [allProducts, setAllProducts] = useState<SimpleProduct[]>([])
  const [allCategories, setAllCategories] = useState<SimpleCategory[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const {getToken} = useAuth();

  useEffect(() => {
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Product/simple`)
      if (response.ok) {
        const data: SimpleProduct[] = await response.json()
        setAllProducts(data)
      } else {
        toast.error('Failed to fetch products')
      }
    } catch (error) {
      console.error('Error fetching products:', error)
      toast.error('Error fetching products')
    }
  }
  const convertToSimpleCategory = (categories: Category[]): SimpleCategory[] => {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      imageUrl: category.thumbNailUrl, // Map thumbNailUrl to imageUrl
    }));
  };

  const fetchCategories = async () => {
    
    try {
      const response = await fetch(`${API_BASE_URL}/Category`)
      if (response.ok) {
        const data: Category[] = await response.json()
        const simpleCategories: SimpleCategory[] = convertToSimpleCategory(data);
        setAllCategories(simpleCategories)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('Error fetching categories')
    }
  }

  const handleCreateLayout = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const newLayout: HomePageLayout = {
      name: layoutName,
      isActive: isActive,
      settings: {
        heroCarousel: heroCarousel,
        featuredProducts: featuredProducts,
        newArrivals: newArrivals,
        categories: categories
      }
    }

    try {

      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Layout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newLayout),
      })

      if (!response.ok) {
        throw new Error('Failed to create layout')
      }

      toast.success('Layout created successfully')
      router.push('/admin/settings')
    } catch (error) {
      console.error('Error creating layout:', error)
      toast.error('Error creating layout')
    } finally {
      setIsLoading(false)
    }
  }

  const addHeroCarouselSlide = () => {
    setHeroCarousel([...heroCarousel, { image: '', title: '', subtitle: '', buttonText: '' }])
  }

  const updateHeroCarouselSlide = (index: number, field: keyof HeroCarouselSlide, value: string) => {
    const updatedSlides = [...heroCarousel]
    updatedSlides[index] = { ...updatedSlides[index], [field]: value }
    setHeroCarousel(updatedSlides)
  }

  const removeHeroCarouselSlide = (index: number) => {
    setHeroCarousel(heroCarousel.filter((_, i) => i !== index))
  }

  const addProduct = (section: 'featuredProducts' | 'newArrivals') => {
    const setter = section === 'featuredProducts' ? setFeaturedProducts : setNewArrivals
    setter(prev => [...prev, {} as SimpleProduct])
  }

  const updateProduct = (section: 'featuredProducts' | 'newArrivals', index: number, productId: string) => {
    const setter = section === 'featuredProducts' ? setFeaturedProducts : setNewArrivals
    const product = allProducts.find(p => p.id.toString() === productId)
    if (product) {
      setter(prev => {
        const updated = [...prev]
        updated[index] = product
        return updated
      })
    }
  }

  const removeProduct = (section: 'featuredProducts' | 'newArrivals', index: number) => {
    const setter = section === 'featuredProducts' ? setFeaturedProducts : setNewArrivals
    setter(prev => prev.filter((_, i) => i !== index))
  }

  const addCategory = () => {
    setCategories([...categories, {} as SimpleCategoryDTO])
  }

  const updateCategory = (index: number, categoryId: string) => {
    const category = allCategories.find(c => c.id.toString() === categoryId)
    if (category) {
      const updatedCategories = [...categories]
      updatedCategories[index] = category
      setCategories(updatedCategories)
    }
  }

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Create New Layout</h1>
      <Card>
        <CardHeader>
          <CardTitle>New Layout Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateLayout}>
            <div className="mb-4">
              <Label htmlFor="layout-name">Layout Name</Label>
              <Input
                id="layout-name"
                value={layoutName}
                onChange={(e) => setLayoutName(e.target.value)}
                placeholder="Enter layout name"
                required
              />
            </div>
            <div className="mb-4">
              <Checkbox
                id="is-active"
                checked={isActive}
                onCheckedChange={(checked) => setIsActive(checked as boolean)}
              />
              <Label htmlFor="is-active" className="ml-2">Is Active</Label>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Hero Carousel</h3>
              {heroCarousel.map((slide, index) => (
                <div key={index} className="mb-2 p-2 border rounded relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeHeroCarouselSlide(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Input
                    value={slide.image}
                    onChange={(e) => updateHeroCarouselSlide(index, 'image', e.target.value)}
                    placeholder="Image URL"
                    className="mb-1"
                  />
                  <Input
                    value={slide.title}
                    onChange={(e) => updateHeroCarouselSlide(index, 'title', e.target.value)}
                    placeholder="Title"
                    className="mb-1"
                  />
                  <Input
                    value={slide.subtitle}
                    onChange={(e) => updateHeroCarouselSlide(index, 'subtitle', e.target.value)}
                    placeholder="Subtitle"
                    className="mb-1"
                  />
                  <Input
                    value={slide.buttonText}
                    onChange={(e) => updateHeroCarouselSlide(index, 'buttonText', e.target.value)}
                    placeholder="Button Text"
                  />
                </div>
              ))}
              <Button type="button" onClick={addHeroCarouselSlide} className="mt-2">
                Add Hero Carousel Slide
              </Button>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Featured Products</h3>
              {featuredProducts.map((product, index) => (
                <div key={index} className="mb-2 p-2 border rounded relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeProduct('featuredProducts', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Select
                    onValueChange={(value) => updateProduct('featuredProducts', index, value)}
                    value={product.id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          <div className="flex items-center">
                            <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="mr-2 rounded" />
                            {p.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button type="button" onClick={() => addProduct('featuredProducts')} className="mt-2">
                Add Featured Product
              </Button>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">New Arrivals</h3>
              {newArrivals.map((product, index) => (
                <div key={index} className="mb-2 p-2 border rounded relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeProduct('newArrivals', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Select
                    onValueChange={(value) => updateProduct('newArrivals', index, value)}
                    value={product.id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a product" />
                    </SelectTrigger>
                    <SelectContent>
                      {allProducts.map(p => (
                        <SelectItem key={p.id} value={p.id.toString()}>
                          <div className="flex items-center">
                            <Image src={p.imageUrl} alt={p.name} width={40} height={40} className="mr-2 rounded" />
                            {p.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button type="button" onClick={() => addProduct('newArrivals')} className="mt-2">
                Add New Arrival
              </Button>
            </div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Categories</h3>
              {categories.map((category, index) => (
                <div key={index} className="mb-2 p-2 border rounded relative">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => removeCategory(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Select
                    onValueChange={(value) => updateCategory(index, value)}
                    value={category.id?.toString()}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {allCategories.map(c => (
                        <SelectItem key={c.id} value={c.id.toString()}>
                          <div className="flex items-center">
                            <Image src={c.imageUrl} alt={c.name} width={40} height={40} className="mr-2 rounded" />
                            {c.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button type="button" onClick={addCategory} className="mt-2">
                Add Category
              </Button>
            </div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Layout'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}