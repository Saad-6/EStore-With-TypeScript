'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { SearchResults } from './components/SearchResult'
import { toast } from 'react-hot-toast'
import { CustomerReview, FAQ, Product } from '@/interfaces/product-interfaces'
import { Category } from './features/categories/categoriesSlice'

interface SearchDTO {
  products: Product[] | null
  categories: Category[] | null
  reviews: CustomerReview[] | null
  faqs: FAQ[] | null
}

console.log('SearchResultsPage component file is being executed')

export default function SearchResultsPage() {
  console.log('SearchResultsPage component is rendering')

  const searchParams = useSearchParams()
  const query = searchParams.get('q')
  const [results, setResults] = useState<SearchDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  console.log('SearchResultsPage: query =', query)

  useEffect(() => {
    console.log("SearchResultsPage: useEffect is running")
    const fetchSearchResults = async () => {
      console.log("Entered the fetchSearchResults function")
      if (!query) {
        console.log("No query provided, setting results to null")
        setIsLoading(false)
        setResults(null)
        return
      }

      setIsLoading(true)
      setError(null)

      try {
        console.log("Trying to fetch search results for query:", query)
        const response = await fetch(`https://localhost:7007/api/Search?query=${encodeURIComponent(query)}`)
        console.log("API call completed, status:", response.status)
        
        if (!response.ok) {
          throw new Error(`Failed to fetch search results: ${response.status} ${response.statusText}`)
        }
        
        const text = await response.text()
        console.log("Raw response:", text)
        
        let data: SearchDTO
        try {
          data = JSON.parse(text)
          console.log("Parsed data:", data)
        } catch (parseError) {
          console.error('Error parsing search results:', parseError)
          throw new Error('Invalid search results data received from the server')
        }

        setResults({
          products: data.products || [],
          categories: data.categories || [],
          reviews: data.reviews || [],
          faqs: data.faqs || []
        })
      } catch (error) {
        console.error('Error fetching search results:', error)
        setError('Failed to fetch search results. Please try again.')
        toast.error('Failed to fetch search results')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSearchResults()
  }, [query])

  console.log('SearchResultsPage: Rendering, isLoading =', isLoading, 'error =', error, 'results =', results)

  if (isLoading) {
    return <div className="container mx-auto px-4 py-8">Loading...</div>
  }

  if (error) {
    return <div className="container mx-auto px-4 py-8">{error}</div>
  }

  if (!results) {
    return <div className="container mx-auto px-4 py-8">No results found</div>
  }

  const hasResults = results.products.length > 0 || results.categories.length > 0 || 
                     results.reviews.length > 0 || results.faqs.length > 0

  if (!hasResults) {
    return <div className="container mx-auto px-4 py-8">No results found for "{query}"</div>
  }

  return <SearchResults query={query || ''} results={results} />
}