"use client"

import { useState, useEffect } from "react"
import { toast } from "react-hot-toast"
import {
  Edit,
  Save,
  X,
  Check,
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
} from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/app/components/ui/tabs"
import { Input } from "@/app/components/ui/input"

const API_BASE_URL = "https://localhost:7007/api"

interface LinkDTO {
  id: number
  name: string
  url: string
  linkType: string
  displayOrder: number
}

interface IconDTO {
  id: number
  platform: string
  linkUrl: string
  isActive: boolean
  displayOrder: number
}

interface AboutUsDTO {
  content: string
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
  const [aboutUsText, setAboutUsText]  = useState<string|null>("")
  const [editingAboutUs, setEditingAboutUs] = useState(false)
  const [editingIconId, setEditingIconId] = useState<number | null>(null)
  const [editIconUrl, setEditIconUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [alertAction, setAlertAction] = useState<() => Promise<void>>(() => Promise.resolve())
  const [alertMessage, setAlertMessage] = useState({ title: "", description: "" })

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
    // This would be replaced with an actual API call when available
    // For now, we'll use the mock data initialized in state
    // Example of how the API call would look:
    
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/Footer/Icons`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
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
          method: "GET"
        })
        if (response.ok) {
          setEditingAboutUs(false)
          if (response.status === 204) {
            
            setAboutUsText("");  // Set default empty value
            return;
        }
          const data = await response.json()

          setAboutUsText(data);
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
    // setAboutUsText(
    //   "Our company is dedicated to providing high-quality products and exceptional customer service. We strive to make your shopping experience enjoyable and hassle-free.",
    // )
  }

  const toggleLinkStatus = async (linkId: number, activate: boolean) => {
    const actionText = activate ? "activate" : "deactivate"

    setAlertMessage({
      title: `${activate ? "Activate" : "Deactivate"} Link`,
      description: `Are you sure you want to ${actionText} this link? ${activate ? "It will be visible in the footer." : "It will be removed from the footer."}`,
    })

    setAlertAction(() => async () => {
      try {
        setIsSaving(true)
        const token = getToken()
        if (!token) {
          toast.error("Authentication token not found")
          return
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
          const errorData = await response.json()
          toast.error(errorData || `Failed to ${actionText} link`)
        }
      } catch (error) {
        console.error(`Error ${actionText} link:`, error)
        toast.error(`An error occurred while ${actionText} the link`)
      } finally {
        setIsSaving(false)
      }
    })

    setIsAlertOpen(true)
  }

  const toggleIconStatus = async (iconId: number, activate: boolean) => {
    const actionText = activate ? "activate" : "deactivate"

    setAlertMessage({
      title: `${activate ? "Activate" : "Deactivate"} Icon`,
      description: `Are you sure you want to ${actionText} this social media icon? ${activate ? "It will be visible in the footer." : "It will be removed from the footer."}`,
    })

    setAlertAction(() => async () => {
      try {
        setIsSaving(true)
        const token = getToken()
        if (!token) {
          toast.error("Authentication token not found")
          return
        }

        const response = await fetch(`${API_BASE_URL}/Footer/Icon/Status?iconId=${iconId}&activate=${activate}`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          // Update local state
          setIcons(icons.map((icon) => (icon.id === iconId ? { ...icon, isActive: activate } : icon)))
          toast.success(`Icon ${activate ? "activated" : "deactivated"} successfully`)
        } else {
          const errorData = await response.json()
          toast.error(errorData || `Failed to ${actionText} icon`)
        }
      } catch (error) {
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

      <Tabs defaultValue="links" >
        <TabsList >
          <TabsTrigger value="links">Links</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="about">About Us</TabsTrigger>
        </TabsList>

        {/* Links Tab */}
        <TabsContent value="links">
          <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl">Footer Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-md">
                  <h3 className="text-lg font-medium mb-2">Manage Footer Links</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Toggle links to show or hide them in the footer. Links are grouped by type.
                  </p>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          URL
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Order
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {allLinks.map((link) => {
                        const active = isLinkActive(link.id)
                        return (
                          <tr key={link.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                              <div className="flex items-center">
                                {getLinkTypeIcon(link.linkType)}
                                <span className="ml-2">{link.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <a
                                href={link.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline"
                              >
                                {link.url}
                              </a>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {getLinkTypeBadge(link.linkType)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {link.displayOrder}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              <Badge
                                variant={active ? "default" : "outline"}
                                className={
                                  active
                                    ? "bg-green-500 hover:bg-green-600 text-white"
                                    : "border-yellow-500 text-yellow-500"
                                }
                              >
                                {active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <Button
                                variant={active ? "destructive" : "default"}
                                size="sm"
                                onClick={() => toggleLinkStatus(link.id, !active)}
                                disabled={isSaving}
                              >
                                {active ? (
                                  <>
                                    <X className="h-4 w-4 mr-2" />
                                    Deactivate
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4 mr-2" />
                                    Activate
                                  </>
                                )}
                              </Button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
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

