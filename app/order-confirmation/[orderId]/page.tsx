"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { PackageIcon, TruckIcon, CheckCircleIcon } from "lucide-react"
import { useParams } from "next/navigation"
import confetti from "canvas-confetti"

interface OrderDetails {
  id: string
  total: number
  status: string
  created: string
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)

  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        const response = await fetch(`https://localhost:7007/api/Order/${orderId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch order details")
        }
        const data = await response.json()
        setOrderDetails(data)
      } catch (error) {
        console.error("Error fetching order details:", error)
      }
    }

    fetchOrderDetails()

    // Trigger confetti effect
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })
  }, [orderId])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Pending":
        return <PackageIcon className="w-8 h-8 text-yellow-500" />
      case "Shipped":
        return <TruckIcon className="w-8 h-8 text-blue-500" />
      case "Delivered":
        return <CheckCircleIcon className="w-8 h-8 text-green-500" />
      default:
        return <PackageIcon className="w-8 h-8 text-gray-500" />
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
              <span className="ml-2">{orderDetails.status}</span>
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

