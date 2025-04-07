"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { PlusIcon, Pencil, Trash2, Save, X, ChevronDown, HelpCircle, Search, FileQuestion } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"

import { Pagination } from "@/app/components/ui/pagination"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { motion, AnimatePresence } from "framer-motion"
import { Input } from "@/app/components/ui/input"

interface FAQ {
  id: number
  question: string
  answer: string
}

// DTO interfaces to match backend expectations
interface FAQDTO {
  question: string
  answer: string
}

interface FAQUpdateDTO {
  id: number
  question: string
  answer: string
}

const API_URL = "https://localhost:7007/api"

export default function AdminFAQPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)
  const [editMode, setEditMode] = useState<number | null>(null)
  const [currentFaq, setCurrentFaq] = useState<FAQ>({ id: 0, question: "", answer: "" })
  const [faqToDelete, setFaqToDelete] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const { getToken } = useAuth()
  const pageSize = 10

  useEffect(() => {
    fetchFAQs()
  }, [currentPage])

  const fetchFAQs = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_URL}/FAQ?page=${currentPage}&size=${pageSize}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFaqs(data)
        // If your backend doesn't return totalCount, you might need to estimate it
        // or make a separate request to get the count
        setTotalPages(Math.ceil(data.length / pageSize) || 1)
      } else {
        toast.error("Failed to fetch FAQs")
      }
    } catch (error) {
      console.error("Error fetching FAQs:", error)
      toast.error("An error occurred while fetching FAQs")
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddFAQ = () => {
    setCurrentFaq({ id: 0, question: "", answer: "" })
    setIsDialogOpen(true)
  }

  const handleEditFAQ = (faq: FAQ) => {
    setCurrentFaq({ ...faq })
    setIsDialogOpen(true)
  }

  const handleDeleteFAQ = (id: number) => {
    setFaqToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const handleSaveFAQ = async () => {
    if (!currentFaq.question.trim() || !currentFaq.answer.trim()) {
      toast.error("Question and answer are required")
      return
    }

    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      // Prepare data according to backend expectations
      let requestData: FAQDTO | FAQUpdateDTO
      let method: string
      let url: string

      if (currentFaq.id === 0) {
        // New FAQ
        requestData = {
          question: currentFaq.question,
          answer: currentFaq.answer,
        }
        method = "POST"
        url = `${API_URL}/FAQ`
      } else {
        // Update existing FAQ
        requestData = {
          id: currentFaq.id,
          question: currentFaq.question,
          answer: currentFaq.answer,
        }
        method = "PUT"
        url = `${API_URL}/FAQ`
      }

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast.success(`FAQ ${currentFaq.id ? "updated" : "added"} successfully`)
        setIsDialogOpen(false)
        fetchFAQs()
      } else {
        toast.error(`Failed to ${currentFaq.id ? "update" : "add"} FAQ`)
      }
    } catch (error) {
      console.error(`Error ${currentFaq.id ? "updating" : "adding"} FAQ:`, error)
      toast.error(`An error occurred while ${currentFaq.id ? "updating" : "adding"} the FAQ`)
    } finally {
      setIsLoading(false)
    }
  }

  const confirmDeleteFAQ = async () => {
    if (faqToDelete === null) return

    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_URL}/FAQ?faqId=${faqToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("FAQ deleted successfully")
        setIsDeleteDialogOpen(false)
        fetchFAQs()
      } else {
        toast.error("Failed to delete FAQ")
      }
    } catch (error) {
      console.error("Error deleting FAQ:", error)
      toast.error("An error occurred while deleting the FAQ")
    } finally {
      setIsLoading(false)
      setFaqToDelete(null)
    }
  }

  const handleInlineEdit = (id: number) => {
    const faq = faqs.find((f) => f.id === id)
    if (faq) {
      setCurrentFaq({ ...faq })
      setEditMode(id)
    }
  }

  const handleInlineSave = async () => {
    if (editMode === null) return
    if (!currentFaq.question.trim() || !currentFaq.answer.trim()) {
      toast.error("Question and answer are required")
      return
    }

    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const requestData: FAQUpdateDTO = {
        id: currentFaq.id,
        question: currentFaq.question,
        answer: currentFaq.answer,
      }

      const response = await fetch(`${API_URL}/FAQ`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        toast.success("FAQ updated successfully")
        setEditMode(null)
        fetchFAQs()
      } else {
        toast.error("Failed to update FAQ")
      }
    } catch (error) {
      console.error("Error updating FAQ:", error)
      toast.error("An error occurred while updating the FAQ")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInlineCancel = () => {
    setEditMode(null)
  }

  const toggleExpand = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id)
  }

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-lg shadow-sm">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
              FAQ Management
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage frequently asked questions for your customers
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search FAQs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700"
              />
            </div>
            <Button
              onClick={handleAddFAQ}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4 mr-2" />
              Add FAQ
            </Button>
          </div>
        </div>

        <Card className="bg-white dark:bg-gray-800 border-0 shadow-md overflow-hidden mb-6">
          <CardHeader className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/40 dark:to-purple-950/40 pb-4">
            <CardTitle className="text-xl text-indigo-700 dark:text-indigo-300 flex items-center">
              <HelpCircle className="h-5 w-5 mr-2 text-indigo-500" />
              Frequently Asked Questions
            </CardTitle>
            <CardDescription>
              {filteredFaqs.length} {filteredFaqs.length === 1 ? "question" : "questions"} available
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {isLoading && faqs.length === 0 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <BouncingDotsLoader color="primary" />
        </div>
      ) : filteredFaqs.length === 0 ? (
        <Card className="w-full border-0 shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/30 dark:to-purple-900/30 flex items-center justify-center mb-6 shadow-inner">
              <FileQuestion className="h-10 w-10 text-indigo-500 dark:text-indigo-400" />
            </div>
            <h2 className="text-2xl font-semibold text-indigo-700 dark:text-indigo-300 mb-3">No FAQs Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              {searchQuery
                ? "No FAQs match your search criteria. Try a different search term or clear the search."
                : "Start adding frequently asked questions to help your customers find answers quickly."}
            </p>
            {searchQuery ? (
              <Button
                variant="outline"
                onClick={() => setSearchQuery("")}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-900/30"
              >
                Clear Search
              </Button>
            ) : (
              <Button
                onClick={handleAddFAQ}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Your First FAQ
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {filteredFaqs.map((faq) => (
              <motion.div
                key={faq.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="w-full border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 overflow-hidden">
                  <CardContent className="p-0">
                    <div
                      className={`p-5 cursor-pointer flex justify-between items-center transition-colors duration-200 ${
                        expandedFaq === faq.id
                          ? "bg-indigo-50/80 dark:bg-indigo-950/30 border-b border-indigo-100 dark:border-indigo-900/50"
                          : "hover:bg-gray-50 dark:hover:bg-gray-800/80"
                      }`}
                      onClick={() => toggleExpand(faq.id)}
                    >
                      {editMode === faq.id ? (
                        <Input
                          value={currentFaq.question}
                          onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                          className="flex-grow mr-2 border-indigo-200 dark:border-indigo-800 focus:ring-indigo-500"
                          onClick={(e) => e.stopPropagation()}
                        />
                      ) : (
                        <div className="flex items-center flex-grow">
                          <Badge
                            variant="outline"
                            className="mr-3 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800"
                          >
                            Q
                          </Badge>
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{faq.question}</h3>
                        </div>
                      )}
                      <div className="flex items-center space-x-1" onClick={(e) => e.stopPropagation()}>
                        {editMode === faq.id ? (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleInlineSave}
                              className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-900/20"
                            >
                              <Save className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only sm:inline-block">Save</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={handleInlineCancel}
                              className="text-gray-600 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-700/30"
                            >
                              <X className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only sm:inline-block">Cancel</span>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleInlineEdit(faq.id)}
                              className="text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-900/20"
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only sm:inline-block">Edit</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFAQ(faq.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              <span className="sr-only sm:not-sr-only sm:inline-block">Delete</span>
                            </Button>
                            <Button variant="ghost" size="icon" className="text-gray-500 dark:text-gray-400 ml-1">
                              <ChevronDown
                                className={`h-5 w-5 transition-transform duration-200 ${expandedFaq === faq.id ? "rotate-180" : ""}`}
                              />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    <AnimatePresence>
                      {expandedFaq === faq.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="p-5 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                            <div className="flex items-start">
                              <Badge
                                variant="outline"
                                className="mr-3 mt-1 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                              >
                                A
                              </Badge>
                              <div className="flex-grow">
                                {editMode === faq.id ? (
                                  <Textarea
                                    value={currentFaq.answer}
                                    onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                                    className="min-h-[120px] border-indigo-200 dark:border-indigo-800 focus:ring-indigo-500"
                                  />
                                ) : (
                                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                                    {faq.answer}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-lg bg-white dark:bg-gray-800 border-0 shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-xl text-indigo-700 dark:text-indigo-300 flex items-center">
              <FileQuestion className="h-5 w-5 mr-2 text-indigo-500" />
              {currentFaq.id ? "Edit FAQ" : "Add New FAQ"}
            </DialogTitle>
            <DialogDescription className="text-gray-600 dark:text-gray-400">
              {currentFaq.id
                ? "Update the question and answer below."
                : "Enter a question and answer to add to your FAQ."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-5 py-4">
            <div className="space-y-2">
              <label
                htmlFor="question"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
              >
                <Badge
                  variant="outline"
                  className="mr-2 bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800"
                >
                  Q
                </Badge>
                Question
              </label>
              <Input
                id="question"
                value={currentFaq.question}
                onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                placeholder="Enter the question"
                className="border-gray-200 dark:border-gray-700 focus:ring-indigo-500"
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="answer"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center"
              >
                <Badge
                  variant="outline"
                  className="mr-2 bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800"
                >
                  A
                </Badge>
                Answer
              </label>
              <Textarea
                id="answer"
                value={currentFaq.answer}
                onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                placeholder="Enter the answer"
                className="min-h-[180px] border-gray-200 dark:border-gray-700 focus:ring-indigo-500"
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
              className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/30"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveFAQ}
              disabled={isLoading}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? "Saving..." : currentFaq.id ? "Update FAQ" : "Add FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white dark:bg-gray-800 border-0 shadow-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl text-red-600 dark:text-red-400 flex items-center">
              <Trash2 className="h-5 w-5 mr-2" />
              Delete FAQ
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              This action cannot be undone. This will permanently delete the FAQ from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 sm:gap-0">
            <AlertDialogCancel className="border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-700/30">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteFAQ}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-md hover:shadow-lg transition-all duration-200"
            >
              {isLoading ? "Deleting..." : "Delete FAQ"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

