import React from 'react'
import Image from 'next/image'
import { Star, HelpCircle } from 'lucide-react'
import { Product, Category, CustomerReview, FAQ } from '@/interfaces/product-interfaces'

interface SearchResultsProps {
  query: string
  results: {
    products: Product[]
    categories: Category[]
    reviews: CustomerReview[]
    faqs: FAQ[]
  }
}

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

      {results.reviews.length > 0 && (
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Customer Reviews</h2>
          <div className="space-y-4">
            {results.reviews.map((review) => (
              <div key={review.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4">
                <div className="flex items-center mb-2">
                  <Image
                    src={review.avatar}
                    alt={review.name}
                    width={40}
                    height={40}
                    className="w-10 h-10 rounded-full mr-4"
                  />
                  <div>
                    <h3 className="font-semibold">{review.name}</h3>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-4 h-4 ${
                            i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 dark:text-gray-300">{review.comment}</p>
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