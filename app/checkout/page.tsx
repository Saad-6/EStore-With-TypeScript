"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { CreditCardIcon, TruckIcon, ShieldCheckIcon } from "@heroicons/react/24/outline"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import { Input } from "@/app/components/ui/input"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import LoginModal from "@/app/components/LoginModal"
import { useAuth } from "../lib/auth"

const API_BASE_URL = 'https://localhost:7007/api'


interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  selectedVariants: Record<number, number>
}

interface Address {
  firstName: string
  lastName: string
  streetAddress: string
  city: string
  zipCode: string
  phoneNumber: string
}

export default function CheckoutPage() {
  const router = useRouter()
  const { isAuthenticated, checkAuthStatus } = useAuth()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [address, setAddress] = useState<Address>({
    firstName: "",
    lastName: "",
    streetAddress: "",
    city: "",
    zipCode: "",
    phoneNumber: "",
  })
  const [cardInfo, setCardInfo] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem("cart") || "[]")
    setCartItems(storedCart)
    checkAuthStatus()

    // Redirect to cart page if cart is empty
    if (storedCart.length === 0) {
      router.push("/cart")
    }
  }, [checkAuthStatus, router])

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = 10
  const total = subtotal + shipping

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({ ...address, [e.target.id]: e.target.value })
  }

  const handleCardInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCardInfo({ ...cardInfo, [e.target.id]: e.target.value })
  }

  const validateForm = () => {
    const requiredFields = ["firstName", "lastName", "streetAddress", "city", "zipCode", "phoneNumber"]
    for (const field of requiredFields) {
      if (!address[field as keyof Address]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
        return false
      }
    }

    if (paymentMethod === "credit-card") {
      const cardFields = ["cardNumber", "expiryDate", "cvv"]
      for (const field of cardFields) {
        if (!cardInfo[field as keyof typeof cardInfo]) {
          toast.error(`Please fill in the ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`)
          return false
        }
      }
    }

    return true
  }

  const handlePlaceOrder = async () => {
    if (!validateForm()) return

    if (!isAuthenticated) {
      setShowLoginModal(true)
      return
    }

    await placeOrder()
  }

  const placeOrder = async () => {
    setIsLoading(true)

    try {
      const token = localStorage.getItem("token")
      const decodedToken: { userId: string } = token ? JSON.parse(atob(token.split(".")[1])) : { userId: null }

      const orderData = {
        CartItems: cartItems.map((item) => ({
          ProductId: item.productId,
          Name: item.name,
          Price: item.price,
          Quantity: item.quantity,
          SelectedVariants: item.selectedVariants,
        })),
        Address: {
          FirstName: address.firstName,
          LastName: address.lastName,
          StreetAddress: address.streetAddress,
          City: address.city,
          ZipCode: address.zipCode,
          PhoneNumber: address.phoneNumber,
        },
        PaymentMethod: paymentMethod,
        Total: total,
        UserId: decodedToken.userId,
      }


      const response = await fetch(`${API_BASE_URL}/Order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        const errorData = await response.text()
        console.error("Server error:", errorData)
        toast.error(errorData)
        throw new Error(errorData)
      }

      const data = await response.json()
      console.log("Order placed successfully:", data)
      toast.success("Order placed successfully!")
      localStorage.removeItem("cart")
      router.push(`/order-confirmation/${data.id}`)
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinueWithoutLogin = () => {
    setShowLoginModal(false)
    placeOrder()
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 dark:text-white">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Shipping Information</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName" className="dark:text-white">
                  First Name
                </Label>
                <Input
                  id="firstName"
                  value={address.firstName}
                  onChange={handleAddressChange}
                  placeholder="John"
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="lastName" className="dark:text-white">
                  Last Name
                </Label>
                <Input
                  id="lastName"
                  value={address.lastName}
                  onChange={handleAddressChange}
                  placeholder="Doe"
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="streetAddress" className="dark:text-white">
                Address
              </Label>
              <Input
                id="streetAddress"
                value={address.streetAddress}
                onChange={handleAddressChange}
                placeholder="123 Main St"
                required
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city" className="dark:text-white">
                  City
                </Label>
                <Input
                  id="city"
                  value={address.city}
                  onChange={handleAddressChange}
                  placeholder="New York"
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div>
                <Label htmlFor="zipCode" className="dark:text-white">
                  ZIP Code
                </Label>
                <Input
                  id="zipCode"
                  value={address.zipCode}
                  onChange={handleAddressChange}
                  placeholder="10001"
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="phoneNumber" className="dark:text-white">
                Phone Number
              </Label>
              <Input
                id="phoneNumber"
                value={address.phoneNumber}
                onChange={handleAddressChange}
                placeholder="0300..."
                required
                className="dark:bg-gray-700 dark:text-white"
              />
            </div>
          </form>

          <h2 className="text-2xl font-semibold mt-8 mb-4 dark:text-white">Payment Method</h2>

          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="credit-card" id="credit-card" />
              <Label htmlFor="credit-card" className="dark:text-white">
                Credit Card
              </Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal" className="dark:text-white">
                PayPal
              </Label>
            </div>
          </RadioGroup>

          {paymentMethod === "credit-card" && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 space-y-4"
            >
              <div>
                <Label htmlFor="cardNumber" className="dark:text-white">
                  Card Number
                </Label>
                <Input
                  id="cardNumber"
                  value={cardInfo.cardNumber}
                  onChange={handleCardInfoChange}
                  placeholder="1234 5678 9012 3456"
                  required
                  className="dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate" className="dark:text-white">
                    Expiry Date
                  </Label>
                  <Input
                    id="expiryDate"
                    value={cardInfo.expiryDate}
                    onChange={handleCardInfoChange}
                    placeholder="MM/YY"
                    required
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="cvv" className="dark:text-white">
                    CVV
                  </Label>
                  <Input
                    id="cvv"
                    value={cardInfo.cvv}
                    onChange={handleCardInfoChange}
                    placeholder="123"
                    required
                    className="dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.5 }}>
          <h2 className="text-2xl font-semibold mb-4 dark:text-white">Order Summary</h2>
          <div className="bg-gray-100 dark:bg-gray-800 p-6 rounded-lg">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between mb-2">
                <span className="dark:text-white">
                  {item.name} x{item.quantity}
                </span>
                <span className="dark:text-white">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-300 dark:border-gray-600 my-4"></div>
            <div className="flex justify-between mb-2">
              <span className="dark:text-white">Subtotal</span>
              <span className="dark:text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span className="dark:text-white">Shipping</span>
              <span className="dark:text-white">${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mt-4">
              <span className="dark:text-white">Total</span>
              <span className="dark:text-white">${total.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full mt-8" size="lg" onClick={handlePlaceOrder} disabled={isLoading}>
            {isLoading ? "Processing..." : "Place Order"}
          </Button>

          <div className="mt-8 space-y-4">
            <div className="flex items-center">
              <TruckIcon className="w-6 h-6 mr-2 text-green-500" />
              <span className="dark:text-white">Free shipping on orders over $100</span>
            </div>

            <div className="flex items-center">
              <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-500" />
              <span className="dark:text-white">Secure payment processing</span>
            </div>
            <div className="flex items-center">
              <CreditCardIcon className="w-6 h-6 mr-2 text-purple-500" />
              <span className="dark:text-white">We accept all major credit cards</span>
            </div>
          </div>
        </motion.div>
      </div>
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onContinueWithoutLogin={handleContinueWithoutLogin}
      />
    </div>
  )
}

