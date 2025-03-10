"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { ArrowLeft, Package, Truck, CheckCircle, Star, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "react-hot-toast"
import { CustomBadge } from "@/app/components/custom-badge"


const API_BASE_URL = "https://localhost:7007/api"

interface OrderDetailsProps {
  params: { id: string }
}

export interface SelectedVariant {
  id: number
  variantName: string
  optionValue: string
  priceAdjustment: number
}

interface CartItem {
  id: number
  quantity: number
  subTotal: number
  product: {
    id: number
    name: string
    price: number
    sku: string
  }
  selectedVariants: SelectedVariant[]
}

interface Order {
  id: string
  total: number
  created: string
  status: number
  address: {
    firstName: string
    lastName: string
    streetAddress: string
    city: string
    state: string
    zipCode: string
  }
  cartItems: CartItem[]
  user: {
    id: string
    userName: string
  }
}

export default function OrderDetails({ params }: OrderDetailsProps) {
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [reviewText, setReviewText] = useState("")
  const [rating, setRating] = useState(0)
  const [reviewProductId, setReviewProductId] = useState<number | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")
        const response = await fetch(`${API_BASE_URL}/Order/${params.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }

        const data = await response.json()
        if (Array.isArray(data)) {
          console.log("Is array")
          if (data.length > 0) {
            console.log("array greater than 0")
            // Take the first element if you expect a single order
            setOrder(data[0]);
          } else {
            // Handle the case where the array is empty (e.g., no order found)
            console.warn("No order found.");
            setOrder(null); // or some default value
          }
        } else {
          console.log("Not array")
          // If it's not an array, assume it's a single object
          setOrder(data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [params.id])

  const handleReviewSubmit = async () => {
    if (!reviewProductId) return

    try {
      const token = localStorage.getItem("token")
      const userId = order?.user.id

      const reviewData = {
        Stars: rating,
        UserId: userId,
        Comment: reviewText,
      }

      if (reviewData) {
        console.log(reviewData)
      }
      const response = await fetch(`https://localhost:7007/api/Product/Review/${reviewProductId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(reviewData),
      })

      if (!response.ok) {
        var res = await response.json()
        toast.error(res.error)
        return
      }

      toast.success("Review submitted successfully!")
      setShowReviewModal(false)
      setReviewText("")
      setRating(0)
      setReviewProductId(null)
    } catch (error) {
      toast.error("Failed to submit review. Please try again.")
    }
  }

  const statusSteps = [
    { icon: Package, label: "Order Placed", value: 0 },
    { icon: Truck, label: "Shipped", value: 2 },
    { icon: CheckCircle, label: "Delivered", value: 3 },
  ]

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500 p-4 bg-red-100 dark:bg-red-900 rounded-lg">
          {error || "Failed to load order details"}
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to Orders
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
      >
        <section className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold dark:text-white">Order #{order.id}</h1>
            <CustomBadge status={order.status} className="text-lg" />
          </div>
          <div className="flex justify-between items-center">
            {statusSteps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`rounded-full p-2 ${
                    order.status >= step.value
                      ? "bg-primary text-primary-foreground"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-400"
                  }`}
                >
                  <step.icon className="h-6 w-6" />
                </div>
                <span className="mt-2 text-sm dark:text-gray-300">{step.label}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Details</h2>
            <p className="dark:text-gray-300">
              <strong>Date:</strong> {format(new Date(order.created), "MMMM d, yyyy")}
            </p>
            <p className="dark:text-gray-300">
              <strong>Total:</strong> ${order.total.toFixed(2)}
            </p>
            <p className="dark:text-gray-300">
              <strong>Status:</strong> <CustomBadge status={order.status} />
            </p>
          </div>
          <div>
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Shipping Address</h2>
            <p className="dark:text-gray-300">
              {order.address.firstName} {order.address.lastName}
            </p>
            <p className="dark:text-gray-300">{order.address.streetAddress}</p>
            <p className="dark:text-gray-300">
              {order.address.city}, {order.address.state} {order.address.zipCode}
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">Order Items</h2>
          <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
            {order.cartItems.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2 border-b last:border-b-0 dark:border-gray-600"
              >
                <div>
                  <span className="font-semibold dark:text-white">{item.product.name}</span> (x{item.quantity})
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    {item.selectedVariants.map((variant, index) => (
                      <span key={variant.id}>
                        {index > 0 && ", "}
                        {variant.variantName}: {variant.optionValue}
                      </span>
                    ))}
                  </div>
                </div>
                <span className="dark:text-white">${item.subTotal.toFixed(2)}</span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-4 font-semibold dark:text-white">
              <span>Total</span>
              <span>${order.total.toFixed(2)}</span>
            </div>
          </div>
        </section>

        {order.status === 3 && (
          <section className="mt-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Product Reviews</h2>
            {order.cartItems.map((item) => (
              <div key={item.id} className="mb-4">
                <Button
                  onClick={() => {
                    setReviewProductId(item.product.id)
                    setShowReviewModal(true)
                  }}
                >
                  Review {item.product.name}
                </Button>
              </div>
            ))}
          </section>
        )}
      </motion.div>

      <AnimatePresence>
        {showReviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-semibold dark:text-white">Leave a Review</h3>
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              <p className="mb-4 text-gray-600 dark:text-gray-300">
                Share your thoughts about the product and your overall experience.
              </p>
              <div className="flex justify-center space-x-2 mb-6">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-10 w-10 cursor-pointer transition-colors duration-200 ${
                      star <= rating ? "text-yellow-400 fill-current" : "text-gray-300 dark:text-gray-600"
                    }`}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
              <Textarea
                placeholder="Write your review here..."
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                className="mb-4 w-full dark:bg-gray-700 dark:text-white"
                rows={4}
              />
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </Button>
                <Button onClick={handleReviewSubmit}>Submit Review</Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

