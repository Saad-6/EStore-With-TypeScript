"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { TrashIcon, ShoppingCartIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/outline"
import { Button } from "@/components/ui/button"
import { toast } from "react-hot-toast"
import { motion } from "framer-motion"
import type { VariantOption } from "@/interfaces/product-interfaces"

interface CartItem {
  productId: number
  name: string
  slug: string
  price: number
  image: string
  quantity: number
  selectedVariants?: Record<number, number>
  selectedVariantsDisplay?: Record<string, VariantOption>
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const router = useRouter()

  useEffect(() => {
    try {
      const storedCart = JSON.parse(localStorage.getItem("cart") || "[]")
      setCartItems(storedCart)
    } catch (error) {
      console.error("Error parsing cart data:", error)
      setCartItems([])
    }
  }, [])

  const updateCart = (newCart: CartItem[]) => {
    setCartItems(newCart)
    try {
      localStorage.setItem("cart", JSON.stringify(newCart))
    } catch (error) {
      console.error("Error updating cart in localStorage:", error)
    }
  }

  const removeItem = (index: number) => {
    const newCart = [...cartItems]
    newCart.splice(index, 1)
    updateCart(newCart)
    toast.success("Item removed from cart")
  }

  const updateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return
    const newCart = [...cartItems]
    newCart[index].quantity = newQuantity
    updateCart(newCart)
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 0), 0)
  const shipping = 10 // You can adjust this or make it dynamic
  const total = subtotal + shipping

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Your Cart</h1>
      {cartItems.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center py-16"
        >
          <ShoppingCartIcon className="mx-auto h-24 w-24 text-gray-400 dark:text-gray-600 mb-4" />
          <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">Your cart is empty</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button
            onClick={() => router.push("/")}
            className="bg-primary hover:bg-primary-dark text-white dark:text-gray-900 font-bold py-2 px-4 rounded transition duration-300"
          >
            Start Shopping
          </Button>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
          {cartItems.map((item, index) => (
            <motion.div
              key={`${item.productId}-${JSON.stringify(item.selectedVariants)}`}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="flex items-center border-b border-gray-200 dark:border-gray-700 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg mb-4 transition duration-300"
            >
              <Image
                src={item.image || "/placeholder.svg"}
                alt={item.name || "Product"}
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
              <div className="ml-6 flex-grow">
                <h2 className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  {item.name || "Unnamed Product"}
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {item.selectedVariantsDisplay &&
                    Object.entries(item.selectedVariantsDisplay).map(([variantName, option]) => (
                      <span key={variantName} className="mr-2">
                        {variantName}: {option.value}
                        {option.priceAdjustment !== 0 && (
                          <span className={option.priceAdjustment > 0 ? "text-green-600" : "text-red-600"}>
                            {" "}
                            ({option.priceAdjustment > 0 ? "+" : "-"}${Math.abs(option.priceAdjustment).toFixed(2)})
                          </span>
                        )}
                      </span>
                    ))}
                </p>
                <div className="flex items-center mt-3">
                  <button
                    onClick={() => updateQuantity(index, (item.quantity || 1) - 1)}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded-l transition duration-300"
                  >
                    <MinusIcon className="h-4 w-4" />
                  </button>
                  <span className="bg-gray-100 dark:bg-gray-800 px-4 py-1 font-medium text-gray-800 dark:text-gray-200">
                    {item.quantity || 1}
                  </span>
                  <button
                    onClick={() => updateQuantity(index, (item.quantity || 1) + 1)}
                    className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 hover:text-gray-700 dark:hover:text-gray-200 px-2 py-1 rounded-r transition duration-300"
                  >
                    <PlusIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="text-right">
                <p className="font-semibold text-lg text-gray-800 dark:text-gray-200">
                  ${((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                </p>
                <button
                  onClick={() => removeItem(index)}
                  className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 mt-2 transition duration-300"
                >
                  <TrashIcon className="h-5 w-5" />
                </button>
              </div>
            </motion.div>
          ))}
          <div className="mt-8 bg-gray-50 dark:bg-gray-800 p-6 rounded-lg shadow-sm">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Subtotal</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="text-gray-600 dark:text-gray-400">Shipping</span>
              <span className="font-medium text-gray-800 dark:text-gray-200">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <span className="text-gray-800 dark:text-gray-200">Total</span>
              <span className="text-gray-800 dark:text-gray-200">${total.toFixed(2)}</span>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              className="w-full mt-8 bg-primary hover:bg-primary-dark text-white dark:text-gray-600 font-bold py-3 px-4 rounded transition duration-300"
              onClick={() => router.push("/checkout")}
            >
              Proceed to Checkout
            </Button>
          </motion.div>
        </motion.div>
      )}
    </div>
  )
}

