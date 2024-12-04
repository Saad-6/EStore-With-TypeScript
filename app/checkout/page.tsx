'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { CreditCardIcon, TruckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline'
import { Label } from '@/components/ui/label'

import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { Input } from '../components/ui/input'
import { Button } from '../components/ui/button'
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group'

interface CartItem {
  productId: number
  name: string
  price: number
  quantity: number
  selectedVariants: Record<string, { value: string; priceAdjustment: number }>
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
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [paymentMethod, setPaymentMethod] = useState('credit-card')
  const [address, setAddress] = useState<Address>({
    firstName: '',
    lastName: '',
    streetAddress: '',
    city: '',
    zipCode: '',
    phoneNumber: ''
  })
  const [cardInfo, setCardInfo] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const storedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    console.log("cart in checkout : ",storedCart);
    setCartItems(storedCart)

    const storedUserId = localStorage.getItem('userId')
    setUserId(storedUserId)
  }, [])

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
    const requiredFields = ['firstName', 'lastName', 'streetAddress', 'city', 'zipCode', 'phoneNumber']
    for (const field of requiredFields) {
      if (!address[field as keyof Address]) {
        toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
        return false
      }
    }

    if (paymentMethod === 'credit-card') {
      const cardFields = ['cardNumber', 'expiryDate', 'cvv']
      for (const field of cardFields) {
        if (!cardInfo[field as keyof typeof cardInfo]) {
          toast.error(`Please fill in the ${field.replace(/([A-Z])/g, ' $1').toLowerCase()}`)
          return false
        }
      }
    }

    return true
  }

  const handlePlaceOrder = async () => {
    console.log("Inside handle ",validateForm())
    if (!validateForm()) return

    setIsLoading(true)

    try {
      const response = await fetch('https://localhost:7007/api/Order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems,
          address,
          paymentMethod,
          total,
          userId
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to place order')
      }

      const data = await response.json()
      console.log(data)
      toast.success('Order placed successfully!')
      localStorage.removeItem('cart')
      router.push(`/order-confirmation/${data.id}`)
    } catch (error) {
      console.error('Error placing order:', error)
      toast.error('Failed to place order. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Shipping Information</h2>
          <form className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={address.firstName} onChange={handleAddressChange} placeholder="John" required />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={address.lastName} onChange={handleAddressChange} placeholder="Doe" required />
              </div>
            </div>
            <div>
              <Label htmlFor="streetAddress">Address</Label>
              <Input id="streetAddress" value={address.streetAddress} onChange={handleAddressChange} placeholder="123 Main St" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input id="city" value={address.city} onChange={handleAddressChange} placeholder="New York" required />
              </div>
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input id="zipCode" value={address.zipCode} onChange={handleAddressChange} placeholder="10001" required />
              </div>
            </div>
            <div>
              <Label htmlFor="country">Phone Number</Label>
              <Input id="phoneNumber" value={address.phoneNumber} onChange={handleAddressChange} placeholder="0300..." required />
            </div>
          </form>

          <h2 className="text-2xl font-semibold mt-8 mb-4">Payment Method</h2>
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="credit-card" id="credit-card" />
              <Label htmlFor="credit-card">Credit Card</Label>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <RadioGroupItem value="paypal" id="paypal" />
              <Label htmlFor="paypal">PayPal</Label>
            </div>
          </RadioGroup>

          {paymentMethod === 'credit-card' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-4 space-y-4"
            >
              <div>
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input id="cardNumber" value={cardInfo.cardNumber} onChange={handleCardInfoChange} placeholder="1234 5678 9012 3456" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input id="expiryDate" value={cardInfo.expiryDate} onChange={handleCardInfoChange} placeholder="MM/YY" required />
                </div>
                <div>
                  <Label htmlFor="cvv">CVV</Label>
                  <Input id="cvv" value={cardInfo.cvv} onChange={handleCardInfoChange} placeholder="123" required />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-2xl font-semibold mb-4">Order Summary</h2>
          <div className="bg-gray-100 p-6 rounded-lg">
            {cartItems.map((item) => (
              <div key={item.productId} className="flex justify-between mb-2">
                <span>{item.name} x{item.quantity}</span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-300 my-4"></div>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2">
              <span>Shipping</span>
              <span>${shipping.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg mt-4">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <Button className="w-full mt-8" size="lg" onClick={handlePlaceOrder} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Place Order'}
          </Button>

          <div className="mt-8 space-y-4">
            <div className="flex items-center">
              <TruckIcon className="w-6 h-6 mr-2 text-green-500" />
              <span>Free shipping on orders over $100</span>
            </div>
            
            <div className="flex items-center">
              <ShieldCheckIcon className="w-6 h-6 mr-2 text-blue-500" />
              <span>Secure payment processing</span>
            </div>
            <div className="flex items-center">
              <CreditCardIcon className="w-6 h-6 mr-2 text-purple-500" />
              <span>We accept all major credit cards</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}