"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, ChevronDown, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { Input } from "../components/ui/input"
import { Pagination } from "../components/ui/pagination"

interface FAQ {
  id: number
  question: string
  answer: string
}

const API_URL = "https://localhost:7007/api"
const ITEMS_PER_PAGE = 10

export default function FAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [filteredFaqs, setFilteredFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  useEffect(() => {
    fetchFAQs()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredFaqs(faqs)
      setTotalPages(Math.ceil(faqs.length / ITEMS_PER_PAGE))
    } else {
      const filtered = faqs.filter(
        (faq) =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
      )
      setFilteredFaqs(filtered)
      setTotalPages(Math.ceil(filtered.length / ITEMS_PER_PAGE))
      setCurrentPage(1)
    }
  }, [searchQuery, faqs])

  const fetchFAQs = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/FAQ?page=1&size=100`) // Get all FAQs for client-side filtering
      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
        setFilteredFaqs(data)
        setTotalPages(Math.ceil(data.length / ITEMS_PER_PAGE))
      } else {
        console.error("Failed to fetch FAQs")
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const toggleExpand = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const paginatedFaqs = filteredFaqs.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 via-background to-background dark:from-primary/5 dark:via-background dark:to-background">
      <div className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-primary">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about our products and services.
          </p>
        </motion.div>

        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search for questions or keywords..."
              className="pl-10 py-6 text-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center min-h-[400px]">
            <BouncingDotsLoader color="primary" />
          </div>
        ) : paginatedFaqs.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="text-center py-16 bg-card rounded-lg shadow-md max-w-2xl mx-auto"
          >
            <HelpCircle className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No FAQs Found</h2>
            <p className="text-muted-foreground mb-6">
              {searchQuery
                ? `No results found for "${searchQuery}". Try a different search term.`
                : "There are no FAQs available at the moment."}
            </p>
            {searchQuery && (
              <Button variant="outline" onClick={() => setSearchQuery("")}>
                Clear Search
              </Button>
            )}
          </motion.div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-4">
            <AnimatePresence initial={false}>
              {paginatedFaqs.map((faq, index) => (
                <motion.div
                  key={faq.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="bg-card dark:bg-card/80 rounded-lg shadow-md overflow-hidden"
                >
                  <div
                    className="p-5 flex justify-between items-center cursor-pointer hover:bg-accent/50 transition-colors"
                    onClick={() => toggleExpand(faq.id)}
                  >
                    <h3 className="text-lg font-medium">{faq.question}</h3>
                    <ChevronDown
                      className={`h-5 w-5 text-primary transition-transform duration-300 ${
                        expandedFaq === faq.id ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                  <AnimatePresence>
                    {expandedFaq === faq.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <div className="p-5 pt-0 border-t border-border">
                          <p className="text-muted-foreground whitespace-pre-wrap">{faq.answer}</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center">
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          </div>
        )}
      </div>
    </div>
  )
}

