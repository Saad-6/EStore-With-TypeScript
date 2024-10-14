'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Product, Category, Variant, VariantOption } from '@/interfaces/product-interfaces'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { Button } from '@/app/components/ui/button'


const API_BASE_URL = 'https://localhost:7007/api';

export default function ProductPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const [productRes, categoriesRes] = await Promise.all([
          params.id !== 'new' ? fetch(`${API_BASE_URL}/Product/${params.id}`) : Promise.resolve(null),
          fetch(`${API_BASE_URL}/Category`)
        ])
        
        const categoriesData = await categoriesRes.json()
        setCategories(categoriesData)

        if (params.id !== 'new' && productRes) {
          if (productRes.ok) {
            const productData = await productRes.json()
            setProduct(productData)
          } else {
            toast.error('Failed to fetch product data')
          }
        } else {
          setProduct({
            id: 0,
            name: '',
            description: '',
            price: 0,
            sku: '',
            stock: 0,
            brand: '',
            categoryId: categoriesData[0]?.id || 0,
            category: categoriesData[0] || null,
            slug: '',
            isActive: true,
            seo: { metaTitle: '', metaDescription: '', metaKeywords: '', canonicalUrl: '' },
            primaryImage: { url: '', altText: '' },
            images: [],
            variants: []
          })
        }
      } catch (error) {
        console.error('Error fetching data:', error)
        toast.error('An error occurred while fetching data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    try {
      const method = product?.id ? 'PUT' : 'POST'
      const url = product?.id ? `${API_BASE_URL}/Product/${product.id}` : `${API_BASE_URL}/Product`
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(product),
      })

      if (response.ok) {
        toast.success(`Product ${product?.id ? 'updated' : 'created'} successfully`)
        router.push('/admin/products')
      } else {
        toast.error('Failed to save product')
      }
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('An error occurred while saving the product')
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setProduct(prev => prev ? { ...prev, [name]: value } : null)
  }

  const handleSEOChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setProduct(prev => prev ? { ...prev, seo: { ...prev.seo, [name]: value } } : null)
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target
    if (index === -1) {
      setProduct(prev => prev ? { ...prev, primaryImage: { ...prev.primaryImage, [name]: value } } : null)
    } else {
      setProduct(prev => {
        if (!prev) return null
        const newImages = [...prev.images]
        newImages[index] = { ...newImages[index], [name]: value }
        return { ...prev, images: newImages }
      })
    }
  }

  const handleAddImage = () => {
    setProduct(prev => {
      if (!prev) return null
      if (prev.images.length < 4) {
        return { ...prev, images: [...prev.images, { url: '', altText: '' }] }
      }
      return prev
    })
  }

  const handleRemoveImage = (index: number) => {
    setProduct(prev => {
      if (!prev) return null
      const newImages = prev.images.filter((_, i) => i !== index)
      return { ...prev, images: newImages }
    })
  }

  const handleVariantChange = (index: number, field: string, value: string) => {
    setProduct(prev => {
      if (!prev) return null
      const newVariants = [...prev.variants]
      newVariants[index] = { ...newVariants[index], [field]: value }
      return { ...prev, variants: newVariants }
    })
  }

  const handleVariantOptionChange = (variantIndex: number, optionIndex: number, value: string) => {
    setProduct(prev => {
      if (!prev) return null
      const newVariants = [...prev.variants]
      const newOptions = [...newVariants[variantIndex].options]
      newOptions[optionIndex] = { ...newOptions[optionIndex], value }
      newVariants[variantIndex] = { ...newVariants[variantIndex], options: newOptions }
      return { ...prev, variants: newVariants }
    })
  }

  const addVariant = () => {
    setProduct(prev => {
      if (!prev) return null
      const newVariants = [...prev.variants, { id: 0, name: '', options: [] }]
      return { ...prev, variants: newVariants }
    })
  }

  const addVariantOption = (variantIndex: number) => {
    setProduct(prev => {
      if (!prev) return null
      const newVariants = [...prev.variants]
      newVariants[variantIndex].options.push({ id: 0, value: '' })
      return { ...prev, variants: newVariants }
    })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/admin/products">
        <Button variant="outline" className="mb-4">Back to Products</Button>
      </Link>
      <h1 className="text-2xl font-bold mb-4">{product?.id ? 'Edit' : 'Add'} Product</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={product?.name || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              maxLength={200}
            />
          </div>
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
            <input
              type="text"
              id="slug"
              name="slug"
              value={product?.slug || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={200}
            />
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            id="description"
            name="description"
            value={product?.description || ''}
            onChange={handleChange}
            rows={3}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div className="grid grid-cols-3 gap-6">
          <div>
            <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              id="price"
              name="price"
              value={product?.price || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              min="0.01"
              step="0.01"
            />
          </div>
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
            <input
              type="text"
              id="sku"
              name="sku"
              value={product?.sku || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              maxLength={50}
            />
          </div>
          <div>
            <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
            <input
              type="number"
              id="stock"
              name="stock"
              value={product?.stock || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
              min="0"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
            <input
              type="text"
              id="brand"
              name="brand"
              value={product?.brand || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              maxLength={100}
            />
          </div>
          <div>
            <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
            <select
              id="categoryId"
              name="categoryId"
              value={product?.categoryId || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={product?.isActive || false}
              onChange={(e) => setProduct(prev => prev ? { ...prev, isActive: e.target.checked } : null)}
              className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
            />
            <span className="ml-2 text-sm text-gray-700">Is Active</span>
          </label>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">SEO</h3>
          <div>
            <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
            <input
              type="text"
              id="metaTitle"
              name="metaTitle"
              value={product?.seo.metaTitle || ''}
              onChange={handleSEOChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
            <textarea
              id="metaDescription"
              name="metaDescription"
              value={product?.seo.metaDescription || ''}
              onChange={handleSEOChange}
              rows={2}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">Meta Keywords</label>
            <input
              type="text"
              id="metaKeywords"
              name="metaKeywords"
              value={product?.seo.metaKeywords || ''}
              onChange={handleSEOChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700">Canonical URL</label>
            <input
              type="text"
              id="canonicalUrl"
              name="canonicalUrl"
              value={product?.seo.canonicalUrl || ''}
              onChange={handleSEOChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>

        <div  className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Images</h3>
          <div>
            <label className="block text-sm font-medium text-gray-700">Primary Image</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="url"
                value={product?.primaryImage.url || ''}
                onChange={(e) => handleImageChange(e, -1)}
                placeholder="Image URL"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
              <input
                type="text"
                name="altText"
                value={product?.primaryImage.altText || ''}
                onChange={(e) => handleImageChange(e, -1)}
                placeholder="Alt Text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
          </div>
          {product?.images.map((image, index) => (
            <div key={index}>
              <label className="block text-sm font-medium text-gray-700">Additional Image {index + 1}</label>
              <div className="grid grid-cols-2 gap-4">
                <input
                  type="text"
                  name="url"
                  value={image.url}
                  onChange={(e) => handleImageChange(e, index)}
                  placeholder="Image URL"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
                <input
                  type="text"
                  name="altText"
                  value={image.altText}
                  onChange={(e) => handleImageChange(e, index)}
                  placeholder="Alt Text"
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <button type="button" onClick={() => handleRemoveImage(index)} className="mt-2 text-sm text-red-600 hover:text-red-800">
                Remove Image
              </button>
            </div>
          ))}
      {product?.images?.length && product.images.length < 4 && (
  <button 
    type="button" 
    onClick={handleAddImage} 
    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
  >
    Add Image (Max 4)
  </button>
)}

        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-900">Variants</h3>
          {product?.variants.map((variant, variantIndex) => (
            <div key={variantIndex} className="border p-4 rounded">
              <input
                type="text"
                value={variant.name}
                onChange={(e) => handleVariantChange(variantIndex, 'name', e.target.value)}
                placeholder="Variant Name (e.g., Size, Color)"
                className="mb-2 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {variant.options.map((option, optionIndex) => (
                <input
                  key={optionIndex}
                  type="text"
                  value={option.value}
                  onChange={(e) => handleVariantOptionChange(variantIndex, optionIndex, e.target.value)}
                  placeholder="Option Value"
                  className="mb-2 w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              ))}
              <button type="button" onClick={() => addVariantOption(variantIndex)} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                Add Option
              </button>
            </div>
          ))}
          <button type="button" onClick={addVariant} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
            Add Variant
          </button>
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {product?.id ? 'Update Product' : 'Add Product'}
          </Button>
        </div>
      </form>
    </div>
  )
}