"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { Check, Edit, Loader2, Plus, Save, Trash2, X } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"


import { Input } from "@/app/components/ui/input"
import { useTheme } from "@/app/lib/theme-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"

const API_BASE_URL = "https://localhost:7007/api/BaseLayout"

// Available Tailwind colors for the strip
const colorOptions = [
  { value: "slate", label: "Slate", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "gray", label: "Gray", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "zinc", label: "Zinc", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "neutral", label: "Neutral", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "stone", label: "Stone", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "red", label: "Red", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "orange", label: "Orange", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "amber", label: "Amber", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "yellow", label: "Yellow", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "lime", label: "Lime", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "green", label: "Green", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "emerald", label: "Emerald", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "teal", label: "Teal", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "cyan", label: "Cyan", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "sky", label: "Sky", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "blue", label: "Blue", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "indigo", label: "Indigo", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "violet", label: "Violet", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "purple", label: "Purple", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "fuchsia", label: "Fuchsia", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "pink", label: "Pink", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
  { value: "rose", label: "Rose", shades: [50, 100, 200, 300, 400, 500, 600, 700, 800, 900] },
]

// Basic colors
const basicTextColors = [
  { value: "text-white", label: "White" },
  { value: "text-black", label: "Black" },
]

interface StripDTO {
  id: number
  texts: StripTextEntity[]
  backgroundColor: string
  textColor: string
  isActive: boolean
}

interface StripTextEntity {
  id: number
  text: string
  stripId: number
}

export default function AdminStripPage() {
  const [strip, setStrip] = useState<StripDTO | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [textToDelete, setTextToDelete] = useState<number | null>(null)
  const [newText, setNewText] = useState("")
  const [editingTextId, setEditingTextId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState("")

  // Color state
  const [lightBgColor, setLightBgColor] = useState("bg-slate-900")
  const [darkBgColor, setDarkBgColor] = useState("bg-slate-700")
  const [textColor, setTextColor] = useState("text-white")

  const [isActive, setIsActive] = useState(false)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)

  const { getToken } = useAuth()
  const { theme } = useTheme()

  useEffect(() => {
    fetchStrip()
  }, [])

  // Auto-rotate through texts for preview
  useEffect(() => {
    if (!strip?.texts.length) return

    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % strip.texts.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [strip])

  // Parse background color into light and dark components when strip is loaded
  useEffect(() => {
    if (strip?.backgroundColor) {
      const bgParts = strip.backgroundColor.split(" ")
      if (bgParts.length >= 2) {
        // Extract light and dark mode classes
        const lightPart = bgParts.find((part) => !part.startsWith("dark:"))
        const darkPart = bgParts.find((part) => part.startsWith("dark:"))?.replace("dark:", "")

        if (lightPart) setLightBgColor(lightPart)
        if (darkPart) setDarkBgColor(darkPart)
      } else {
        // If only one class, use it for both
        setLightBgColor(strip.backgroundColor)
        setDarkBgColor(strip.backgroundColor.replace("bg-", "bg-"))
      }
    }
  }, [strip])

  const fetchStrip = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/strip`)

      if (response.ok) {
        const data: StripDTO = await response.json()
        setStrip(data)
        setTextColor(data.textColor || "text-white")
        setIsActive(data.isActive)
      } else {
        toast.error("Failed to fetch strip data")
      }
    } catch (error) {
      console.error("Error fetching strip:", error)
      toast.error("An error occurred while fetching strip data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUpdateStrip = async () => {
    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      // Combine light and dark background colors
      const backgroundColor = `${lightBgColor} dark:${darkBgColor}`

      const stripData = {
        id: strip?.id || 0,
        backgroundColor,
        textColor,
        isActive,
      }

      const response = await fetch(`${API_BASE_URL}/strip`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(stripData),
      })

      if (response.ok) {
        toast.success("Strip updated successfully")
        await fetchStrip()
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to update strip")
      }
    } catch (error) {
      console.error("Error updating strip:", error)
      toast.error("An error occurred while updating the strip")
    } finally {
      setIsSaving(false)
    }
  }

  const handleAddText = async () => {
    if (!newText.trim()) {
      toast.error("Text cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/strip/text`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newText),
      })

      if (response.ok) {
        toast.success("Text added successfully")
        setNewText("")
        await fetchStrip()
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to add text")
      }
    } catch (error) {
      console.error("Error adding text:", error)
      toast.error("An error occurred while adding text")
    } finally {
      setIsSaving(false)
    }
  }

  const handleUpdateText = async () => {
    if (!editingText.trim() || editingTextId === null) {
      toast.error("Text cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/strip/text/${editingTextId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingText),
      })

      if (response.ok) {
        toast.success("Text updated successfully")
        setEditingTextId(null)
        setEditingText("")
        await fetchStrip()
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to update text")
      }
    } catch (error) {
      console.error("Error updating text:", error)
      toast.error("An error occurred while updating text")
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteText = async () => {
    if (textToDelete === null) return

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/strip/text/${textToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Text deleted successfully")
        setIsDeleteDialogOpen(false)
        setTextToDelete(null)
        await fetchStrip()
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to delete text")
      }
    } catch (error) {
      console.error("Error deleting text:", error)
      toast.error("An error occurred while deleting text")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmDeleteText = (id: number) => {
    setTextToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const startEditText = (id: number, text: string) => {
    setEditingTextId(id)
    setEditingText(text)
  }

  const cancelEditText = () => {
    setEditingTextId(null)
    setEditingText("")
  }

  // Get current background color based on theme
  const getCurrentBgColor = () => {
    return theme === "dark" ? darkBgColor : lightBgColor
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <BouncingDotsLoader color="primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-900 rounded-md">
      <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200 mb-6">Top Strip Management</h1>

      {/* Strip Preview */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Strip Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`w-full p-3 flex justify-center items-center ${getCurrentBgColor()} ${textColor} transition-all duration-500`}
          >
            {strip?.texts && strip.texts.length > 0 ? (
              <p className="text-center font-medium">{strip.texts[currentTextIndex]?.text || "No text available"}</p>
            ) : (
              <p className="text-center font-medium">No promotional texts available</p>
            )}
          </div>
          <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`}></div>
              <span className="text-sm font-medium">Status: {isActive ? "Active" : "Inactive"}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">
                Current theme: {theme === "dark" ? "Dark mode" : "Light mode"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Strip Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Strip Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <Label htmlFor="strip-status">Strip Status</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{isActive ? "Active" : "Inactive"}</span>
                    <Switch id="strip-status" checked={isActive} onCheckedChange={setIsActive} disabled={isSaving} />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable or disable the promotional strip across your website.
                </p>
              </div>

              {/* Background Color Selection */}
              <div className="space-y-2">
                <Label>Background Color</Label>
                <Tabs defaultValue="light">
                  <TabsList >
                    <TabsTrigger value="light">Light Mode</TabsTrigger>
                    <TabsTrigger value="dark">Dark Mode</TabsTrigger>
                  </TabsList>

                  <TabsContent value="light" >
                    <p className="text-sm text-muted-foreground">Select the background color for light mode:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.map((colorGroup) => (
                        <div key={colorGroup.value} className="space-y-2">
                          <h4 className="text-sm font-medium">{colorGroup.label}</h4>
                          <div className="flex flex-wrap gap-1">
                            {colorGroup.shades.map((shade) => {
                              const colorClass = `bg-${colorGroup.value}-${shade}`
                              const isSelected = lightBgColor === colorClass
                              return (
                                <button
                                  key={`${colorGroup.value}-${shade}`}
                                  className={`w-6 h-6 rounded-md ${colorClass} flex items-center justify-center ${isSelected ? "ring-2 ring-primary" : ""}`}
                                  onClick={() => setLightBgColor(colorClass)}
                                  title={`${colorGroup.label} ${shade}`}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Selected: {lightBgColor}</p>
                    </div>
                  </TabsContent>

                  <TabsContent value="dark" >
                    <p className="text-sm text-muted-foreground">Select the background color for dark mode:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {colorOptions.map((colorGroup) => (
                        <div key={colorGroup.value} className="space-y-2">
                          <h4 className="text-sm font-medium">{colorGroup.label}</h4>
                          <div className="flex flex-wrap gap-1">
                            {colorGroup.shades.map((shade) => {
                              const colorClass = `bg-${colorGroup.value}-${shade}`
                              const isSelected = darkBgColor === colorClass
                              return (
                                <button
                                  key={`${colorGroup.value}-${shade}`}
                                  className={`w-6 h-6 rounded-md ${colorClass} flex items-center justify-center ${isSelected ? "ring-2 ring-primary" : ""}`}
                                  onClick={() => setDarkBgColor(colorClass)}
                                  title={`${colorGroup.label} ${shade}`}
                                >
                                  {isSelected && <Check className="h-3 w-3 text-white" />}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-2">
                      <p className="text-sm font-medium">Selected: {darkBgColor}</p>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Text Color Selection */}
              <div className="space-y-2">
                <Label>Text Color</Label>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Select the text color:</p>

                  {/* Basic text colors (white/black) */}
                  <div className="flex gap-2 mb-4">
                    {basicTextColors.map((color) => {
                      const isSelected = textColor === color.value
                      return (
                        <button
                          key={color.value}
                          className={`px-3 py-2 rounded-md ${color.value === "text-white" ? "bg-gray-800" : "bg-white border border-gray-200"} ${isSelected ? "ring-2 ring-primary" : ""}`}
                          onClick={() => setTextColor(color.value)}
                        >
                          <span className={color.value === "text-white" ? "text-white" : "text-black"}>
                            {color.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>

                  {/* Tailwind text colors */}
                  <div className="grid grid-cols-2 gap-2">
                    {colorOptions.map((colorGroup) => (
                      <div key={colorGroup.value} className="space-y-2">
                        <h4 className="text-sm font-medium">{colorGroup.label}</h4>
                        <div className="flex flex-wrap gap-1">
                          {colorGroup.shades.map((shade) => {
                            const colorClass = `text-${colorGroup.value}-${shade}`
                            const isSelected = textColor === colorClass
                            return (
                              <button
                                key={`${colorGroup.value}-${shade}`}
                                className={`w-6 h-6 rounded-md bg-gray-100 dark:bg-gray-800 flex items-center justify-center ${isSelected ? "ring-2 ring-primary" : ""}`}
                                onClick={() => setTextColor(colorClass)}
                                title={`${colorGroup.label} ${shade}`}
                              >
                                <span className={colorClass}>A</span>
                              </button>
                            )
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-2">
                    <p className="text-sm font-medium">Selected: {textColor}</p>
                  </div>
                </div>
              </div>

              <Button onClick={handleUpdateStrip} disabled={isSaving} className="w-full">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Strip Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Promotional Texts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="new-text">Add New Text</Label>
                <div className="flex gap-2">
                  <Input
                    id="new-text"
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    placeholder="Enter promotional text"
                    disabled={isSaving}
                  />
                  <Button onClick={handleAddText} disabled={isSaving || !newText.trim()} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Add promotional messages to display in the top strip. These will rotate automatically.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Manage Texts</Label>
                {!strip?.texts || strip.texts.length === 0 ? (
                  <div className="p-4 border border-dashed rounded-md text-center">
                    <p className="text-muted-foreground">No promotional texts added yet.</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                    {strip.texts.map((item) => (
                      <div key={item.id} className="p-3 border rounded-md bg-gray-50 dark:bg-gray-800">
                        {editingTextId === item.id ? (
                          <div className="flex gap-2">
                            <Input
                              value={editingText}
                              onChange={(e) => setEditingText(e.target.value)}
                              disabled={isSaving}
                              autoFocus
                            />
                            <Button
                              onClick={handleUpdateText}
                              disabled={isSaving || !editingText.trim()}
                              variant="outline"
                              size="icon"
                            >
                              <Save className="h-4 w-4" />
                            </Button>
                            <Button onClick={cancelEditText} disabled={isSaving} variant="outline" size="icon">
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-between items-center">
                            <p className="flex-grow">{item.text}</p>
                            <div className="flex gap-1">
                              <Button onClick={() => startEditText(item.id, item.text)} variant="ghost" size="icon">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button onClick={() => confirmDeleteText(item.id)} variant="ghost" size="icon">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Implementation Guide */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How to implement the top strip in your layout</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>
                    To implement the top strip in your layout, add the following component to your layout file, just
                    before the main navigation bar:
                  </p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                    <code>{`<TopStrip />`}</code>
                  </pre>
                  <p>Make sure to import the TopStrip component at the top of your file:</p>
                  <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md overflow-x-auto">
                    <code>{`import TopStrip from '@/components/top-strip'`}</code>
                  </pre>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>How the strip rotation works</AccordionTrigger>
              <AccordionContent>
                <p>
                  The top strip automatically rotates through all the promotional texts you've added. Each text is
                  displayed for a few seconds before transitioning to the next one. This creates an engaging way to
                  showcase multiple promotional messages without taking up additional space.
                </p>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Understanding light and dark mode colors</AccordionTrigger>
              <AccordionContent>
                <p>
                  The strip supports different colors for light and dark modes. When you select colors in the admin
                  panel:
                </p>
                <ul className="list-disc pl-6 space-y-2 mt-2">
                  <li>Light mode colors are applied when the user's theme is set to light</li>
                  <li>Dark mode colors are applied when the user's theme is set to dark</li>
                  <li>
                    The colors are combined into a single string like <code>bg-blue-500 dark:bg-blue-700</code>
                  </li>
                  <li>This approach ensures your promotional strip looks great in both light and dark themes</li>
                </ul>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Promotional Text</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this promotional text? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteText} disabled={isSaving} className="bg-red-600 hover:bg-red-700">
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

