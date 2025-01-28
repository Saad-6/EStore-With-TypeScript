'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'react-hot-toast'
import { Category, HomePageLayout, SimpleCategory, SimpleProduct } from '@/interfaces/product-interfaces'
import Image from 'next/image'
import { X, Trash2 } from 'lucide-react'
import { Input } from '@/app/components/ui/input'
import { Button } from '@/app/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { useRouter } from 'next/navigation'
import { ConfirmationAlert } from '@/app/components/ui/confirmation-alert'
import { BouncingDotsLoader } from '@/app/components/ui/Loaders'



export default function AdminMenu() {
  const [layouts, setLayouts] = useState<HomePageLayout[]>([])
  const [selectedLayout, setSelectedLayout] = useState<HomePageLayout | null>(null)
  const [allProducts, setAllProducts] = useState<SimpleProduct[]>([])
  const [allCategories, setAllCategories] = useState<SimpleCategory[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAlertOpen, setIsAlertOpen] = useState(false) // Added state for alert
  const dataFetchedRef = useRef(false)

  const router = useRouter()

  useEffect(() => {
    if (dataFetchedRef.current) return
    dataFetchedRef.current = true

    const fetchData = async () => {
      setIsLoading(true)
      setError(null)
      try {
        await Promise.all([fetchLayouts(), fetchProducts(), fetchCategories()])
      } catch (err) {
        setError('Failed to fetch data. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const fetchLayouts = async () => {
    try {
      const response = await fetch('https://localhost:7007/api/Layout')
      if (!response.ok) throw new Error('Failed to fetch layouts')
      const data: HomePageLayout[] = await response.json()
      setLayouts(data)
      setSelectedLayout(data.find(layout => layout.isActive) || data[0] || null)
    } catch (error) {
      console.error('Error fetching layouts:', error)
      throw error
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('https://localhost:7007/api/Product/simple')
      if (!response.ok) throw new Error('Failed to fetch products')
      const data: SimpleProduct[] = await response.json()
      setAllProducts(data)
    } catch (error) {
      console.error('Error fetching products:', error)
      throw error
    }
  }

  const fetchCategories = async () => {
    try {
      const response = await fetch('https://localhost:7007/api/Category')
      if (!response.ok) throw new Error('Failed to fetch categories')
      const data: Category[] = await response.json()
      const simpleCategories: SimpleCategory[] = convertToSimpleCategory(data)
      setAllCategories(simpleCategories)
    } catch (error) {
      console.error('Error fetching categories:', error)
      throw error
    }
  }

  const convertToSimpleCategory = (categories: Category[]): SimpleCategory[] => {
    return categories.map(category => ({
      id: category.id,
      name: category.name,
      imageUrl: category.thumbNailUrl,
    }))
  }

  const handleSave = async () => {
    if (!selectedLayout) return

    try {
      const response = await fetch(`https://localhost:7007/api/Layout/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(selectedLayout),
      })

      if (!response.ok) throw new Error('Failed to save layout')

      toast.success('Layout saved successfully')
      await fetchLayouts()
    } catch (error) {
      console.error('Error saving layout:', error)
      toast.error('Error saving layout')
    }
  }

  const handleActivateLayout = async (layoutId: number) => {
    try {
      const response = await fetch(`https://localhost:7007/api/Layout/${layoutId}/activate`, {
        method: 'PUT',
      })

      if (!response.ok) throw new Error('Failed to activate layout')

      toast.success('Layout activated successfully')
      await fetchLayouts()
    } catch (error) {
      console.error('Error activating layout:', error)
      toast.error('Error activating layout')
    }
  }

  const handleDeleteLayout = async (layoutId: number) => {
    try {
      const response = await fetch(`https://localhost:7007/api/Layout/${layoutId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete layout')

      toast.success('Layout deleted successfully')
      await fetchLayouts()
      setIsAlertOpen(false)  // Close the alert after successful deletion
    } catch (error) {
      console.error('Error deleting layout:', error)
      toast.error('Error deleting layout')
    }
  }

  const handleRemoveItem = (section: keyof HomePageLayout['settings'], index: number) => {
    setSelectedLayout(prevLayout => {
      if (!prevLayout) return prevLayout

      const newSettings = { ...prevLayout.settings }

      if (Array.isArray(newSettings[section])) {
        const updatedArray = [...newSettings[section]]
        updatedArray.splice(index, 1)
        newSettings[section] = updatedArray as any
      }

      return { ...prevLayout, settings: newSettings }
    })
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
      <BouncingDotsLoader color="primary" />
    </div>
    )
  }
  if (error) return <div>Error: {error}</div>
  if (!selectedLayout) return <div>No layouts available</div>

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Menu</h1>

      <Button
        onClick={() => router.push('/admin/settings/create-layout')}
        className="mb-4"
      >
        Create New Layout
      </Button>
      <div className="mb-4">
        <Label htmlFor="layout-select">Select Layout</Label>
        <Select
          onValueChange={(value) => {
            const layout = layouts.find(l => l.id?.toString() === value)
            if (layout) setSelectedLayout(layout)
          }}
          value={selectedLayout.id?.toString()}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a layout" />
          </SelectTrigger>
          <SelectContent>
            {layouts.map(layout => (
              <SelectItem key={layout.id} value={layout.id?.toString() ?? ""}>
                {layout.name} {layout.isActive ? '(Active)' : ''}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex space-x-4 mb-4">
        <Button
          onClick={() => handleActivateLayout(selectedLayout.id ?? 0)}
          disabled={selectedLayout.isActive}
        >
          Activate Layout
        </Button>

        <Button
          onClick={() => setIsAlertOpen(true)}
          variant="destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" /> Delete Layout
        </Button>
      </div>

      <ConfirmationAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={() => handleDeleteLayout(selectedLayout.id ?? 0)}
        message="Are you sure you want to delete this Layout? This action cannot be undone."
      />

      <Tabs defaultValue="hero">
        <TabsList>
          <TabsTrigger value="hero">Hero Carousel</TabsTrigger>
          <TabsTrigger value="featured">Featured Products</TabsTrigger>
          <TabsTrigger value="new-arrivals">New Arrivals</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="hero">
          <Card>
            <CardHeader>
              <CardTitle>Hero Carousel</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLayout.settings?.heroCarousel?.map((slide, index) => (
                <div key={index} className="mb-4 p-4 border rounded relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveItem('heroCarousel', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Label htmlFor={`hero-image-${index}`}>Image URL</Label>
                  <Input
                    id={`hero-image-${index}`}
                    value={slide.image}
                    onChange={(e) => {
                      const newCarousel = [...selectedLayout.settings.heroCarousel]
                      newCarousel[index] = { ...newCarousel[index], image: e.target.value }
                      setSelectedLayout({
                        ...selectedLayout,
                        settings: {
                          ...selectedLayout.settings,
                          heroCarousel: newCarousel
                        }
                      })
                    }}
                    className="mb-2"
                  />
                  <Label htmlFor={`hero-title-${index}`}>Title</Label>
                  <Input
                    id={`hero-title-${index}`}
                    value={slide.title}
                    onChange={(e) => {
                      const newCarousel = [...selectedLayout.settings.heroCarousel]
                      newCarousel[index] = { ...newCarousel[index], title: e.target.value }
                      setSelectedLayout({
                        ...selectedLayout,
                        settings: {
                          ...selectedLayout.settings,
                          heroCarousel: newCarousel
                        }
                      })
                    }}
                    className="mb-2"
                  />
                  <Label htmlFor={`hero-subtitle-${index}`}>Subtitle</Label>
                  <Input
                    id={`hero-subtitle-${index}`}
                    value={slide.subtitle}
                    onChange={(e) => {
                      const newCarousel = [...selectedLayout.settings.heroCarousel]
                      newCarousel[index] = { ...newCarousel[index], subtitle: e.target.value }
                      setSelectedLayout({
                        ...selectedLayout,
                        settings: {
                          ...selectedLayout.settings,
                          heroCarousel: newCarousel
                        }
                      })
                    }}
                    className="mb-2"
                  />
                  <Label htmlFor={`hero-button-${index}`}>Button Text</Label>
                  <Input
                    id={`hero-button-${index}`}
                    value={slide.buttonText}
                    onChange={(e) => {
                      const newCarousel = [...selectedLayout.settings.heroCarousel]
                      newCarousel[index] = { ...newCarousel[index], buttonText: e.target.value }
                      setSelectedLayout({
                        ...selectedLayout,
                        settings: {
                          ...selectedLayout.settings,
                          heroCarousel: newCarousel
                        }
                      })
                    }}
                  />
                </div>
              ))}
              <Button
                onClick={() => {
                  setSelectedLayout({
                    ...selectedLayout,
                    settings: {
                      ...selectedLayout.settings,
                      heroCarousel: [
                        ...selectedLayout.settings.heroCarousel,
                        { image: '', title: '', subtitle: '', buttonText: '' }
                      ]
                    }
                  })
                }}
              >
                Add Slide
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="featured">
          <Card>
            <CardHeader>
              <CardTitle>Featured Products</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLayout.settings?.featuredProducts?.map((product, index) => (
                <div key={index} className="mb-4 p-4 border rounded relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveItem('featuredProducts', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Label htmlFor={`product-select-${index}`}>Select Product</Label>
                  <Select
                    onValueChange={(value) => {
                      const selectedProduct = allProducts.find(p => p.id.toString() === value)
                      if (selectedProduct) {
                        const newProducts = [...selectedLayout.settings.featuredProducts]
                        newProducts[index] = selectedProduct
                        setSelectedLayout({
                          ...selectedLayout,
                          settings: {
                            ...selectedLayout.settings,
                            featuredProducts: newProducts
                          }
                        })
                      }
                    }}
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
              <Button
                onClick={() => {
                  setSelectedLayout({
                    ...selectedLayout,
                    settings: {
                      ...selectedLayout.settings,
                      featuredProducts: [
                        ...selectedLayout.settings.featuredProducts,
                        {} as SimpleProduct
                      ]
                    }
                  })
                }}
              >
                Add Product
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="new-arrivals">
          <Card>
            <CardHeader>
              <CardTitle>New Arrivals</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLayout.settings?.newArrivals?.map((product, index) => (
                <div key={index} className="mb-4 p-4 border rounded relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveItem('newArrivals', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Label htmlFor={`new-arrival-select-${index}`}>Select Product</Label>
                  <Select
                    onValueChange={(value) => {
                      const selectedProduct = allProducts.find(p => p.id.toString() === value)
                      if (selectedProduct) {
                        const newArrivals = [...selectedLayout.settings.newArrivals]
                        newArrivals[index] = selectedProduct
                        setSelectedLayout({
                          ...selectedLayout,
                          settings: {
                            ...selectedLayout.settings,
                            newArrivals: newArrivals
                          }
                        })
                      }
                    }}
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
              <Button
                onClick={() => {
                  setSelectedLayout({
                    ...selectedLayout,
                    settings: {
                      ...selectedLayout.settings,
                      newArrivals: [
                        ...selectedLayout.settings.newArrivals,
                        {} as SimpleProduct
                      ]
                    }
                  })
                }}
              >
                Add New Arrival
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedLayout.settings?.categories?.map((category, index) => (
                <div key={index} className="mb-4 p-4 border rounded relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={() => handleRemoveItem('categories', index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <Label htmlFor={`category-select-${index}`}>Select Category</Label>
                  <Select
                    onValueChange={(value) => {
                      const selectedCategory = allCategories.find(c => c.id.toString() === value)
                      if (selectedCategory) {
                        const newCategories = [...selectedLayout.settings.categories]
                        newCategories[index] = selectedCategory
                        setSelectedLayout({
                          ...selectedLayout,
                          settings: {
                            ...selectedLayout.settings,
                            categories: newCategories
                          }
                        })
                      }
                    }}
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
              <Button
                onClick={() => {
                  setSelectedLayout({
                    ...selectedLayout,
                    settings: {
                      ...selectedLayout.settings,
                      categories: [
                        ...selectedLayout.settings.categories,
                        {} as SimpleCategory
                      ]
                    }
                  })
                }}
              >
                Add Category
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Button onClick={handleSave} className="mt-4" variant="secondary">Save Changes</Button>
    </div>
  )
}