"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { ArrowUp, ChevronDown, ChevronUp, GripVertical, InfoIcon, Loader2, X } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
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
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"

const API_BASE_URL = "https://localhost:7007/api"

// Link types and their display names
const linkTypes: Record<string, string> = {
  universal: "Universal",
  customer_service: "Customer Service",
  navigation: "Navigation",
  quick_access: "Quick Access",
  admin: "Admin",
}

// Mandatory links that cannot be deactivated
const mandatoryLinks: string[] = ["Home", "Profile", "Cart", "Search"]

// Update the LinkDTO interface to match the actual API response
interface LinkDTO {
  id: number
  name: string
  url: string
  linkType: string
  displayOrder: number
  isActive?: boolean
}

// Update the NavigationDTO interface to match the actual API response
interface NavigationDTO {
  id: number
  siteName: string | null
  logoUrl: string | null
  links: LinkDTO[]
  isSticky: boolean
  isAllCategories?: boolean
}

export default function AdminNavigationPage() {
  const [navigation, setNavigation] = useState<NavigationDTO | null>(null)
  const [allLinks, setAllLinks] = useState<LinkDTO[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [categoriesAsLinks, setCategoriesAsLinks] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [activeLinks, setActiveLinks] = useState<LinkDTO[]>([])
  const [dragEnabled, setDragEnabled] = useState(false)

  // Alert dialog state for link toggling
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertAction, setAlertAction] = useState<() => Promise<void>>(() => Promise.resolve())
  const [alertMessage, setAlertMessage] = useState({ title: "", description: "" })

  const { getToken } = useAuth()

  useEffect(() => {
    fetchAllData()
  }, [])

  // Fetch all necessary data in sequence
  const fetchAllData = async () => {
    setIsLoading(true)
    try {
      // Fetch in sequence to ensure proper data dependencies
      await fetchNavigation()
      const activeLinksData = await fetchActiveLinks()
      await fetchAllLinks(activeLinksData)
    } catch (error) {
      console.error("Error fetching all data:", error)
      toast.error("An error occurred while fetching data")
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch the main navigation configuration
  const fetchNavigation = async () => {
    try {
      const navResponse = await fetch(`${API_BASE_URL}/Navigation`)

      if (navResponse.ok) {
        const navData = await navResponse.json()
        setNavigation(navData)

        // Update categoriesAsLinks based on isAllCategories from the backend
        // Look for dynamically generated category links (id=0) as a fallback
        const hasCategoryLinks =
          navData.isAllCategories ||
          (navData.links && navData.links.some((link: LinkDTO) => link.id === 0 && link.linkType === "navigation"))

        setCategoriesAsLinks(hasCategoryLinks)
      } else {
        console.log("error here")
        toast.error("Failed to fetch navigation data")
      }
    } catch (error) {
      console.error("Error fetching navigation:", error)
      throw error
    }
  }

  // Fetch active links specifically
  const fetchActiveLinks = async (): Promise<LinkDTO[]> => {
    try {
      const token = getToken()
      if (!token) {
        return []
      }

      const activeLinksResponse = await fetch(`${API_BASE_URL}/Navigation/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (activeLinksResponse.ok) {
        const activeLinksData = await activeLinksResponse.json()
        setActiveLinks(activeLinksData)
        return activeLinksData // Return the data for use in fetchAllLinks
      }
      return []
    } catch (error) {
      console.error("Error fetching active links:", error)
      throw error
    }
  }

  // Fetch all available links
  const fetchAllLinks = async (activeLinksData: LinkDTO[] = []) => {
    try {
      const token = getToken()
      if (!token) {
        return
      }

      const linksResponse = await fetch(`${API_BASE_URL}/Navigation/all`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (linksResponse.ok) {
        const linksData = await linksResponse.json()

        // Use the provided activeLinksData or fall back to the state
        const activeLinksToUse = activeLinksData.length > 0 ? activeLinksData : activeLinks

        // Process links to add isActive property
        const processedLinks = processLinks(linksData, activeLinksToUse)
        setAllLinks(processedLinks)
      }
    } catch (error) {
      console.error("Error fetching all links:", error)
      throw error
    }
  }

  // Process links to add isActive property based on activeLinks
  const processLinks = (links: LinkDTO[], activeLinksData: LinkDTO[] = []): LinkDTO[] => {
    // Use the provided activeLinksData or fall back to the state
    const activeData = activeLinksData.length > 0 ? activeLinksData : activeLinks

    // Get IDs of active links
    const activeIds = activeData.map((link) => link.id)

    // Add isActive property to each link
    return links.map((link) => ({
      ...link,
      isActive: activeIds.includes(link.id),
    }))
  }

  const confirmToggleLink = (linkId: number, currentStatus: boolean) => {
    const actionText = currentStatus ? "deactivate" : "activate"
    const linkName = allLinks.find((l) => l.id === linkId)?.name || "this link"

    setAlertMessage({
      title: `${currentStatus ? "Deactivate" : "Activate"} Link`,
      description: `Are you sure you want to ${actionText} "${linkName}"? ${
        currentStatus ? "It will be removed from the navigation." : "It will be visible in the navigation."
      }`,
    })

    setAlertAction(() => async () => {
      await handleToggleLink(linkId, currentStatus)
    })

    setIsAlertOpen(true)
  }

  const handleToggleLink = async (linkId: number, currentStatus: boolean) => {
    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const endpoint = currentStatus
        ? `${API_BASE_URL}/Navigation/deactivate/${linkId}`
        : `${API_BASE_URL}/Navigation/activate/${linkId}`

      // Optimistically update UI
      setAllLinks((prevLinks) =>
        prevLinks.map((link) => (link.id === linkId ? { ...link, isActive: !currentStatus } : link)),
      )

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success(`Link ${currentStatus ? "deactivated" : "activated"} successfully`)
        // Update active links state to match
        if (!currentStatus) {
          // Link was activated, add to activeLinks if not already there
          const linkToAdd = allLinks.find((l) => l.id === linkId)
          if (linkToAdd && !activeLinks.some((l) => l.id === linkId)) {
            setActiveLinks((prev) => [...prev, linkToAdd])
          }
        } else {
          // Link was deactivated, remove from activeLinks
          setActiveLinks((prev) => prev.filter((l) => l.id !== linkId))
        }
      } else {
        // Revert optimistic update if request failed
        setAllLinks((prevLinks) =>
          prevLinks.map((link) => (link.id === linkId ? { ...link, isActive: currentStatus } : link)),
        )
        const errorData = await response.json()
        toast.error(errorData || `Failed to ${currentStatus ? "deactivate" : "activate"} link`)
      }
    } catch (error) {
      // Revert optimistic update if request failed
      setAllLinks((prevLinks) =>
        prevLinks.map((link) => (link.id === linkId ? { ...link, isActive: currentStatus } : link)),
      )
      console.error("Error toggling link:", error)
      toast.error("An error occurred while updating link status")
    } finally {
      setIsSaving(false)
    }
  }

  const confirmToggleCategoriesAsLinks = () => {
    const newStatus = !categoriesAsLinks

    setAlertMessage({
      title: `${newStatus ? "Enable" : "Disable"} Categories as Links`,
      description: `Are you sure you want to ${newStatus ? "enable" : "disable"} categories as navigation links? ${
        newStatus
          ? "All product categories will appear as links in the navigation."
          : "Product categories will no longer appear as links in the navigation."
      }`,
    })

    setAlertAction(() => async () => {
      await handleToggleCategoriesAsLinks(newStatus)
    })

    setIsAlertOpen(true)
  }

  const handleToggleCategoriesAsLinks = async (newStatus: boolean) => {
    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      // Optimistically update UI
      setCategoriesAsLinks(newStatus)

      const response = await fetch(`${API_BASE_URL}/Navigation/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(newStatus),
      })

      if (response.ok) {
        toast.success(`Categories as links ${newStatus ? "enabled" : "disabled"} successfully`)
        // Refresh all data to ensure UI is in sync with backend
        await fetchAllData()
      } else {
        // Revert optimistic update if request failed
        setCategoriesAsLinks(!newStatus)
        const errorData = await response.json()
        toast.error(errorData || `Failed to ${newStatus ? "enable" : "disable"} categories as links`)
      }
    } catch (error) {
      // Revert optimistic update if request failed
      setCategoriesAsLinks(!newStatus)
      console.error("Error toggling categories as links:", error)
      toast.error("An error occurred while updating categories as links")
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
    if (newOrder < 1 || newOrder > allLinks.length) {
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
      const response1 = await fetch(`${API_BASE_URL}/Navigation/order?linkId=${linkId}&displayOrder=${newOrder}`, {
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
        `${API_BASE_URL}/Navigation/order?linkId=${linkToSwapWith.id}&displayOrder=${currentOrder}`,
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
        await fetch(`${API_BASE_URL}/Navigation/order?linkId=${linkId}&displayOrder=${currentOrder}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        return
      }

      toast.success("Link order updated successfully")
      // Refresh all data to ensure UI is in sync with backend
      await fetchAllData()
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
    const typeLinks = getUniversalLinks().filter((link) => !isLinkMandatory(link.name))

    // Get the links being swapped
    const draggedLink = typeLinks[sourceIndex]
    const targetLink = typeLinks[destinationIndex]

    if (!draggedLink || !targetLink) {
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
        `${API_BASE_URL}/Navigation/order?linkId=${draggedLink.id}&displayOrder=${targetLink.displayOrder}`,
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
        `${API_BASE_URL}/Navigation/order?linkId=${targetLink.id}&displayOrder=${draggedLink.displayOrder}`,
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
        await fetch(
          `${API_BASE_URL}/Navigation/order?linkId=${draggedLink.id}&displayOrder=${draggedLink.displayOrder}`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )
        return
      }

      toast.success("Link order updated successfully")
      // Refresh all data to ensure UI is in sync with backend
      await fetchAllData()
    } catch (error) {
      console.error("Error changing link order:", error)
      toast.error("An error occurred while updating link order")
    } finally {
      setIsSaving(false)
    }
  }

  const isLinkMandatory = (name: string): boolean => {
    return mandatoryLinks.includes(name)
  }

  // Get links by type, combining data from all sources
  const getLinksByType = (type: string): LinkDTO[] => {
    // Start with links from allLinks
    let result = allLinks.filter((link) => link.linkType === type)

    // If we have navigation data with dynamic category links (id=0), add them for navigation type
    if (type === "navigation" && navigation?.links) {
      const categoryLinks = navigation.links.filter((link) => link.id === 0 && link.linkType === "navigation")
      result = [...result, ...categoryLinks]
    }

    // Sort by display order
    return result.sort((a, b) => a.displayOrder - b.displayOrder)
  }

  // Get universal links for the preview section
  const getUniversalLinks = () => {
    return activeLinks.filter((link) => link.linkType === "universal").sort((a, b) => a.displayOrder - b.displayOrder)
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
      <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200 mb-6">Navigation Management</h1>

      {/* Navigation Preview with Drag and Drop */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Navigation Preview</CardTitle>
              <CardDescription>This shows how your navigation will appear to users</CardDescription>
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
          <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
            {/* Logo placeholder */}
            <div className="px-3 py-1 bg-blue-600 text-white rounded-md shadow-sm">EStore</div>

            {/* Center links with drag and drop */}
            <div className="flex gap-2">
              {dragEnabled ? (
                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="universal-links" direction="horizontal">
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className="flex gap-2">
                        {getUniversalLinks()
                          .filter((link) => !isLinkMandatory(link.name))
                          .map((link, index) => (
                            <Draggable
                              key={`universal-${link.id}`}
                              draggableId={`universal-${link.id}`}
                              index={index}
                              isDragDisabled={isSaving || isLinkMandatory(link.name)}
                            >
                              {(provided, snapshot) => (
                                <div
                                  ref={provided.innerRef}
                                  {...provided.draggableProps}
                                  {...provided.dragHandleProps}
                                  className={`px-3 py-1 rounded-md shadow-sm flex items-center gap-2 ${
                                    snapshot.isDragging
                                      ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-500"
                                      : "bg-white dark:bg-gray-700"
                                  }`}
                                >
                                  <GripVertical className="h-4 w-4 text-gray-400" />
                                  {link.name}
                                </div>
                              )}
                            </Draggable>
                          ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              ) : (
                // Regular non-draggable display
                <>
                  {getUniversalLinks().map((link) => (
                    <div key={link.id} className="px-3 py-1 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                      {link.name}
                    </div>
                  ))}
                </>
              )}

              {categoriesAsLinks && (
                <div className="px-3 py-1 bg-white dark:bg-gray-700 rounded-md shadow-sm border-2 border-dashed border-green-500">
                  Categories (Dynamic)
                </div>
              )}
            </div>

            {/* Right icons */}
            <div className="flex gap-2 ml-auto">
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
              <div className="w-6 h-6 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
          </div>

          {dragEnabled && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
              <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
                <InfoIcon className="h-4 w-4 mr-2" />
                Drag and drop the navigation links to reorder them. Changes are saved automatically.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Settings */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl">Navigation Links</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setReorderMode(!reorderMode)}>
                  {reorderMode ? (
                    <>
                      <X className="mr-2 h-4 w-4" />
                      Exit Reorder Mode
                    </>
                  ) : (
                    <>
                      <ArrowUp className="mr-2 h-4 w-4" />
                      Reorder Links
                    </>
                  )}
                </Button>
              </div>
            </div>
            <CardDescription>Manage which links appear in your navigation bar</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Categories as Links Toggle */}
              <div className="flex justify-between items-center p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
                <div>
                  <h3 className="font-medium">Categories as Navigation Links</h3>
                  <p className="text-sm text-muted-foreground">
                    When enabled, all product categories will appear as links in the navigation
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">{categoriesAsLinks ? "Enabled" : "Disabled"}</span>
                  <Switch
                    checked={categoriesAsLinks}
                    onCheckedChange={confirmToggleCategoriesAsLinks}
                    disabled={isSaving}
                  />
                </div>
              </div>

              {/* Info Alert for Categories as Links */}
              {categoriesAsLinks && (
                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <InfoIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-600 dark:text-blue-400">Categories as Links is enabled</AlertTitle>
                  <AlertDescription className="text-blue-600/80 dark:text-blue-400/80">
                    When this option is enabled, other navigation links may not be visible as the categories will take
                    precedence in the navigation bar.
                  </AlertDescription>
                </Alert>
              )}

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
                              {link.name}
                              {isLinkMandatory(link.name) && (
                                <Badge variant="default" className="ml-2 bg-blue-500 hover:bg-blue-600">
                                  Required
                                </Badge>
                              )}
                              {link.id === 0 && (
                                <Badge
                                  variant="outline"
                                  className="ml-2 bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                >
                                  Dynamic
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{link.url}</TableCell>
                            <TableCell>{link.displayOrder}</TableCell>
                            <TableCell>
                              {link.id === 0 ? (
                                <Badge
                                  variant="outline"
                                  className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                                >
                                  Always Active
                                </Badge>
                              ) : (
                                <Switch
                                  checked={link.isActive}
                                  onCheckedChange={() => confirmToggleLink(link.id, link.isActive || false)}
                                  disabled={isSaving || isLinkMandatory(link.name)}
                                />
                              )}
                            </TableCell>
                            {reorderMode && link.id !== 0 && !isLinkMandatory(link.name) && (
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
                                    disabled={isSaving || link.displayOrder === allLinks.length}
                                  >
                                    <ChevronDown className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            )}
                            {reorderMode && (isLinkMandatory(link.name) || link.id === 0) && (
                              <TableCell>
                                <span className="text-sm text-muted-foreground">
                                  {isLinkMandatory(link.name) ? "Cannot reorder" : "Dynamic link"}
                                </span>
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
      </div>

      {/* Implementation Guide */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Implementation Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="item-1">
              <AccordionTrigger>How to implement the dynamic navigation</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>
                    The dynamic navigation is already integrated with your existing Navbar component. No additional
                    implementation is required.
                  </p>
                  <p>
                    The Navbar component now fetches the active navigation links from the API and renders them based on
                    their type and display order.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-2">
              <AccordionTrigger>Understanding link types</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>The navigation system organizes links into different types:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Universal:</strong> General links that appear in the main navigation (Home, Products,
                      etc.)
                    </li>
                    <li>
                      <strong>Customer Service:</strong> Links related to customer support (Contact, FAQ, etc.)
                    </li>
                    <li>
                      <strong>Navigation:</strong> Special navigation elements (Cart, Search, etc.)
                    </li>
                    <li>
                      <strong>Quick Access:</strong> Links for quick access to important pages (Terms & Conditions,
                      etc.)
                    </li>
                    <li>
                      <strong>Admin:</strong> Links for administrative purposes (Maintenance Page, etc.)
                    </li>
                  </ul>
                  <p>
                    This categorization helps organize your navigation and allows for different styling or positioning
                    based on the link type.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-3">
              <AccordionTrigger>Required vs. Optional Links</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>Some links are required for the proper functioning of your site:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>
                      <strong>Home:</strong> The main landing page of your site
                    </li>
                    <li>
                      <strong>Profile:</strong> User account access
                    </li>
                    <li>
                      <strong>Cart:</strong> Shopping cart access
                    </li>
                    <li>
                      <strong>Search:</strong> Search functionality
                    </li>
                  </ul>
                  <p>
                    These required links cannot be deactivated as they are essential for core functionality. All other
                    links can be toggled on or off based on your needs.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-4">
              <AccordionTrigger>Dynamic Category Links</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>
                    When "Categories as Navigation Links" is enabled, the system dynamically generates navigation links
                    for all product categories.
                  </p>
                  <p>These dynamic links have the following characteristics:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>They have an ID of 0 (since they're not actual database entities)</li>
                    <li>They're automatically generated based on your product categories</li>
                    <li>They can't be individually activated/deactivated</li>
                    <li>They're always of type "navigation"</li>
                  </ul>
                  <p>
                    This feature allows you to automatically keep your navigation in sync with your product categories
                    without manual updates.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="item-5">
              <AccordionTrigger>Using Drag & Drop Reordering</AccordionTrigger>
              <AccordionContent>
                <div className="space-y-4">
                  <p>
                    The navigation preview section now supports drag and drop reordering for a more intuitive
                    experience:
                  </p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Click the "Enable Drag & Drop" button to activate drag mode</li>
                    <li>Drag links to reorder them in the navigation preview</li>
                    <li>Changes are saved automatically when you drop a link in a new position</li>
                    <li>Required links and dynamic category links cannot be reordered</li>
                    <li>Click "Exit Drag Mode" when you're finished reordering</li>
                  </ul>
                  <p>
                    This visual approach makes it easier to organize your navigation exactly how you want it to appear
                    on your site.
                  </p>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      {/* Confirmation Dialog for Link Actions */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alertMessage.title}</AlertDialogTitle>
            <AlertDialogDescription>{alertMessage.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => alertAction()} disabled={isSaving}>
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

