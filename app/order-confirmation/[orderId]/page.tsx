'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { PackageIcon } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params.orderId

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-primary/20 to-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Order Confirmation</h1>
        <p className="text-xl md:text-2xl text-muted-foreground">
          Your order number <span className="font-semibold text-primary">{orderId}</span> has been registered and is awaiting confirmation.
        </p>
      </motion.div>

      <motion.div
        animate={{
          y: [0, -20, 0],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
        }}
        className="relative"
      >
        <PackageIcon className="w-24 h-24 md:w-32 md:h-32 text-primary" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            repeatType: "reverse",
          }}
          className="absolute inset-0 bg-primary/20 rounded-full -z-10"
        />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.5 }}
        className="mt-12 text-center"
      >
        <p className="text-lg md:text-xl mb-4">
          Thank you for your purchase! We&apos;re processing your order and will send you an email with the details shortly.
        </p>
        <p className="text-muted-foreground">
          If you have any questions, please contact our customer support.
        </p>
      </motion.div>
    </div>
  )
}