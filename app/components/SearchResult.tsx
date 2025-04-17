import React from 'react'
import Image from 'next/image'
import { Star, HelpCircle } from 'lucide-react'
import { Product, Category, FAQ } from '@/interfaces/product-interfaces'

interface SearchResultsProps {
  query: string
  results: {
    products: Product[]
    categories: Category[]
    faqs: FAQ[]
  }
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7007/api"

export function SearchResults({ query, results }: SearchResultsProps) {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Search Results for "{query}"</h1>

      {results.products.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Products</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.products.map((product) => (
              <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
                <Image
                  src={product.primaryImage.url}
                  alt={product.primaryImage.altText}
                  width={300}
                  height={300}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 dark:text-gray-300 mb-2">{product.description.substring(0, 100)}...</p>
                  <p className="text-blue-600 dark:text-blue-400 font-bold">${product.price.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {results.categories.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Categories</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {results.categories.map((category) => (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 flex items-center">
                <Image
                  src={category.thumbNailUrl}
                  alt={category.name}
                  width={50}
                  height={50}
                  className="w-12 h-12 object-cover rounded-full mr-4"
                />
                <h3 className="font-semibold">{category.name}</h3>
              </div>
            ))}
          </div>
        </section>
      )}


      {results.faqs.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">FAQs</h2>
          <div className="space-y-4">
            {results.faqs.map((faq) => (
              <div key={faq.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-start">
                  <HelpCircle className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-semibold mb-2">{faq.question}</h3>
                    <p className="text-gray-600 dark:text-gray-300">{faq.answer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}