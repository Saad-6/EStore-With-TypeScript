"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import { ArrowUp, ChevronDown, ChevronUp, Loader2, RefreshCw, X } from "lucide-react"
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

const API_BASE_URL = "https://localhost:7007/api"

// Link types and their display names
const linkTypes = {
  universal: "Universal",
  customer_service: "Customer Service",
  navigation: "Navigation",
  quick_access: "Quick Access",
  admin: "Admin",
}

// Mandatory links that cannot be deactivated
const mandatoryLinks = ["Home", "Profile", "Cart", "Search"]

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
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false)
  const [categoriesAsLinks, setCategoriesAsLinks] = useState(false)
  const [reorderMode, setReorderMode] = useState(false)
  const [activeLinks, setActiveLinks] = useState<LinkDTO[]>([])

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
          (navData.links && navData.links.some((link) => link.id === 0 && link.linkType === "navigation"))

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
  const fetchActiveLinks = async () => {
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
  const fetchAllLinks = async (activeLinksData = []) => {
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
  const processLinks = (links, activeLinksData = []) => {
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

      const endpoint = currentStatus ? `${API_BASE_URL}/Navigation/deactivate/${linkId}` : `${API_BASE_URL}/Navigation/activate/${linkId}`

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
        // No need to refresh all data since we've already updated the UI
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

    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Navigation/order?linkId=${linkId}&displayOrder=${newOrder}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        toast.success("Link order updated successfully")
        // Refresh all data to ensure UI is in sync with backend
        await fetchAllData()
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to update link order")
      }
    } catch (error) {
      console.error("Error changing link order:", error)
      toast.error("An error occurred while updating link order")
    } finally {
      setIsSaving(false)
    }
  }

  const handleResetNavigation = async () => {
    setIsSaving(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Navigation/seed`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setIsResetDialogOpen(false)
        toast.success("Navigation reset successfully")
        // Refresh all data to ensure UI is in sync with backend
        await fetchAllData()
      } else {
        const errorData = await response.json()
        toast.error(errorData || "Failed to reset navigation")
      }
    } catch (error) {
      console.error("Error resetting navigation:", error)
      toast.error("An error occurred while resetting navigation")
    } finally {
      setIsSaving(false)
    }
  }

  const isLinkMandatory = (name: string) => {
    return mandatoryLinks.includes(name)
  }

  // Get links by type, combining data from all sources
  const getLinksByType = (type: string) => {
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

      {/* Navigation Preview */}
      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg mb-6">
        <CardHeader>
          <CardTitle className="text-xl">Navigation Preview</CardTitle>
          <CardDescription>This shows how your navigation will appear to users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 p-4 border rounded-md bg-gray-50 dark:bg-gray-800">
            {/* Logo placeholder */}
            <div className="px-3 py-1 bg-blue-600 text-white rounded-md shadow-sm">EStore</div>

            {/* Center links */}
            <div className="flex gap-2">
              {activeLinks
                .filter((link) => link.linkType === "universal")
                .sort((a, b) => a.displayOrder - b.displayOrder)
                .map((link) => (
                  <div key={link.id} className="px-3 py-1 bg-white dark:bg-gray-700 rounded-md shadow-sm">
                    {link.name}
                  </div>
                ))}

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
                <Button variant="outline" size="sm" onClick={() => setIsResetDialogOpen(true)}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Reset Navigation
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

              {/* Links by Type */}
              {Object.entries(linkTypes).map(([type, displayName]) => {
                const typeLinks = getLinksByType(type)

                return (
                  <div key={type} className="space-y-2">
                    <h3 className="font-medium flex items-center">
                      <Badge variant="outline" className="mr-2">
                        {displayName}
                      </Badge>
                      Links {typeLinks.length > 0 ? `(${typeLinks.length})` : "(None)"}
                    </h3>

                    {typeLinks.length > 0 ? (
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
                                  <Badge variant="secondary" className="ml-2">
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
                                    onCheckedChange={() => confirmToggleLink(link.id, link.isActive)}
                                    disabled={isSaving || isLinkMandatory(link.name)}
                                  />
                                )}
                              </TableCell>
                              {reorderMode && link.id !== 0 && (
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
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    ) : (
                      <div className="p-4 border border-dashed rounded-md text-center text-muted-foreground">
                        No {displayName.toLowerCase()} links found
                      </div>
                    )}
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
          </Accordion>
        </CardContent>
      </Card>

      {/* Reset Confirmation Dialog */}
      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Navigation</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to reset the navigation to its default state? This will restore all default links
              and their original order.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleResetNavigation}
              disabled={isSaving}
              className="bg-red-600 hover:bg-red-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Resetting...
                </>
              ) : (
                "Reset Navigation"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

