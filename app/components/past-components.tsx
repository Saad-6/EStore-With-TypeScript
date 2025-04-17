"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { format } from "date-fns"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { ShoppingBag, ChevronRight } from "lucide-react"
import { useAuth } from "../lib/auth"
import { CustomBadge } from "./custom-badge"


const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7007/api"

interface SelectedVariant {
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
    city: string
  }
  cartItems: CartItem[]
  user: {
    id: string
    userName: string
  }
}

export default function PastOrders() {
  const [orders, setOrders] = useState<Order[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) return

      setIsLoading(true)
      setError(null)

      try {
        const token = localStorage.getItem("token")
        const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null
        const userId = decodedToken?.userId

        if (!userId) {
          throw new Error("User ID not found")
        }

        const response = await fetch(`${API_BASE_URL}/Order/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Failed to fetch orders")
        }

        const data = await response.json()
        setOrders(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred while fetching orders")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [isAuthenticated])

  const handleOrderClick = (order: Order) => {
    router.push(`/order/${order.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (error) {
    return <div className="text-center text-red-500 p-4 bg-red-100 dark:bg-red-900 rounded-lg">{error}</div>
  }

  if (orders.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-600" />
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No orders</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">You haven't placed any orders yet.</p>
        <div className="mt-6">
          <Button onClick={() => router.push("/products")}>Start Shopping</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="text-left border-b dark:border-gray-700">
            <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Order ID</th>
            <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Date</th>
            <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Total</th>
            <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Status</th>
            <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Items</th>
            <th className="py-2 px-4 text-gray-800 dark:text-gray-200">Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order, index) => (
            <motion.tr
              key={order.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
              onClick={() => handleOrderClick(order)}
            >
              <td className="py-4 px-4 text-gray-800 dark:text-gray-200">#{order.id}</td>
              <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                {format(new Date(order.created), "MMM d, yyyy")}
              </td>
              <td className="py-4 px-4 text-gray-800 dark:text-gray-200">${order.total.toFixed(2)}</td>
              <td className="py-4 px-4">
                <CustomBadge status={order.status} />
              </td>
              <td className="py-4 px-4">
                {order.cartItems.map((item, i) => (
                  <div key={i} className="text-sm text-gray-600 dark:text-gray-400">
                    {item.product.name} x{item.quantity}
                  </div>
                ))}
              </td>
              <td className="py-4 px-4">
                <Button variant="ghost" size="sm" className="flex items-center text-gray-800 dark:text-gray-200">
                  View <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

