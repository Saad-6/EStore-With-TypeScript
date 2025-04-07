"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import {
  Edit,
  Save,
  X,
  LinkIcon,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MessageSquare,
  Globe,
  ShieldCheck,
  Headphones,
  Loader2,
  GripVertical,
  InfoIcon,
  ArrowUp,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Input } from "@/app/components/ui/input"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

// Link types and their display names
const linkTypes: Record<string, string> = {
  universal: "Universal",
  customer_service: "Customer Service",
  quick_access: "Quick Access",
}

interface LinkDTO {
  id: number
  name: string
  url: string
  linkType: string
  displayOrder: number
  isActive?: boolean
}

interface IconDTO {
  id: number
  platform: string
  linkUrl: string
  isActive: boolean
  displayOrder: number
}

export default function AdminFooterPage() {
  const [allLinks, setAllLinks] = useState<LinkDTO[]>([])
  const [activeLinks, setActiveLinks] = useState<LinkDTO[]>([])
  const [icons, setIcons] = useState<IconDTO[]>([
    { id: 1, platform: "Facebook", linkUrl: "#", isActive: false, displayOrder: 1 },
    { id: 2, platform: "X", linkUrl: "#", isActive: false, displayOrder: 2 },
    { id: 3, platform: "Instagram", linkUrl: "#", isActive: false, displayOrder: 3 },
    { id: 4, platform: "LinkedIn", linkUrl: "#", isActive: false, displayOrder: 4 },
    { id: 5, platform: "Whatsapp", linkUrl: "#", isActive: false, displayOrder: 5 },
  ])
  const [aboutUsText, setAboutUsText] = useState<string | null>("")
  const [editingAboutUs, setEditingAboutUs] = useState(false)
  const [editingIconId, setEditingIconId] = useState<number | null>(null)
  const [editIconUrl, setEditIconUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertAction, setAlertAction] = useState<() => Promise<void>>(() => Promise.resolve())
  const [alertMessage, setAlertMessage] = useState({ title: "", description: "" })
  const [reorderMode, setReorderMode] = useState(false)
  const [dragEnabled, setDragEnabled] = useState(false)
  const [currentTab, setCurrentTab] = useState("links")

  const { getToken } = useAuth()

  useEffect(() => {
    fetchFooterData()
  }, [])

  const fetchFooterData = async () => {
    setIsLoading(true)
    try {
      await Promise.all([fetchAllLinks(), fetchActiveLinks(), fetchIcons(), fetchAboutUs()])
    } catch (error) {
      console.error("Error fetching footer data:", error)
      toast.error("Failed to load footer data")
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAllLinks = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Footer/AllFooterLinks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAllLinks(data)
      } else {
        throw new Error("Failed to fetch all footer links")
      }
    } catch (error) {
      console.error("Error fetching all links:", error)
      throw error
    }
  }

  const fetchActiveLinks = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Footer/ActiveFooterLinks`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setActiveLinks(data)
      } else {
        throw new Error("Failed to fetch active footer links")
      }
    } catch (error) {
      console.error("Error fetching active links:", error)
      throw error
    }
  }

  const fetchIcons = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Footer/Icons`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setIcons(data)
      } else {
        throw new Error("Failed to fetch footer icons")
      }
    } catch (error) {
      console.error("Error fetching icons:", error)
      throw error
    }
  }

  const fetchAboutUs = async () => {
    try {
      setIsSaving(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Footer/Aboutus`, {
        method: "GET",
      })
      if (response.ok) {
        setEditingAboutUs(false)
        if (response.status === 204) {
          setAboutUsText("") // Set default empty value
          return
        }
        const data = await response.json()
        setAboutUsText(data)
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to update About Us text")
      }
    } catch (error) {
      console.error("Error updating About Us text:", error)
      toast.error("An error occurred while updating the About Us text")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmToggleLink = (linkId: number, currentStatus: boolean) => {
    const actionText = currentStatus ? "deactivate" : "activate"
    const linkName = allLinks.find((l) => l.id === linkId)?.name || "this link"

    setAlertMessage({
      title: `${currentStatus ? "Deactivate" : "Activate"} Link`,
      description: `Are you sure you want to ${actionText} "${linkName}"? ${
        currentStatus ? "It will be removed from the footer." : "It will be visible in the footer."
      }`,
    })

    setAlertAction(() => async () => {
      await toggleLinkStatus(linkId, !currentStatus)
    })

    setIsAlertOpen(true)
  }

  const toggleLinkStatus = async (linkId: number, activate: boolean) => {
    try {
      setIsSaving(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      // Optimistically update UI
      if (activate) {
        const linkToActivate = allLinks.find((l) => l.id === linkId)
        if (linkToActivate) {
          setActiveLinks((prev) => [...prev, { ...linkToActivate, isActive: true }])
        }
      } else {
        setActiveLinks((prev) => prev.filter((l) => l.id !== linkId))
      }

      const response = await fetch(`${API_BASE_URL}/Footer/Link/Status?linkId=${linkId}&activate=${activate}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success(`Link ${activate ? "activated" : "deactivated"} successfully`)
        await Promise.all([fetchAllLinks(), fetchActiveLinks()])
      } else {
        // Revert optimistic update
        if (activate) {
          setActiveLinks((prev) => prev.filter((l) => l.id !== linkId))
        } else {
          const linkToRestore = allLinks.find((l) => l.id === linkId)
          if (linkToRestore) {
            setActiveLinks((prev) => [...prev, { ...linkToRestore, isActive: true }])
          }
        }
        const errorData = await response.json()
        toast.error(errorData || `Failed to ${activate ? "activate" : "deactivate"} link`)
      }
    } catch (error) {
      console.error(`Error toggling link status:`, error)
      toast.error(`An error occurred while updating link status`)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChangeOrder = async (linkId: number, direction: "up" | "down") => {
    const link = allLinks.find((l) => l.id === linkId)
    if (!link) return

    const currentOrder = link.displayOrder
    const newOrder = direction === "up" ? currentOrder - 1 : currentOrder + 1

    // Check if the new order is valid
    if (newOrder < 1) {
      toast.error("Cannot move link outside valid range")
      return
    }

    // Find the link that currently has the target order
    const linkToSwapWith = allLinks.find((l) => l.displayOrder === newOrder && l.linkType === link.linkType)
    if (!linkToSwapWith) {
      toast.error("Could not find a link to swap positions with")
      return
    }

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      // First update the current link's order
      const response1 = await fetch(`${API_BASE_URL}/Footer/order?linkId=${linkId}&displayOrder=${newOrder}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response1.ok) {
        const errorData = await response1.json()
        toast.error(errorData || "Failed to update first link order")
        return
      }

      // Then update the other link's order
      const response2 = await fetch(
        `${API_BASE_URL}/Footer/order?linkId=${linkToSwapWith.id}&displayOrder=${currentOrder}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response2.ok) {
        const errorData = await response2.json()
        toast.error(errorData || "Failed to update second link order")
        // Try to revert the first change
        await fetch(`${API_BASE_URL}/Footer/order?linkId=${linkId}&displayOrder=${currentOrder}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return
      }

      toast.success("Link order updated successfully")
      // Refresh all data to ensure UI is in sync with backend
      await fetchFooterData()
    } catch (error) {
      console.error("Error changing link order:", error)
      toast.error("An error occurred while updating link order")
    } finally {
      setIsSaving(false)
    }
  }

  // Handle drag and drop reordering
  const handleDragEnd = async (result: DropResult) => {
    // Dropped outside the list
    if (!result.destination) {
      return
    }

    const sourceIndex = result.source.index
    const destinationIndex = result.destination.index

    // No change
    if (sourceIndex === destinationIndex) {
      return
    }

    // Get the links of the specific type being reordered
    const linkType = result.draggableId.split("-")[0]
    console.log("Drag operation for link type:", linkType)

    // Get links based on the type
    let typeLinks
    if (linkType === "quick_access") {
      // For quick_access, get all active links that are NOT customer_service
      typeLinks = activeLinks
        .filter((link) => link.linkType !== "customer_service")
        .sort((a, b) => a.displayOrder - b.displayOrder)
    } else if (linkType === "customer_service") {
      // For customer_service, get only customer_service links
      typeLinks = activeLinks
        .filter((link) => link.linkType === "customer_service")
        .sort((a, b) => a.displayOrder - b.displayOrder)
    } else {
      // For any other type, use the original logic
      typeLinks = activeLinks
        .filter((link) => link.linkType === linkType)
        .sort((a, b) => a.displayOrder - b.displayOrder)
    }

    console.log(
      "Filtered links for drag:",
      typeLinks.map((l) => ({ id: l.id, name: l.name, type: l.linkType })),
    )
    console.log("Source index:", sourceIndex, "Destination index:", destinationIndex)

    // Get the links being swapped
    const draggedLink = typeLinks[sourceIndex]
    const targetLink = typeLinks[destinationIndex]

    if (!draggedLink || !targetLink) {
      console.error("Dragged link:", draggedLink)
      console.error("Target link:", targetLink)
      toast.error("Could not identify the links to reorder")
      return
    }

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      // First update the dragged link's order
      const response1 = await fetch(
        `${API_BASE_URL}/Footer/order?linkId=${draggedLink.id}&displayOrder=${targetLink.displayOrder}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response1.ok) {
        const errorData = await response1.json()
        toast.error(errorData || "Failed to update first link order")
        return
      }

      // Then update the target link's order
      const response2 = await fetch(
        `${API_BASE_URL}/Footer/order?linkId=${targetLink.id}&displayOrder=${draggedLink.displayOrder}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (!response2.ok) {
        const errorData = await response2.json()
        toast.error(errorData || "Failed to update second link order")
        // Try to revert the first change
        await fetch(`${API_BASE_URL}/Footer/order?linkId=${draggedLink.id}&displayOrder=${draggedLink.displayOrder}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return
      }

      toast.success("Link order updated successfully")
      // Refresh all data to ensure UI is in sync with backend
      await fetchFooterData()
    } catch (error) {
      console.error("Error changing link order:", error)
      toast.error("An error occurred while updating link order")
    } finally {
      setIsSaving(false)
    }
  }

  const toggleIconStatus = async (iconId: number, activate: boolean) => {
    const actionText = activate ? "activate" : "deactivate"

    setAlertMessage({
      title: `${activate ? "Activate" : "Deactivate"} Icon`,
      description: `Are you sure you want to ${actionText} this social media icon? ${
        activate ? "It will be visible in the footer." : "It will be removed from the footer."
      }`,
    })

    setAlertAction(() => async () => {
      try {
        setIsSaving(true)
        const token = getToken()
        if (!token) {
          toast.error("Authentication token not found")
          return
        }

        // Optimistically update UI
        setIcons(icons.map((icon) => (icon.id === iconId ? { ...icon, isActive: activate } : icon)))

        const response = await fetch(`${API_BASE_URL}/Footer/Icon/Status?iconId=${iconId}&activate=${activate}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          toast.success(`Icon ${activate ? "activated" : "deactivated"} successfully`)
        } else {
          // Revert optimistic update
          setIcons(icons.map((icon) => (icon.id === iconId ? { ...icon, isActive: !activate } : icon)))
          const errorData = await response.json()
          toast.error(errorData || `Failed to ${actionText} icon`)
        }
      } catch (error) {
        // Revert optimistic update
        setIcons(icons.map((icon) => (icon.id === iconId ? { ...icon, isActive: !activate } : icon)))
        console.error(`Error ${actionText} icon:`, error)
        toast.error(`An error occurred while ${actionText} the icon`)
      } finally {
        setIsSaving(false)
      }
    })

    setIsAlertOpen(true)
  }

  const updateIconLink = async (iconId: number) => {
    try {
      setIsSaving(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Footer/Icon/url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          iconId,
          url: editIconUrl,
        }),
      })

      if (response.ok) {
        // Update local state
        setIcons(icons.map((icon) => (icon.id === iconId ? { ...icon, linkUrl: editIconUrl } : icon)))
        setEditingIconId(null)
        toast.success("Icon URL updated successfully")
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to update icon URL")
      }
    } catch (error) {
      console.error("Error updating icon URL:", error)
      toast.error("An error occurred while updating the icon URL")
    } finally {
      setIsSaving(false)
    }
  }

  const updateAboutUs = async () => {
    try {
      setIsSaving(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Footer/Aboutus`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: aboutUsText,
        }),
      })

      if (response.ok) {
        setEditingAboutUs(false)
        toast.success("About Us text updated successfully")
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to update About Us text")
      }
    } catch (error) {
      console.error("Error updating About Us text:", error)
      toast.error("An error occurred while updating the About Us text")
    } finally {
      setIsSaving(false)
    }
  }

  const getLinkTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "universal":
        return <Globe className="h-4 w-4" />
      case "customer_service":
        return <Headphones className="h-4 w-4" />
      case "quick_access":
        return <ShieldCheck className="h-4 w-4" />
      default:
        return <LinkIcon className="h-4 w-4" />
    }
  }

  const getLinkTypeBadge = (type: string) => {
    const typeFormatted = type.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())

    let className = ""
    switch (type.toLowerCase()) {
      case "universal":
        className = "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300"
        break
      case "customer_service":
        className = "bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300"
        break
      case "quick_access":
        className = "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300"
        break
      default:
        className = "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }

    return (
      <Badge variant="outline" className={className}>
        {typeFormatted}
      </Badge>
    )
  }

  const getSocialIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case "facebook":
        return <Facebook className="h-5 w-5" />
      case "x":
        return <Twitter className="h-5 w-5" />
      case "instagram":
        return <Instagram className="h-5 w-5" />
      case "linkedin":
        return <Linkedin className="h-5 w-5" />
      case "whatsapp":
        return <MessageSquare className="h-5 w-5" />
      default:
        return <Globe className="h-5 w-5" />
    }
  }

  const isLinkActive = (linkId: number) => {
    return activeLinks.some((link) => link.id === linkId)
  }

  // Get links by type
  const getLinksByType = (type: string): LinkDTO[] => {
    return allLinks.filter((link) => link.linkType === type).sort((a, b) => a.displayOrder - b.displayOrder)
  }

  // Get active links by type for the preview
  const getActiveLinksByType = (type: string): LinkDTO[] => {
    if (type === "quick_access") {
      // For quick_access, return all active links that are NOT customer_service
      return activeLinks
        .filter((link) => link.linkType !== "customer_service")
        .sort((a, b) => a.displayOrder - b.displayOrder)
    } else if (type === "customer_service") {
      // For customer_service, return only customer_service links
      return activeLinks
        .filter((link) => link.linkType === "customer_service")
        .sort((a, b) => a.displayOrder - b.displayOrder)
    }

    // For any other type, use the original logic
    return activeLinks.filter((link) => link.linkType === type).sort((a, b) => a.displayOrder - b.displayOrder)
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
      <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200 mb-6">Footer Management</h1>

      {/* Footer Preview with Drag and Drop */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Footer Preview</CardTitle>
              <CardDescription>This shows how your footer will appear to users</CardDescription>
            </div>
            <Button
              variant={dragEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setDragEnabled(!dragEnabled)}
              disabled={isSaving}
            >
              {dragEnabled ? (
                <>
                  <X className="mr-2 h-4 w-4" />
                  Exit Drag Mode
                </>
              ) : (
                <>
                  <GripVertical className="mr-2 h-4 w-4" />
                  Enable Drag & Drop
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-8 p-6 border rounded-md bg-gray-800 text-white">
            {/* About Us Section */}
            <div className="w-full md:w-1/4">
              <h3 className="text-lg font-semibold mb-4">About Us</h3>
              <p className="text-gray-400 text-sm">{aboutUsText || "No about us text available"}</p>
            </div>

            {/* Quick Links Section with Drag and Drop */}
            <div className="w-full md:w-1/4">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              {dragEnabled ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="quick_access-links" direction="vertical">
                    {(provided) => (
                      <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                        {getActiveLinksByType("quick_access").map((link, index) => (
                          <Draggable
                            key={`quick_access-${link.id}`}
                            draggableId={`quick_access-${link.id}`}
                            index={index}
                            isDragDisabled={isSaving}
                          >
                            {(provided, snapshot) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  snapshot.isDragging ? "bg-blue-900 border border-blue-500" : "hover:bg-gray-700"
                                }`}
                              >
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-300">{link.name}</span>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <ul className="space-y-2">
                  {getActiveLinksByType("quick_access").map((link) => (
                    <li key={link.id} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Customer Service Links Section with Drag and Drop */}
            <div className="w-full md:w-1/4">
              <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
              {dragEnabled ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="customer_service-links" direction="vertical">
                    {(provided) => (
                      <ul ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
                        {getActiveLinksByType("customer_service").map((link, index) => (
                          <Draggable
                            key={`customer_service-${link.id}`}
                            draggableId={`customer_service-${link.id}`}
                            index={index}
                            isDragDisabled={isSaving}
                          >
                            {(provided, snapshot) => (
                              <li
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`flex items-center gap-2 p-2 rounded ${
                                  snapshot.isDragging ? "bg-blue-900 border border-blue-500" : "hover:bg-gray-700"
                                }`}
                              >
                                <GripVertical className="h-4 w-4 text-gray-400" />
                                <span className="text-gray-300">{link.name}</span>
                              </li>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </ul>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                <ul className="space-y-2">
                  {getActiveLinksByType("customer_service").map((link) => (
                    <li key={link.id} className="text-gray-400 hover:text-white transition-colors">
                      {link.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Social Media Icons Section */}
            <div className="w-full md:w-1/4">
              <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
              <div className="flex space-x-4">
                {icons
                  .filter((icon) => icon.isActive)
                  .sort((a, b) => a.displayOrder - b.displayOrder)
                  .map((icon) => (
                    <div key={icon.id} className="text-gray-400 hover:text-white transition-colors">
                      {getSocialIcon(icon.platform)}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {dragEnabled && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                <InfoIcon className="h-4 w-4 mr-2" />
                Drag and drop the footer links to reorder them. Changes are saved automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="links">
        <TabsList>
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
        </TabsList>

        {/* Links Tab */}
        <TabsContent value="links">
          <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl">Footer Links</CardTitle>
              </div>
              <CardDescription>Manage which links appear in your footer</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Links by Type */}
                {Object.entries(linkTypes).map(([type, displayName]) => {
                  const typeLinks = getLinksByType(type)

                  // Skip rendering this section if there are no links of this type
                  if (typeLinks.length === 0) {
                    return null
                  }

                  return (
                    <div key={type} className="space-y-2">
                      <h3 className="font-medium flex items-center">
                        <Badge variant="outline" className="mr-2">
                          {displayName}
                        </Badge>
                        Links ({typeLinks.length})
                      </h3>

                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[200px]">Name</TableHead>
                            <TableHead>URL</TableHead>
                            <TableHead className="w-[100px]">Order</TableHead>
                            <TableHead className="w-[100px]">Status</TableHead>
                            {reorderMode && <TableHead className="w-[100px]">Reorder</TableHead>}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {typeLinks.map((link) => (
                            <TableRow key={`${link.id}-${link.name}`}>
                              <TableCell className="font-medium">
                                <div className="flex items-center">
                                  {getLinkTypeIcon(link.linkType)}
                                  <span className="ml-2">{link.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <a
                                  href={link.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline"
                                >
                                  {link.url}
                                </a>
                              </TableCell>
                              <TableCell>{link.displayOrder}</TableCell>
                              <TableCell>
                                <Switch
                                  checked={isLinkActive(link.id)}
                                  onCheckedChange={() => confirmToggleLink(link.id, isLinkActive(link.id))}
                                  disabled={isSaving}
                                />
                              </TableCell>
                              {reorderMode && (
                                <TableCell>
                                  <div className="flex gap-1">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleChangeOrder(link.id, "up")}
                                      disabled={isSaving || link.displayOrder === 1}
                                    >
                                      <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleChangeOrder(link.id, "down")}
                                      disabled={isSaving}
                                    >
                                      <ChevronDown className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              )}
              
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social">
          <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Social Media Icons</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Manage Social Media Icons</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Toggle icons to show or hide them in the footer. Update the URLs to link to your social media
                    profiles.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {icons.map((icon) => (
                    <Card
                      key={icon.id}
                      className={`border ${icon.isActive ? "border-primary" : "border-gray-200 dark:border-gray-700"}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <div
                              className={`p-2 rounded-full ${icon.isActive ? "bg-primary/10 text-primary" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}
                            >
                              {getSocialIcon(icon.platform)}
                            </div>
                            <span className="ml-3 font-medium">{icon.platform}</span>
                          </div>
                          <div className="flex items-center">
                            <Label htmlFor={`icon-${icon.id}`} className="mr-2 text-sm">
                              {icon.isActive ? "Active" : "Inactive"}
                            </Label>
                            <Switch
                              id={`icon-${icon.id}`}
                              checked={icon.isActive}
                              onCheckedChange={(checked) => toggleIconStatus(icon.id, checked)}
                              disabled={isSaving}
                            />
                          </div>
                        </div>

                        {editingIconId === icon.id ? (
                          <div className="space-y-2">
                            <Label htmlFor={`icon-url-${icon.id}`} className="text-sm">
                              URL
                            </Label>
                            <div className="flex gap-2">
                              <Input
                                id={`icon-url-${icon.id}`}
                                value={editIconUrl}
                                onChange={(e) => setEditIconUrl(e.target.value)}
                                placeholder="https://..."
                                className="flex-1"
                              />
                              <Button
                                variant="outline"
                                size="icon"
                                onClick={() => {
                                  setEditingIconId(null)
                                  setEditIconUrl("")
                                }}
                                disabled={isSaving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="default"
                                size="icon"
                                onClick={() => updateIconLink(icon.id)}
                                disabled={isSaving || !editIconUrl.trim()}
                              >
                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <a
                              href={icon.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline truncate max-w-[200px]"
                            >
                              {icon.linkUrl}
                            </a>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setEditingIconId(icon.id)
                                setEditIconUrl(icon.linkUrl)
                              }}
                              disabled={isSaving}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit URL
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* About Us Tab */}
        <TabsContent value="about">
          <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">About Us Text</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Manage About Us Text</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Update the About Us text that appears in the footer.
                  </p>
                </div>

                {editingAboutUs ? (
                  <div className="space-y-4">
                    <Textarea
                      value={aboutUsText ?? ""}
                      onChange={(e) => setAboutUsText(e.target.value)}
                      placeholder="Enter about us text..."
                      className="min-h-[150px]"
                    />
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setEditingAboutUs(false)} disabled={isSaving}>
                        Cancel
                      </Button>
                      <Button onClick={updateAboutUs} disabled={isSaving || !aboutUsText?.trim()}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-900 p-4 rounded-md border border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="text-lg font-medium">Current About Us Text</h3>
                      <Button variant="outline" size="sm" onClick={() => setEditingAboutUs(true)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                    </div>
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{aboutUsText}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Implementation Guide */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg mt-6">
        <CardHeader>
          <CardTitle className="text-xl">Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How to implement the footer in your layout</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>
                    The footer is already integrated with your existing layout. No additional implementation is
                    required.
                  </p>
                  <p>
                    The Footer component fetches the active links, social media icons, and About Us text from the API
                    and renders them based on their type and display order.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Understanding link types</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>The footer organizes links into different types:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Universal:</strong> General links that appear in the main footer section
                    </li>
                    <li>
                      <strong>Customer Service:</strong> Links related to customer support (Contact, FAQ, etc.)
                    </li>
                    <li>
                      <strong>Quick Access:</strong> Links for quick access to important pages (Terms & Conditions,
                      etc.)
                    </li>
                  </ul>
                  <p>
                    This categorization helps organize your footer and allows for different styling or positioning based
                    on the link type.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Using Drag & Drop Reordering</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>
                    The footer preview section now supports drag and drop reordering for a more intuitive experience:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Click the "Enable Drag & Drop" button to activate drag mode</li>
                    <li>Drag links to reorder them in the footer preview</li>
                    <li>Changes are saved automatically when you drop a link in a new position</li>
                    <li>Click "Exit Drag Mode" when you're finished reordering</li>
                  </ul>
                  <p>
                    This visual approach makes it easier to organize your footer exactly how you want it to appear on
                    your site.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertMessage.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => alertAction()}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Confirm"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

