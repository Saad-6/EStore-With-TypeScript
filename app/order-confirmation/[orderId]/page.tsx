"use client"

import { useEffect, useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { PackageIcon, TruckIcon, CheckCircleIcon, ChevronDownIcon } from "lucide-react"
import { useParams } from "next/navigation"
import confetti from "canvas-confetti"
import type { Product, VariantOption } from "@/interfaces/product-interfaces"

interface CartItems {
  product: Product
  quantity: number
  subTotal: number
  selectedVariantsDisplay?: Record<string, VariantOption>
}

interface OrderDetails {
  id: string
  total: number
  status: number
  created: string
  cartItems: CartItems[]
}

const statusMap: { [key: number]: { label: string; color: string } } = {
  0: { label: "Pending", color: "bg-yellow-500 text-white" },
  1: { label: "Confirmed", color: "bg-blue-500 text-white" },
  2: { label: "Shipped", color: "bg-indigo-500 text-white" },
  3: { label: "Delivered", color: "bg-green-500 text-white" },
  4: { label: "Cancelled", color: "bg-red-500 text-white" },
  5: { label: "Cancelled", color: "bg-red-500 text-white" },
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId as string
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`https://localhost:7007/api/Order/${orderId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }
        const data = await response.json()
        if (Array.isArray(data)) {
          if (data.length > 0) {
            // Take the first element if you expect a single order
            setOrderDetails(data[0]);
          } else {
            // Handle the case where the array is empty (e.g., no order found)
            console.warn("No order found.");
            setOrderDetails(null); // or some default value
          }
        } else {
          // If it's not an array, assume it's a single object
          setOrderDetails(data);
        }
      } catch (error) {
        console.error("Error fetching order details:", error)
      }
    }

    fetchOrderDetails()

    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [orderId])

  const getStatusIcon = (status: number) => {
    switch (status) {
      case 0:
      case 1:
        return <PackageIcon className="w-6 h-6 text-yellow-500" />
      case 2:
        return <TruckIcon className="w-6 h-6 text-blue-500" />
      case 3:
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />
      default:
        return <PackageIcon className="w-6 h-6 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 via-background to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Order Confirmed!</h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Thank you for your purchase! Your order is on its way to becoming reality.
        </p>
      </motion.div>

      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="bg-card text-card-foreground rounded-lg shadow-lg p-8 mb-8 w-full max-w-md"
      >
        <h2 className="text-2xl font-semibold mb-4">Order Details</h2>
        {orderDetails ? (
          <>
            <p className="mb-2">
              <span className="font-medium">Order ID:</span> {orderDetails.id}
            </p>
            <p className="mb-2">
              <span className="font-medium">Total:</span> ${orderDetails.total.toFixed(2)}
            </p>
            <p className="mb-2">
              <span className="font-medium">Date:</span> {new Date(orderDetails.created).toLocaleDateString()}
            </p>
            <div className="flex items-center mt-4">
              <span className="font-medium mr-2">Status:</span>
              {getStatusIcon(orderDetails.status)}
              <span className={`ml-2 px-2 py-1 rounded-full text-sm ${statusMap[orderDetails.status].color}`}>
                {statusMap[orderDetails.status].label}
              </span>
            </div>
            <div className="mt-6">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center justify-between w-full text-left text-primary hover:text-primary-dark transition-colors"
              >
                <span className="font-medium">Show Order Details</span>
                <ChevronDownIcon
                  className={`w-5 h-5 transition-transform ${showDetails ? "transform rotate-180" : ""}`}
                />
              </button>
              <AnimatePresence>
                {showDetails && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="mt-4 space-y-4"
                  >
                    {orderDetails.cartItems.map((item, index) => (
                      <div key={index} className="border-t pt-4">
                        <p className="font-medium">{item.product.name}</p>
                        <p>Quantity: {item.quantity}</p>
                        <p>Subtotal: ${item.subTotal.toFixed(2)}</p>
                        {item.selectedVariantsDisplay && (
                          <div className="mt-2">
                            <p className="font-medium">Selected Options:</p>
                            {Object.entries(item.selectedVariantsDisplay).map(([key, value]) => (
                              <p key={key}>
                                {key}: {value.value}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </>
        ) : (
          <p>Loading order details...</p>
        )}
      </motion.div>

      <motion.div
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
        className="relative mb-8"
      >
        <PackageIcon className="w-24 h-24 md:w-32 md:h-32 text-primary" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
          className="absolute inset-0 bg-primary/20 rounded-full -z-10"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="text-center max-w-md"
      >
        <p className="text-lg md:text-xl mb-4">
          We're excited to bring your order to life! Keep an eye on your email for updates on your package's journey.
        </p>
        <p className="text-muted-foreground">
          If you have any questions, our customer support team is always here to help.
        </p>
      </motion.div>
    </div>
  )
}

