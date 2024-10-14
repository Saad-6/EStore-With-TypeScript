'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { StarIcon, TagIcon, FireIcon } from '@heroicons/react/20/solid'
import ModernProductCard from './components/modern-product-card'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { TrendingUpIcon } from 'lucide-react'


const categories = [
  { name: 'Electronics', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' },
  { name: 'Clothing', image: 'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' },
  { name: 'Home & Garden', image: 'https://images.unsplash.com/photo-1616046229478-9901c5536a45?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1160&q=80' },
  { name: 'Sports', image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80' },
]

const featuredProducts = [
  { name: 'Wireless Earbuds', price: 79.99, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1932&q=80', rating: 4.5, reviews: 120, description: 'High-quality wireless earbuds with noise cancellation.', category: 'Electronics' },
  { name: 'Smart Watch', price: 199.99, image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1064&q=80', rating: 4.2, reviews: 85, description: 'Feature-packed smartwatch with health tracking.', category: 'Electronics' },
  { name: 'Laptop', price: 999.99, image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1471&q=80', rating: 4.8, reviews: 200, description: 'Powerful laptop for work and entertainment.', category: 'Electronics' },
  { name: 'Smartphone', price: 699.99, image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2127&q=80', rating: 4.6, reviews: 150, description: 'Latest smartphone with advanced camera features.', category: 'Electronics' },
]

const reviews = [
  { name: 'John Doe', rating: 5, comment: 'Great products and fast shipping!', avatar: 'https://randomuser.me/api/portraits/men/1.jpg' },
  { name: 'Jane Smith', rating: 4, comment: 'Good variety of items. Will shop again.', avatar: 'https://randomuser.me/api/portraits/women/2.jpg' },
  { name: 'Mike Johnson', rating: 5, comment: 'Excellent customer service!', avatar: 'https://randomuser.me/api/portraits/men/3.jpg' },
]

const cardTypes = ['minimal', 'detailed', 'modern'] as const
type CardType = typeof cardTypes[number]

const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  )
}

const AnimatedText = ({ children, className }: { children: React.ReactNode, className?: string }) => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.5 }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

export default function Home() {
  const [selectedCardType, setSelectedCardType] = useState<CardType>('minimal')

  const renderProductCard = (product: any, index: number) => {
    switch (selectedCardType) {
      case 'modern':
        return <ModernProductCard key={index} {...product} />
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Hero Carousel */}
      <Carousel
        showArrows={true}
        showStatus={false}
        showThumbs={false}
        infiniteLoop={true}
        autoPlay={true}
        interval={5000}
      >
        <div className="relative h-[60vh] md:h-[80vh]">
          <Image
            src="https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Hero 1"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <AnimatedText>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  Welcome to EStore
                </h1>
              </AnimatedText>
              <AnimatedText>
                <p className="text-xl md:text-2xl text-white mb-8">
                  Discover amazing deals on top brands
                </p>
              </AnimatedText>
              <AnimatedText>
                <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300">
                  Shop Now
                </button>
              </AnimatedText>
            </div>
          </div>
        </div>
        <div className="relative h-[60vh] md:h-[80vh]">
          <Image
            src="https://images.unsplash.com/photo-1607082349566-187342175e2f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
            alt="Hero 2"
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <AnimatedText>
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                  Summer Sale
                </h1>
              </AnimatedText>
              <AnimatedText>
                <p className="text-xl md:text-2xl text-white mb-8">
                  Up to 50% off on selected items
                </p>
              </AnimatedText>
              <AnimatedText>
                <button className="bg-green-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-green-700 transition duration-300">
                  View Deals
                </button>
              </AnimatedText>
            </div>
          </div>
        </div>
      </Carousel>

      {/* Featured Products */}
      <AnimatedSection>
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedText>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                Featured Products
              </h2>
            </AnimatedText>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
  <ModernProductCard key={index} {...product} />
))}

            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Categories */}
      <AnimatedSection>
        <section className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedText>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                Shop by Category
              </h2>
            </AnimatedText>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {categories.map((category, index) => (
                <motion.div 
                  key={index} 
                  className="relative h-64 rounded-lg overflow-hidden shadow-md cursor-pointer"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.3 }}
                >
                  <Image
                    src={category.image}
                    alt={category.name}
                    layout="fill"
                    objectFit="cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 hover:bg-opacity-60">
                    <h3 className="text-2xl font-bold text-white">{category.name}</h3>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Customer Reviews */}
      <AnimatedSection>
        <section className="py-12 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedText>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8">
                What Our Customers Say
              </h2>
            </AnimatedText>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((review, index) => (
                <AnimatedText key={index}>
                  <div className="bg-gray-100 rounded-lg p-6">
                    <div className="flex items-center mb-4">
                      <Image
                        src={review.avatar}
                        alt={review.name}
                        width={48}
                        height={48}
                        className="rounded-full"
                      />
                      <div className="ml-4">
                        <h3 className="text-lg font-semibold text-gray-900">{review.name}</h3>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-5 w-5 ${
                                i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-600">{review.comment}</p>
                  </div>
                </AnimatedText>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Updated Deals Section */}
      <AnimatedSection>
        <section className="py-12 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedText>
              <h2 className="text-3xl font-extrabold text-white mb-8 text-center">
                Hot Deals
              </h2>
            </AnimatedText>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "Flash Sale", icon: <FireIcon className="h-8 w-8 text-red-500" />, description: "24-hour deals on top brands" },
                { title: "Trending Now", icon: <TrendingUpIcon className="h-8 w-8 text-green-500" />, description: "See what's popular this week" },
                { title: "Clearance", icon: <TagIcon className="h-8 w-8 text-yellow-500" />, description: "Last chance for great savings" }
              ].map((deal, index) => (
                <AnimatedText key={index}>
                  <motion.div 
                    className="bg-white rounded-xl shadow-lg overflow-hidden transform transition duration-500 hover:scale-105"
                    whileHover={{ y: -5 }}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-center mb-4">
                        {deal.icon}
                      </div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">{deal.title}</h3>
                      <p className="text-gray-600 text-center mb-4">{deal.description}</p>
                      <div className="text-center">
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition duration-300"
                        >
                          Shop Now
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatedText>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

      {/* Seasonal Collections */}
      <AnimatedSection>
        <section className="py-12 bg-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <AnimatedText>
              <h2 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">
                Seasonal Collections
              </h2>
            </AnimatedText>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {[
                { title: "Summer Essentials", image: "https://images.unsplash.com/photo-1517398823963-c2dc6fc3e837?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" },
                { title: "Autumn Trends", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1470&q=80" },
              ].map((collection, index) => (
                <AnimatedText key={index}>
                  <motion.div 
                    className="relative h-96 rounded-xl overflow-hidden shadow-lg"
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={collection.image}
                      alt={collection.title}
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center">
                        <h3 className="text-3xl font-bold text-white mb-4">{collection.title}</h3>
                        <motion.button 
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-white text-gray-900 px-6 py-2 rounded-full font-semibold hover:bg-gray-100 transition duration-300"
                        >
                          Explore Collection
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatedText>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>

 
    </div>
  )
}