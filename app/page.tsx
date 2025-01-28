'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { Carousel } from 'react-responsive-carousel'
import "react-responsive-carousel/lib/styles/carousel.min.css"
import { FireIcon, StarIcon, TagIcon } from '@heroicons/react/20/solid'
import { motion, useAnimation } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useTheme } from './lib/theme-context'
import { TrendingUpIcon } from 'lucide-react'
import AnimatedText from './components/ui/AnimatedText'
import { HomePageLayout, HeroCarouselSlide, SimpleProductDTO, SimpleCategoryDTO } from '@/interfaces/product-interfaces'

const AnimatedSection = ({ children }: { children: React.ReactNode }) => {
  const controls = useAnimation()
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })

  useEffect(() => {
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  return (
    <motion.div
      ref={ref}
      animate={controls}
      initial="hidden"
      variants={{
        visible: { opacity: 1, y: 0 },
        hidden: { opacity: 0, y: 50 }
      }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  )
}

const ProductCard = ({ name, price, imageUrl, rating, reviews, description }: any) => {
  const { theme } = useTheme()

  return (
    <motion.div 
      className={`rounded-lg overflow-hidden shadow-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}
      whileHover={{ scale: 1.05 }}
      transition={{ duration: 0.3 }}
    >
      <div className="relative h-64">
        <Image
          src={imageUrl || '/placeholder.png'}
          alt={name || 'Product'}
          layout="fill"
          objectFit="cover"
        />
      </div>
      <div className="p-4">
        <h3 className={`text-lg font-semibold mb-2 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{name || 'Unnamed Product'}</h3>
        <p className={`text-sm mb-2 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{description || 'No description available'}</p>
        <div className="flex justify-between items-center">
          <span className={`font-bold ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>${price?.toFixed(2) || 'N/A'}</span>
          {(rating !== null && rating !== undefined) && (reviews !== null && reviews !== undefined) && (
            <div className="flex items-center">
              <span className={`text-sm mr-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{rating}</span>
              <StarIcon className="h-5 w-5 text-yellow-400" />
              <span className={`text-sm ml-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>({reviews})</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

export default function Home() {
  const { theme } = useTheme()
  const [layout, setLayout] = useState<HomePageLayout | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchLayout = async () => {
      try {
        const response = await fetch('https://localhost:7007/api/Layout/active')
        if (!response.ok) {
          throw new Error('Failed to fetch layout')
        }
        const data: HomePageLayout = await response.json();
        console.log(data);
        setLayout(data)
      } catch (err) {
        console.error('Error fetching layout:', err)
        setError('Failed to load the page layout. Please try again later.')
      }
    }

    fetchLayout()
  }, [])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-100 text-red-900">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Error</h1>
          <p>{error}</p>
          <p className="mt-4">Please contact the administrator to set up the layout.</p>
        </div>
      </div>
    )
  }

  if (!layout) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-2xl">Loading...</p>
      </div>
    )
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
      {/* Hero Carousel */}
      {layout.settings?.heroCarousel && layout.settings.heroCarousel.length > 0 && (
        <Carousel
          showArrows={false}
          showStatus={false}
          showThumbs={false}
          infiniteLoop={true}
          autoPlay={true}
          interval={5000}
        >
          {layout.settings.heroCarousel.map((slide: HeroCarouselSlide, index: number) => (
            <div key={index} className="relative h-[60vh] md:h-[80vh]">
              <Image
                src={slide.image || '/placeholder.png'}
                alt={`Hero ${index + 1}`}
                layout="fill"
                objectFit="cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="text-center">
                  <AnimatedText>
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                      {slide.title || 'Welcome'}
                    </h1>
                  </AnimatedText>
                  <AnimatedText>
                    <p className="text-xl md:text-2xl text-white mb-8">
                      {slide.subtitle || 'Discover our amazing products'}
                    </p>
                  </AnimatedText>
                  <AnimatedText>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-full text-lg font-semibold hover:bg-blue-700 transition duration-300">
                      {slide.buttonText || 'Shop Now'}
                    </button>
                  </AnimatedText>
                </div>
              </div>
            </div>
          ))}
        </Carousel>
      )}

      {/* New Arrivals */}
      {layout.settings?.newArrivals && layout.settings.newArrivals.length > 0 && (
        <AnimatedSection>
          <section className={`py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2 
                className={`text-3xl font-extrabold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                New Arrivals
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {layout.settings.newArrivals.map((product: SimpleProductDTO, index: number) => (
                  <ProductCard key={index} {...product} />
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Categories */}
      {layout.settings?.categories && layout.settings.categories.length > 0 && (
        <AnimatedSection>
          <section className={`py-12 ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2 
                className={`text-3xl font-extrabold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Shop by Category
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {layout.settings.categories.map((category: SimpleCategoryDTO, index: number) => (
                  <motion.div 
                    key={index} 
                    className="relative h-64 rounded-lg overflow-hidden shadow-md cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.3 }}
                  >
                    <Image
                      src={category.imageUrl || '/placeholder.png'}
                      alt={category.name || 'Category'}
                      layout="fill"
                      objectFit="cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center transition-opacity duration-300 hover:bg-opacity-60">
                      <h3 className="text-2xl font-bold text-white">{category.name || 'Unnamed Category'}</h3>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Featured Products */}
      {layout.settings?.featuredProducts && layout.settings.featuredProducts.length > 0 && (
        <AnimatedSection>
          <section className={`py-12 ${theme === 'dark' ? 'bg-gray-800' : 'bg-white'}`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.h2 
                className={`text-3xl font-extrabold mb-8 ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
              >
                Featured Products
              </motion.h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {layout.settings.featuredProducts.map((product: SimpleProductDTO, index: number) => (
                  <ProductCard key={index} {...product} />
                ))}
              </div>
            </div>
          </section>
        </AnimatedSection>
      )}

      {/* Visually Appealing Section */}
      <AnimatedSection>
        <section className="py-12 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.h2 
              className="text-3xl font-extrabold text-white mb-8 text-center"
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              Discover Our Collections
            </motion.h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { title: "New Arrivals", icon: <FireIcon className="h-8 w-8 text-yellow-400" />, description: "Be the first to shop our latest products" },
                { title: "Best Sellers", icon: <TrendingUpIcon className="h-8 w-8 text-green-400" />, description: "Explore our most popular items" },
                { title: "Special Offers", icon: <TagIcon className="h-8 w-8 text-red-400" />, description: "Don't miss out on great deals" }
              ].map((item, index) => (
                <motion.div 
                  key={index}
                  className={`${theme === 'dark' ? 'bg-gray-800' : 'bg-white'} rounded-xl shadow-lg overflow-hidden`}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div className="p-6">
                    <div className="flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <h3 className={`text-xl font-semibold mb-2 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>{item.title}</h3>
                    <p className={`text-center mb-4 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>{item.description}</p>
                    <div className="text-center">
                      <motion.button 
                        className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-indigo-700 transition duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Explore Now
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </AnimatedSection>
    </div>
  )
}