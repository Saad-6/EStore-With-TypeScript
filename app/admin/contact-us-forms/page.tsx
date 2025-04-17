"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { format } from "date-fns"
import { useAuth } from "@/app/lib/auth"
import {
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  MailIcon,
  RefreshCw,
  Search,
  MailOpenIcon,
  MailOpenIcon as MailClosedIcon,
  CheckIcon,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/app/components/ui/pagination"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/app/components/ui/input"

interface ContactSubmission {
  id: number
  name: string
  email: string
  phone?: string
  subject: string
  message: string
  category: string
  isRead: boolean
  isResolved: boolean
  createdAt: string
  response?: string
}

const API_URL = "https://localhost:7007/api"

export default function AdminContactPage() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSubmission, setSelectedSubmission] = useState<ContactSubmission | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [response, setResponse] = useState("")
  const [isSending, setIsSending] = useState(false)
  const { getToken } = useAuth()
  const pageSize = 10

  useEffect(() => {
    fetchSubmissions()
  }, [currentPage, filterStatus])

  const fetchSubmissions = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      let url = `${API_URL}/Contact?page=${currentPage}&size=${pageSize}`

      if (filterStatus !== "all") {
        url += `&status=${filterStatus}`
      }

      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`
      }

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setSubmissions(data.items)
        setTotalPages(Math.ceil(data.totalCount / pageSize))
      } else {
        toast.error("Failed to fetch contact submissions")
      }
    } catch (error) {
      console.error("Error fetching contact submissions:", error)
      toast.error("An error occurred while fetching contact submissions")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearch = () => {
    setCurrentPage(1)
    fetchSubmissions()
  }

  const handleViewDetails = (submission: ContactSubmission) => {
    setSelectedSubmission(submission)
    setResponse(submission.response || "")
    setIsDetailsOpen(true)

    if (!submission.isRead) {
      markAsRead(submission.id)
    }
  }

  const markAsRead = async (id: number) => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_URL}/Contact/${id}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setSubmissions(submissions.map((s) => (s.id === id ? { ...s, isRead: true } : s)))
      }
    } catch (error) {
      console.error("Error marking submission as read:", error)
    }
  }

  const toggleResolved = async (id: number, currentStatus: boolean) => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_URL}/Contact/${id}/resolve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ isResolved: !currentStatus }),
      })

      if (response.ok) {
        setSubmissions(submissions.map((s) => (s.id === id ? { ...s, isResolved: !currentStatus } : s)))

        if (selectedSubmission?.id === id) {
          setSelectedSubmission({
            ...selectedSubmission,
            isResolved: !currentStatus,
          })
        }

        toast.success(`Marked as ${!currentStatus ? "resolved" : "unresolved"}`)
      } else {
        toast.error("Failed to update status")
      }
    } catch (error) {
      console.error("Error toggling resolved status:", error)
      toast.error("An error occurred while updating status")
    }
  }


  // Yet To Be Implemented

  const sendResponse = async () => {
    if (!selectedSubmission) return

    setIsSending(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response : any= await fetch(`${API_URL}/Contact/${selectedSubmission.id}/respond`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        // body: JSON.stringify({ response }),
      })

      if (response.ok) {
        toast.success("Response sent successfully")
        setSubmissions(
          submissions.map((s) => (s.id === selectedSubmission.id ? { ...s, response, isResolved: true } : s)),
        )
        setSelectedSubmission({
          ...selectedSubmission,
          response,
          isResolved: true,
        })
      } else {
        toast.error("Failed to send response")
      }
    } catch (error) {
      console.error("Error sending response:", error)
      toast.error("An error occurred while sending the response")
    } finally {
      setIsSending(false)
    }
  }

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      general: "General Inquiry",
      support: "Customer Support",
      feedback: "Feedback",
      billing: "Billing Question",
      partnerships: "Partnerships",
    }

    return categories[category] || category
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      general: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300",
      support: "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300",
      feedback: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300",
      billing: "bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300",
      partnerships: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-300",
    }

    return colors[category] || "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
  }

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-900 rounded-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">Contact Submissions</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by name or email"
              className="pl-10 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div className="flex gap-2">
            <Select
              value={filterStatus}
              onValueChange={(value) => {
                setFilterStatus(value)
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Messages</SelectItem>
                <SelectItem value="unread">Unread</SelectItem>
                <SelectItem value="read">Read</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="unresolved">Unresolved</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("")
                setFilterStatus("all")
                setCurrentPage(1)
                fetchSubmissions()
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center min-h-[400px]">
          <BouncingDotsLoader color="primary" />
        </div>
      ) : submissions.length === 0 ? (
        <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
              <MailIcon className="h-8 w-8 text-indigo-500" />
            </div>
            <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">No Messages Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {filterStatus !== "all"
                ? `There are no ${filterStatus} messages.`
                : searchQuery
                  ? `No results found for "${searchQuery}".`
                  : "No contact submissions have been received yet."}
            </p>
            {(filterStatus !== "all" || searchQuery) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery("")
                  setFilterStatus("all")
                  fetchSubmissions()
                }}
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Card
              key={submission.id}
              className={`w-full border-2 ${
                submission.isRead ? "border-gray-100 dark:border-gray-800" : "border-primary/30 dark:border-primary/50"
              } shadow-lg transition-all hover:shadow-md`}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row justify-between">
                  <div className="flex-grow">
                    <div className="flex items-start gap-3">
                      <div
                        className={`rounded-full p-2 ${
                          submission.isRead
                            ? "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                            : "bg-primary/10 text-primary"
                        }`}
                      >
                        {submission.isRead ? (
                          <MailOpenIcon className="h-5 w-5" />
                        ) : (
                          <MailClosedIcon className="h-5 w-5" />
                        )}
                      </div>

                      <div className="flex-grow">
                        <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                          <h3 className="font-semibold text-lg">{submission.subject}</h3>
                          <div className="flex gap-2 flex-wrap">
                            <Badge variant="outline" className={`${getCategoryColor(submission.category)}`}>
                              {getCategoryLabel(submission.category)}
                            </Badge>
                            {!submission.isRead && (
                              <Badge className="bg-primary/80 hover:bg-primary text-white">New</Badge>
                            )}
                            <Badge
                              variant={submission.isResolved ? "default" : "outline"}
                              className={
                                submission.isResolved
                                  ? "bg-green-500 hover:bg-green-600 text-white"
                                  : "border-yellow-500 text-yellow-500"
                              }
                            >
                              {submission.isResolved ? "Resolved" : "Pending"}
                            </Badge>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row md:items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-medium">
                            {submission.name} &lt;{submission.email}&gt;
                          </span>
                          <span className="hidden md:inline">•</span>
                          <span>{format(new Date(submission.createdAt), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>

                        <p className="mt-2 line-clamp-2 text-muted-foreground">{submission.message}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mt-4 md:mt-0">
                    <Button variant="outline" size="sm" onClick={() => handleViewDetails(submission)}>
                      <EyeIcon className="h-4 w-4 mr-2" />
                      View
                    </Button>

                    <Button
                      variant={submission.isResolved ? "destructive" : "default"}
                      size="sm"
                      onClick={() => toggleResolved(submission.id, submission.isResolved)}
                    >
                      {submission.isResolved ? (
                        <>
                          <XCircleIcon className="h-4 w-4 mr-2" />
                          Unresolve
                        </>
                      ) : (
                        <>
                          <CheckCircleIcon className="h-4 w-4 mr-2" />
                          Resolve
                        </>
                      )}
                    </Button>
                  </div>
                </div>
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

      {/* Message Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSubmission && (
            <>
              <DialogHeader>
                <DialogTitle className="text-xl">{selectedSubmission.subject}</DialogTitle>
                <DialogDescription>
                  Received from {selectedSubmission.name} ({selectedSubmission.email})
                  {selectedSubmission.phone && ` • ${selectedSubmission.phone}`}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4 py-4">
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge variant="outline" className={`${getCategoryColor(selectedSubmission.category)}`}>
                    {getCategoryLabel(selectedSubmission.category)}
                  </Badge>
                  <Badge
                    variant={selectedSubmission.isResolved ? "default" : "outline"}
                    className={
                      selectedSubmission.isResolved
                        ? "bg-green-500 hover:bg-green-600 text-white"
                        : "border-yellow-500 text-yellow-500"
                    }
                  >
                    {selectedSubmission.isResolved ? "Resolved" : "Pending"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {format(new Date(selectedSubmission.createdAt), "MMMM d, yyyy 'at' h:mm a")}
                  </span>
                </div>

                <Card>
                  <CardContent className="p-4 whitespace-pre-wrap">{selectedSubmission.message}</CardContent>
                </Card>

                {selectedSubmission.response && (
                  <div className="mt-6">
                    <h4 className="text-sm font-medium mb-2">Your Response:</h4>
                    <Card className="bg-primary/5">
                      <CardContent className="p-4 whitespace-pre-wrap">{selectedSubmission.response}</CardContent>
                    </Card>
                  </div>
                )}

                {!selectedSubmission.response && (
                  <div className="mt-6 space-y-2">
                    <h4 className="text-sm font-medium">Send a Response:</h4>
                    <Textarea
                      value={response}
                      onChange={(e) => setResponse(e.target.value)}
                      placeholder="Type your response here..."
                      className="min-h-[150px]"
                    />
                  </div>
                )}
              </div>

              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                  Close
                </Button>

                <Button
                  variant={selectedSubmission.isResolved ? "destructive" : "default"}
                  onClick={() => toggleResolved(selectedSubmission.id, selectedSubmission.isResolved)}
                >
                  {selectedSubmission.isResolved ? (
                    <>
                      <XCircleIcon className="h-4 w-4 mr-2" />
                      Mark as Unresolved
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-4 w-4 mr-2" />
                      Mark as Resolved
                    </>
                  )}
                </Button>

                {!selectedSubmission.response && (
                  <Button disabled={!response.trim() || isSending} onClick={sendResponse}>
                    {isSending ? (
                      <>
                        <svg
                          className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        Sending...
                      </>
                    ) : (
                      <>
                        <CheckIcon className="h-4 w-4 mr-2" />
                        Send Response
                      </>
                    )}
                  </Button>
                )}
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

