"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useParams, useRouter } from "next/navigation"
import { StarIcon, PlusIcon, MinusIcon } from "@heroicons/react/20/solid"
import type { Product, VariantOption, ProductImage } from "@/interfaces/product-interfaces"
import toast from "react-hot-toast"

import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { AnimatePresence, motion } from "framer-motion"
import { Button } from "../components/ui/button"
import UserReviews from "../components/user-review"
import RecommendedProducts from "../components/recommended-products"
import { Modal } from "../components/ui/cart-modal"


export default function ProductDetails() {
  const params = useParams()
  const router = useRouter()
  const productSlug = params.slug as string
  const [product, setProduct] = useState<Product | null>(null)
  const [avgReview, setAvgReview] = useState<number>(0)
  const [totalReviews, setTotalReviews] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [quantity, setQuantity] = useState(1)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [isHovering, setIsHovering] = useState(false)
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([])
  const [selectedVariants, setSelectedVariants] = useState<Record<number, number>>({})
  const [currentPrice, setCurrentPrice] = useState(0)
  const [currentImages, setCurrentImages] = useState<ProductImage[]>([])

  useEffect(() => {
    const fetchProductAndRecommendations = async () => {
      setIsLoading(true)
      try {
        const [productResponse, recommendationsResponse] = await Promise.all([
          fetch(`https://localhost:7007/api/Product/${productSlug}`),
          fetch(`https://localhost:7007/api/Product/recommendations/${productSlug}`),
        ])

        if (!productResponse.ok || !recommendationsResponse.ok) {
          throw new Error("Failed to fetch product or recommendations")
        }

        const productData: Product = await productResponse.json()
        const recommendationsData: Product[] = await recommendationsResponse.json()

        setProduct(productData)
        setRecommendedProducts(recommendationsData)
        setCurrentPrice(productData.price)
        setCurrentImages([productData.primaryImage, ...productData.images])

        if (productData.reviews && productData.reviews.length > 0) {
          setTotalReviews(productData.reviews.length)
          const avgRating =
            productData.reviews.reduce((sum, review) => sum + review.stars, 0) / productData.reviews.length
          setAvgReview(Number(avgRating.toFixed(1)))
        } else {
          setTotalReviews(0)
          setAvgReview(0)
        }

        if (productData.variants) {
          const initialSelectedVariants: Record<number, number> = {}
          productData.variants.forEach((variant) => {
            if (variant.options.length > 0) {
              initialSelectedVariants[variant.id] = variant.options[0].id
            }
          })
          setSelectedVariants(initialSelectedVariants)
        }
      } catch (error) {
        console.error("Error fetching product or recommendations:", error)
        toast.error("Failed to load product details or recommendations")
      } finally {
        setIsLoading(false)
      }
    }

    fetchProductAndRecommendations()
  }, [productSlug])

  const handleVariantChange = (variantId: number, optionId: number) => {
    const variant = product?.variants.find((v) => v.id === variantId)
    const option = variant?.options.find((o) => o.id === optionId)
    if (option) {
      setSelectedVariants((prev) => ({
        ...prev,
        [variantId]: optionId,
      }))
      updatePrice(variantId, option)

      if (option.optionImages && option.optionImages.length > 0) {
        setCurrentImages([option.optionImages[0], ...option.optionImages.slice(1)])
        setActiveImageIndex(0)
      } else {
        setCurrentImages([product!.primaryImage, ...product!.images])
        setActiveImageIndex(0)
      }
    }
  }

  const updatePrice = (variantId: number, newOption: VariantOption) => {
    if (!product) return

    let newPrice = product.price
    Object.entries(selectedVariants).forEach(([id, optionId]) => {
      if (Number(id) !== variantId) {
        const variant = product.variants.find((v) => v.id === Number(id))
        const option = variant?.options.find((o) => o.id === optionId)
        if (option) {
          newPrice += option.priceAdjustment
        }
      }
    })
    newPrice += newOption.priceAdjustment
    setCurrentPrice(newPrice)
  }

  const handleAddToCart = () => {
    setIsModalOpen(true)
  }

  const handleQuantityChange = (newQuantity: number) => {
    setQuantity(Math.max(1, newQuantity))
  }

  const confirmAddToCart = () => {
    if (!product) return

    const cart = JSON.parse(localStorage.getItem("cart") || "[]")
    const cartItem = {
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentPrice,
      image: currentImages[0].url,
      quantity: quantity,
      selectedVariants: selectedVariants,
    }

    const existingItemIndex = cart.findIndex(
      (item: any) =>
        item.productId === product.id && JSON.stringify(item.selectedVariants) === JSON.stringify(selectedVariants),
    )

    if (existingItemIndex !== -1) {
      cart[existingItemIndex].quantity += quantity
      cart[existingItemIndex].price = currentPrice
    } else {
      cart.push(cartItem)
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    setIsModalOpen(false)
    toast.success("Item added to cart")
  }

  const handleBuyNow = () => {
    confirmAddToCart()
    router.push("/cart")
  }

  const handleMouseEnter = () => {
    setIsHovering(true)
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
  }

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (!product) {
    return <div className="container mx-auto px-4 py-8">Product not found</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <div className="w-full lg:w-2/3 flex flex-col items-center">
          <div
            className="relative w-full max-w-2xl aspect-square mb-4"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={isHovering ? "hover" : "default"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute inset-0"
              >
                {currentImages.length > 0 && (
                  <Image
                    src={
                      isHovering && currentImages.length > 1
                        ? currentImages[1].url
                        : currentImages[activeImageIndex].url
                    }
                    alt={
                      isHovering && currentImages.length > 1
                        ? currentImages[1].altText
                        : currentImages[activeImageIndex].altText
                    }
                    fill
                    className="rounded-lg object-cover"
                  />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
          {currentImages.length > 1 && (
            <div className="flex space-x-2 mt-4">
              {currentImages.slice(0, 3).map((image, index) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 ${
                    index === activeImageIndex ? "border-blue-500" : "border-transparent"
                  }`}
                >
                  <Image
                    src={image.url || "/placeholder.svg"}
                    alt={image.altText}
                    width={64}
                    height={64}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="w-full lg:w-1/3">
          <h1 className="text-3xl font-bold mb-4">{product?.name}</h1>
          <p className="text-2xl font-semibold mb-4">${currentPrice.toFixed(2)}</p>

          <div className="flex items-center mb-4">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <StarIcon
                  key={i}
                  className={`h-5 w-5 ${i < Math.floor(avgReview) ? "text-yellow-400" : "text-gray-300"}`}
                />
              ))}
            </div>
            <span className="ml-2 text-gray-600">
              {totalReviews > 0 ? `${avgReview} (${totalReviews} reviews)` : "No reviews yet"}
            </span>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-6 space-y-4">
              {product.variants.map((variant) => (
                <div key={variant.id}>
                  <Label htmlFor={`variant-${variant.id}`} className="text-lg font-semibold">
                    {variant.name}
                  </Label>
                  {variant.displayType === "dropdown" ? (
                    <Select
                      value={selectedVariants[variant.id]?.toString() || ""}
                      onValueChange={(value) => handleVariantChange(variant.id, Number(value))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={`Select ${variant.name}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {variant?.options
                          .filter((option) => option?.value)
                          .map((option) => (
                            <SelectItem key={option?.id} value={option?.id.toString()}>
                              {option?.value}
                              {option?.priceAdjustment !== 0 && (
                                <span
                                  className={`ml-2 ${option?.priceAdjustment > 0 ? "text-green-600" : "text-red-600"}`}
                                >
                                  {option?.priceAdjustment > 0 ? "+" : "-"}$
                                  {Math.abs(option?.priceAdjustment).toFixed(2)}
                                </span>
                              )}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {variant?.options.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handleVariantChange(variant.id, option.id)}
                          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors
                            ${
                              selectedVariants[variant.id] === option.id
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                            }`}
                        >
                          {option.value}
                          {option.priceAdjustment !== 0 && (
                            <span className={`ml-2 ${option.priceAdjustment > 0 ? "text-green-200" : "text-red-200"}`}>
                              {option.priceAdjustment > 0 ? "+" : "-"}${Math.abs(option.priceAdjustment).toFixed(2)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="mb-6">
            <Label htmlFor="quantity" className="text-lg font-semibold">
              Quantity
            </Label>
            <div className="flex items-center mt-2">
              <button
                onClick={() => handleQuantityChange(quantity - 1)}
                className="bg-gray-200 text-gray-600 hover:bg-gray-300 h-8 w-8 rounded-l-md flex items-center justify-center"
              >
                <MinusIcon className="h-4 w-4" />
              </button>
              <input
                type="text"
                id="quantity"
                name="quantity"
                value={quantity}
                onChange={(e) => handleQuantityChange(Number.parseInt(e.target.value) || 1)}
                className="h-8 w-16 text-center border-t border-b border-gray-300 dark:text-black"
                style={{ appearance: "textfield" }}
              />
              <button
                onClick={() => handleQuantityChange(quantity + 1)}
                className="bg-gray-200 text-gray-600 hover:bg-gray-300 h-8 w-8 rounded-r-md flex items-center justify-center"
              >
                <PlusIcon className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex gap-4">
            <Button size="lg" onClick={handleAddToCart} className="flex-1">
              Add to Cart
            </Button>
            <Button size="lg" variant="secondary" onClick={handleBuyNow} className="flex-1">
              Buy Now
            </Button>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Product Details</h2>
        <p className="text-gray-600">{product?.description}</p>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Customer Reviews</h2>
        <UserReviews reviews={product?.reviews || []} />
      </div>

      <div className="mt-12">
        <RecommendedProducts products={recommendedProducts} />
      </div>

      {product && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          product={product}
          quantity={quantity}
          selectedVariants={selectedVariants}
          onQuantityChange={handleQuantityChange}
          onVariantChange={handleVariantChange}
          onConfirm={confirmAddToCart}
        />
      )}
    </div>
  )
}

