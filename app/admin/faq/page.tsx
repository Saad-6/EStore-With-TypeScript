"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { PlusIcon, Pencil, Trash2, Save, X, ChevronDown } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { Input } from "@/app/components/ui/input"
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

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-900 rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">FAQ Management</h1>
        <Button onClick={handleAddFAQ} className="flex items-center">
          <PlusIcon className="h-4 w-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {isLoading && faqs.length === 0 ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <BouncingDotsLoader color="primary" />
        </div>
      ) : faqs?.length === 0 ? (
        <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <ChevronDown className="h-8 w-8 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">No FAQs Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Start adding frequently asked questions to help your customers.
            </p>
            <Button onClick={handleAddFAQ}>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Your First FAQ
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id} className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
              <CardContent className="p-0">
                <div
                  className={`p-4 cursor-pointer flex justify-between items-center ${
                    expandedFaq === faq.id ? "border-b border-indigo-100 dark:border-indigo-900" : ""
                  }`}
                  onClick={() => toggleExpand(faq.id)}
                >
                  {editMode === faq.id ? (
                    <Input
                      value={currentFaq.question}
                      onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                      className="flex-grow mr-2"
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <h3 className="text-lg font-semibold flex-grow">{faq.question}</h3>
                  )}
                  <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                    {editMode === faq.id ? (
                      <>
                        <Button variant="ghost" size="sm" onClick={handleInlineSave}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={handleInlineCancel}>
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="ghost" size="sm" onClick={() => handleInlineEdit(faq.id)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDeleteFAQ(faq.id)}>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                        <ChevronDown
                          className={`h-5 w-5 transition-transform ${expandedFaq === faq.id ? "rotate-180" : ""}`}
                        />
                      </>
                    )}
                  </div>
                </div>
                {expandedFaq === faq.id && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-b-lg">
                    {editMode === faq.id ? (
                      <Textarea
                        value={currentFaq.answer}
                        onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                        className="min-h-[100px]"
                      />
                    ) : (
                      <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{faq.answer}</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}

      {/* Add/Edit FAQ Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentFaq.id ? "Edit FAQ" : "Add New FAQ"}</DialogTitle>
            <DialogDescription>
              {currentFaq.id
                ? "Update the question and answer below."
                : "Enter a question and answer to add to your FAQ."}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="question" className="text-sm font-medium">
                Question
              </label>
              <Input
                id="question"
                value={currentFaq.question}
                onChange={(e) => setCurrentFaq({ ...currentFaq, question: e.target.value })}
                placeholder="Enter the question"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="answer" className="text-sm font-medium">
                Answer
              </label>
              <Textarea
                id="answer"
                value={currentFaq.answer}
                onChange={(e) => setCurrentFaq({ ...currentFaq, answer: e.target.value })}
                placeholder="Enter the answer"
                className="min-h-[150px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveFAQ} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the FAQ from your database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteFAQ} className="bg-red-600 hover:bg-red-700">
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

