'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { StarIcon } from '@heroicons/react/20/solid'

import { Product, Variant, VariantOption } from '@/interfaces/product-interfaces'
import toast from 'react-hot-toast'
import RecommendedProducts from '../components/recommended-products'
import { Button } from '../components/ui/button'
import { Modal } from '../components/ui/cart-modal'
import UserReviews from '../components/user-review'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'
import { Label } from '../components/ui/label'

export default function ProductDetails() {
  const params = useParams()
  const router = useRouter()
  const productSlug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [selectedVariants, setSelectedVariants] = useState<Record<string, VariantOption>>({})

  useEffect(() => {
    const fetchProductAndRecommendations = async () => {
      setIsLoading(true)
      try {
        const [productResponse, recommendationsResponse] = await Promise.all([
          fetch(`https://localhost:7007/api/Product/${productSlug}`),
          fetch(`https://localhost:7007/api/Product/recommendations/${productSlug}`)
        ])

        if (!productResponse.ok || !recommendationsResponse.ok) {
          throw new Error('Failed to fetch product or recommendations')
        }

        const productData: Product = await productResponse.json()
        const recommendationsData: Product[] = await recommendationsResponse.json()

        setProduct(productData)
        setRecommendedProducts(recommendationsData)

        // Initialize selected variants
        if (productData.variants) {
          const initialSelectedVariants: Record<string, VariantOption> = {}
          productData.variants.forEach(variant => {
            if (variant.options.length > 0) {
              initialSelectedVariants[variant.name] = variant.options[0]
            }
          })
          setSelectedVariants(initialSelectedVariants)
        }
      } catch (error) {
        console.error('Error fetching product or recommendations:', error)
        toast.error('Failed to load product details or recommendations')
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductAndRecommendations()
  }, [productSlug])

  const handleVariantChange = (variantName: string, value: string) => {
    const variant = product?.variants.find(v => v.name === variantName)
    const option = variant?.options.find(o => o.value === value)
    if (option) {
      setSelectedVariants(prev => ({
        ...prev,
        [variantName]: option
      }))
    }
  }

  const handleAddToCart = () => {
    setIsModalOpen(true)
    const cart = JSON.parse(localStorage.getItem('cart') || '[]')
    const cartItem = {
      ...product,
      quantity,
      selectedVariants
    }
    const existingItemIndex = cart.findIndex((item: any) => 
      item.id === product?.id && 
      JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants)
    )
    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity
    } else {
      cart.push(cartItem)
    }
    localStorage.setItem('cart', JSON.stringify(cart))
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
  }

  const handleViewCart = () => {
    router.push('/cart')
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>
  }

  const productImages = [
    product.primaryImage,
    ...(Array.isArray(product.images) ? product.images : [])
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Product Images */}
        <div className="w-full md:w-1/2 space-y-4">
          <div className="relative aspect-square">
            {productImages.length > 0 && (
              <Image
                src={productImages[activeImageIndex].url}
                alt={productImages[activeImageIndex].altText}
                fill
                className="rounded-lg object-cover"
              />
            )}
          </div>
          {productImages.length > 1 && (
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {productImages.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden ${
                    index === activeImageIndex ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  <Image
                    src={image.url}
                    alt={image.altText}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details */}
        <div className="w-full md:w-1/2">
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          <p className="text-2xl font-semibold mb-4">${product.price.toFixed(2)}</p>
          
          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(4.5) ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">4.5 (120 reviews)</span>
          </div>

          <p className="text-gray-600 mb-6">{product.description}</p>

          <div className="mb-6">
            <p className="font-semibold">Category: <span className="font-normal">{product.category.name}</span></p>
            <p className="font-semibold">Brand: <span className="font-normal">{product.brand}</span></p>
          </div>

          {/* Variants */}
          {product.variants && product.variants.length > 0 && (
            <div className="mb-6 space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.id}>
                  <Label htmlFor={`variant-${variant.id}`}>{variant.name}</Label>
                  <RadioGroup
                    value={selectedVariants[variant.name]?.value || ''}
                    onValueChange={(value) => handleVariantChange(variant.name, value)}
                    className="mt-2"
                  >
                    {variant.options.map((option) => (
                   <div key={option.id} className="flex items-center space-x-2">
                   <RadioGroupItem
                     value={option.value}
                     id={`${variant.name}-${option.id}`}
                   />
                   <Label htmlFor={`${variant.name}-${option.id}`} >
                     {option.value}
                     {option.priceAdjustment !== 0 && (
                       <span className={`ml-2 text-sm ${option.priceAdjustment > 0 ? 'text-green-600' : 'text-red-600'}`}>
                         {option.priceAdjustment > 0 ? '+' : '-'}${Math.abs(option.priceAdjustment).toFixed(2)}
                       </span>
                     )}
                   </Label>
                 </div>

                    ))}
                  </RadioGroup>
                </div>
              ))}
            </div>
          )}

          <div className="mb-6">
            <Label htmlFor="quantity">Quantity</Label>
            <input
              type="number"
              id="quantity"
              name="quantity"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="mt-1 block w-20 rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
            />
          </div>

          <div className="flex gap-4">
            <Button size="lg" onClick={handleAddToCart}>Add to Cart</Button>
            <Button size="lg" variant="outline">Add to Wishlist</Button>
          </div>
        </div>
      </div>

      {/* User Reviews Section */}
      <UserReviews />

      {/* Recommended Products Section */}
      <RecommendedProducts products={recommendedProducts} />

      <Modal isOpen={isModalOpen} onClose={handleCloseModal}>
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-4">Item Added to Cart</h2>
          <p className="mb-4">
            {quantity} x {product.name} has been added to your cart.
          </p>
          {Object.entries(selectedVariants).map(([variantName, option]) => (
            <p key={variantName} className="mb-2">
              {variantName}: {option.value}
            </p>
          ))}
          <div className="flex justify-end gap-4">
            <Button variant="outline" onClick={handleCloseModal}>
              Continue Shopping
            </Button>
            <Button onClick={handleViewCart}>View Cart</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}