"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Check, Loader2, RefreshCw, Search, Type } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Label } from "@/components/ui/label"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Input } from "@/app/components/ui/input"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""
const GOOGLE_FONTS_API_URL = "https://www.googleapis.com/webfonts/v1/webfonts"

interface FontVariant {
  variant: string
  file: string
}

interface GoogleFont {
  family: string
  category: string
  variants: string[]
  subsets: string[]
  files: Record<string, string>
}

interface FontEntity {
  id: number
  family: string
  category: string
  variants: string
  subsets: string
  files: string
  isActive: boolean
  lastUpdated: string
}

export default function AdminFontPage() {
  const [fonts, setFonts] = useState<GoogleFont[]>([])
  const [filteredFonts, setFilteredFonts] = useState<GoogleFont[]>([])
  const [currentFont, setCurrentFont] = useState<GoogleFont | null>(null)
  const [activeFont, setActiveFont] = useState<FontEntity | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [previewText, setPreviewText] = useState("The quick brown fox jumps over the lazy dog")
  const [loadedFonts, setLoadedFonts] = useState<Set<string>>(new Set())

  const { getToken } = useAuth()
  const itemsPerPage = 10

  useEffect(() => {
    fetchFonts()
    fetchActiveFont()
  }, [])

  useEffect(() => {
    filterFonts()
  }, [fonts, searchQuery, categoryFilter])

  useEffect(() => {
    // Load fonts for current page
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const currentPageFonts = filteredFonts.slice(startIndex, endIndex)

    currentPageFonts.forEach((font) => {
      if (!loadedFonts.has(font.family)) {
        loadFont(font)
        setLoadedFonts((prev) => new Set([...prev, font.family]))
      }
    })
  }, [filteredFonts, currentPage, loadedFonts])

  const fetchFonts = async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/BaseLayout/GoogleFonts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setFonts(data.items)
        setFilteredFonts(data.items)
        setTotalPages(Math.ceil(data.items.length / itemsPerPage))
      } else {
        
        const data : string = await response.text();
        toast.error(data)
      }
    } catch (error) {
      console.error("Error fetching fontss:", error)
      toast.error("Failed to load fonts. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchActiveFont = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/BaseLayout/Active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActiveFont(data)
      }
    } catch (error) {
      console.error("Error fetching active font:", error)
    }
  }

  const filterFonts = () => {
    let filtered = [...fonts]

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter((font) => font.family.toLowerCase().includes(query))
    }

    // Apply category filter
    if (categoryFilter !== "all") {
      filtered = filtered.filter((font) => font.category.toLowerCase() === categoryFilter.toLowerCase())
    }

    setFilteredFonts(filtered)
    setTotalPages(Math.ceil(filtered.length / itemsPerPage))
    setCurrentPage(1) // Reset to first page when filters change
  }

  const loadFont = (font: GoogleFont) => {
    // Create a link element for the font
    const link = document.createElement("link")
    link.href = `https://fonts.googleapis.com/css2?family=${font.family.replace(/ /g, "+")}:wght@400;700&display=swap`
    link.rel = "stylesheet"
    document.head.appendChild(link)
  }

  const handleSelectFont = (font: GoogleFont) => {
    setCurrentFont(font)
    setIsAlertOpen(true)
  }

  const saveSelectedFont = async () => {
    if (!currentFont) return

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const fontData = {
        family: currentFont.family,
        category: currentFont.category,
        variants: JSON.stringify(currentFont.variants),
        subsets: JSON.stringify(currentFont.subsets),
        files: JSON.stringify(currentFont.files),
      }

      const response = await fetch(`${API_BASE_URL}/BaseLayout/Activate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(fontData),
      })

      if (response.ok) {
        toast.success(`Font "${currentFont.family}" activated successfully`)
        await fetchActiveFont()
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to activate font")
      }
    } catch (error) {
      console.error("Error activating font:", error)
      toast.error("An error occurred while activating the font")
    } finally {
      setIsSaving(false)
      setIsAlertOpen(false)
    }
  }

  const getFontStyle = (fontFamily: string) => {
    return {
      fontFamily: `"${fontFamily}", ${getFontCategory(fontFamily)}`,
    }
  }

  const getFontCategory = (fontFamily: string) => {
    const font = fonts.find((f) => f.family === fontFamily)
    return font ? font.category : "sans-serif"
  }

  const renderPagination = () => {
    const pages = []
    const maxVisiblePages = 5

    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2))
    const endPage = Math.min(totalPages, startPage + maxVisiblePages - 1)

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1)
    }

    if (startPage > 1) {
      pages.push(
        <PaginationItem key="first">
          <PaginationLink onClick={() => setCurrentPage(1)}>1</PaginationLink>
        </PaginationItem>,
      )

      if (startPage > 2) {
        pages.push(
          <PaginationItem key="ellipsis-start">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationItem key={i}>
          <PaginationLink isActive={currentPage === i} onClick={() => setCurrentPage(i)}>
            {i}
          </PaginationLink>
        </PaginationItem>,
      )
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <PaginationItem key="ellipsis-end">
            <PaginationEllipsis />
          </PaginationItem>,
        )
      }

      pages.push(
        <PaginationItem key="last">
          <PaginationLink onClick={() => setCurrentPage(totalPages)}>{totalPages}</PaginationLink>
        </PaginationItem>,
      )
    }

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            />
          </PaginationItem>

          {pages}

          <PaginationItem>
            <PaginationNext
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-900 rounded-md">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">Font Management</h1>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search fonts..."
              className="pl-10 w-full md:w-[250px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="serif">Serif</SelectItem>
              <SelectItem value="sans-serif">Sans Serif</SelectItem>
              <SelectItem value="display">Display</SelectItem>
              <SelectItem value="handwriting">Handwriting</SelectItem>
              <SelectItem value="monospace">Monospace</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchFonts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Current Active Font */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Current Active Font</CardTitle>
        </CardHeader>
        <CardContent>
          {activeFont ? (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h3 className="text-2xl font-bold" style={getFontStyle(activeFont.family)}>
                    {activeFont.family}
                  </h3>
                  <p className="text-muted-foreground">Category: {activeFont.category}</p>
                </div>
                <Badge className="bg-green-500 text-white px-3 py-1 rounded-full">Active</Badge>
              </div>

              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                <p className="text-lg" style={getFontStyle(activeFont.family)}>
                  {previewText}
                </p>
              </div>

              <div className="text-sm text-muted-foreground">
                Last updated: {new Date(activeFont.lastUpdated).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <Type className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Active Font</h3>
              <p className="text-muted-foreground text-center mb-4">
                You haven't selected a font yet. Choose one from the list below.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preview Text Input */}
      <div className="mb-6">
        <Label htmlFor="preview-text">Preview Text</Label>
        <Input
          id="preview-text"
          value={previewText}
          onChange={(e) => setPreviewText(e.target.value)}
          placeholder="Enter text to preview fonts"
          className="mt-1"
        />
      </div>

      {/* Font List */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Available Fonts</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <BouncingDotsLoader color="primary" />
            </div>
          ) : filteredFonts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Type className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Fonts Found</h3>
              <p className="text-muted-foreground text-center">
                No fonts match your search criteria. Try adjusting your filters.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filteredFonts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((font) => (
                <div
                  key={font.family}
                  className={`p-4 border rounded-md hover:border-primary transition-colors ${
                    activeFont?.family === font.family
                      ? "border-primary bg-primary/5"
                      : "border-gray-200 dark:border-gray-700"
                  }`}
                >
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-xl font-bold" style={getFontStyle(font.family)}>
                        {font.family}
                      </h3>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {font.category}
                        </Badge>
                        <Badge
                          variant="outline"
                          className="bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
                        >
                          {font.variants.length} variants
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant={activeFont?.family === font.family ? "outline" : "default"}
                      onClick={() => handleSelectFont(font)}
                      disabled={activeFont?.family === font.family}
                    >
                      {activeFont?.family === font.family ? (
                        <>
                          <Check className="h-4 w-4 mr-2" />
                          Active
                        </>
                      ) : (
                        "Activate"
                      )}
                    </Button>
                  </div>

                  <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-md">
                    <p className="text-lg" style={getFontStyle(font.family)}>
                      {previewText}
                    </p>
                  </div>
                </div>
              ))}

              <div className="flex justify-center mt-6">{renderPagination()}</div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Activate Font</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to activate "{currentFont?.family}"? This will change the font across your entire
              website.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={saveSelectedFont} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Activating...
                </>
              ) : (
                "Activate Font"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// This component is missing in the code, so we'll define it here
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <span className={`inline-flex items-center ${className}`}>{children}</span>
}

