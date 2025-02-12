"use client"

import { useEffect, useRef, useState } from "react"
import { StarIcon } from "@heroicons/react/20/solid"
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination"

interface Review {
  id: number
  stars: number
  givenBy: string
  comment: string
  postedAt: string
}

interface UserReviewsProps {
  reviews: Review[]
}

const ITEMS_PER_PAGE = 3

export default function UserReviews({ reviews }: UserReviewsProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const reviewsRef = useRef<HTMLDivElement>(null)

  const indexOfLastReview = currentPage * ITEMS_PER_PAGE
  const indexOfFirstReview = indexOfLastReview - ITEMS_PER_PAGE
  const currentReviews = reviews.slice(indexOfFirstReview, indexOfLastReview)
  const totalPages = Math.ceil(reviews.length / ITEMS_PER_PAGE)

  useEffect(() => {
    if (reviewsRef.current) {
      reviewsRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [reviewsRef]) // Removed unnecessary currentPage dependency

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 1) {
      return "Yesterday"
    } else if (diffDays <= 7) {
      return `${diffDays} days ago`
    } else {
      return date.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
  }

  if (reviews.length === 0) {
    return (
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
        <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
      </div>
    )
  }

  return (
    <div className="mt-12 border-t pt-8" ref={reviewsRef}>
      <h2 className="text-2xl font-bold mb-6">Customer Reviews</h2>
      <div className="space-y-4">
        {currentReviews.map((review) => (
          <div key={review.id} className="border-b pb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <span className="font-semibold mr-2">{review.givenBy}</span>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <StarIcon key={i} className={`h-4 w-4 ${i < review.stars ? "text-yellow-400" : "text-gray-300"}`} />
                  ))}
                </div>
              </div>
              <span className="text-sm text-gray-500">{formatDate(review.postedAt)}</span>
            </div>
            <p className="text-gray-700 text-sm dark:text-gray-300">{review.comment}</p>
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination className="mt-6">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  handlePageChange(Math.max(currentPage - 1, 1))
                }}
                className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
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
                className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  )
}

