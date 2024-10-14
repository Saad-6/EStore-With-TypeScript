'use client'

import React, { useEffect, useRef, useState } from 'react'
import { StarIcon } from '@heroicons/react/20/solid'
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination'

interface Review {
  id: number
  username: string
  rating: number
  comment: string
  createdAt: string
}

const reviews: Review[] = [
  { id: 1, username: "Alice", rating: 5, comment: "Absolutely love this product! It's exactly what I was looking for.", createdAt: "2023-11-15T10:30:00Z" },
  { id: 2, username: "Bob", rating: 4, comment: "Great quality for the price. Would recommend.", createdAt: "2023-11-14T14:45:00Z" },
  { id: 3, username: "Charlie", rating: 3, comment: "Decent product, but could use some improvements.", createdAt: "2023-11-13T09:15:00Z" },
  { id: 4, username: "Diana", rating: 5, comment: "Exceeded my expectations. Will definitely buy again!", createdAt: "2023-11-12T16:20:00Z" },
  { id: 5, username: "Ethan", rating: 4, comment: "Very satisfied with my purchase. Fast shipping too!", createdAt: "2023-11-11T11:05:00Z" },
  { id: 6, username: "Fiona", rating: 5, comment: "Top-notch quality and excellent customer service.", createdAt: "2023-11-10T13:40:00Z" },
  { id: 7, username: "George", rating: 3, comment: "It's okay, but I expected more for the price.", createdAt: "2023-11-09T15:55:00Z" },
  { id: 8, username: "Hannah", rating: 4, comment: "Really happy with this product. Does exactly what it says.", createdAt: "2023-11-08T10:10:00Z" },
  { id: 9, username: "Ian", rating: 5, comment: "Fantastic product! Couldn't be happier with my purchase.", createdAt: "2023-11-07T14:30:00Z" },
  { id: 10, username: "Julia", rating: 4, comment: "Great value for money. Would buy again.", createdAt: "2023-11-06T09:50:00Z" },
]

const ITEMS_PER_PAGE = 3

export default function UserReviews() {
    const [currentPage, setCurrentPage] = useState(1)
    const reviewsRef = useRef<HTMLDivElement>(null)
  
    const indexOfLastReview = currentPage * ITEMS_PER_PAGE
    const indexOfFirstReview = indexOfLastReview - ITEMS_PER_PAGE
    const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)
    const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE)
  
    useEffect(() => {
      if (reviewsRef.current) {
        reviewsRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }, [currentPage])
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return 'Yesterday'
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  return (
    <div className="mt-12 border-t pt-8" ref={reviewsRef}>
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div className="space-y-4">
      {currentReviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-semibold mr-2">{review.username}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon
                      key={i}
                      className={`h-4 w-4 ${
                        i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{formatDate(review.createdAt)}</span>
            </div>
            <p className="text-gray-700 text-sm">{review.comment}</p>
          </div>
        ))}
      </div>
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(Math.max(currentPage - 1, 1))
              }}
              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
          {[...Array(totalPages)].map((_, i) => (
            <PaginationItem key={i}>
              <PaginationLink 
                href="#" 
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(i + 1)
                }}
                isActive={currentPage === i + 1}
              >
                {i + 1}
              </PaginationLink>
            </PaginationItem>
          ))}
          <PaginationItem>
            <PaginationNext 
              href="#" 
              onClick={(e) => {
                e.preventDefault()
                handlePageChange(Math.min(currentPage + 1, totalPages))
              }}
              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  )
}