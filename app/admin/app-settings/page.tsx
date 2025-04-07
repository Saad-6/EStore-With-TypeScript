"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { AlertCircle, Eye, EyeOff, Globe, ImageIcon, Key, Loader2, Settings, Type } from "lucide-react"
import { Input } from "@/app/components/ui/input"
import { useAuth } from "@/app/lib/auth"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Separator } from "@radix-ui/react-select"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || ""

interface SiteSettings {
  id: number
  url: string
  siteName: string
  logoURL: string | null
  faviconURL: string | null
  googleFontsAPIKey: string | null
  maintenanceMode: boolean
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({
    id: 0,
    url: "",
    siteName: "",
    logoURL: "",
    faviconURL: "",
    googleFontsAPIKey: "",
    maintenanceMode: false,
  })

  // File references
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  // UI states
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showApiKey, setShowApiKey] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const { getToken } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`${API_BASE_URL}/SiteSettings`)
        if (!response.ok) {
          throw new Error("Failed to fetch site settings")
        }
        const data = await response.json()
        setSettings({
          id: data.id || 0,
          url: data.url || "",
          siteName: data.siteName || "",
          logoURL: data.logoURL || "",
          faviconURL: data.faviconURL || "",
          googleFontsAPIKey: data.googleFontsAPIKey || "",
          maintenanceMode: data.maintenanceMode || false,
        })
      } catch (error) {
        console.error("Error fetching site settings:", error)
        toast.error("Failed to load site settings. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSettings({
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    })
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: "logo" | "favicon") => {
    if (e.target.files && e.target.files[0]) {
      if (fileType === "logo") {
        setLogoFile(e.target.files[0])
      } else {
        setFaviconFile(e.target.files[0])
      }
    }
  }

  const handleSwitchChange = (checked: boolean) => {
    setSettings({
      ...settings,
      maintenanceMode: checked,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
        console.log(API_BASE_URL)
      // Create FormData for file uploads
      const formData = new FormData()
      formData.append("id", settings.id.toString())
      formData.append("url", settings.url)
      formData.append("siteName", settings.siteName)
      formData.append("googleFontsAPIKey", settings.googleFontsAPIKey || "")
      formData.append("maintenanceMode", settings.maintenanceMode.toString())

      // Add files if selected
      if (logoFile) {
        formData.append("logo", logoFile as File)
      }

      if (faviconFile) {
        formData.append("favicon", faviconFile as File)
      }

      console.log(formData)
      const response = await fetch(`${API_BASE_URL}/SiteSettings`, {
        method: "POST",
        
        headers: {
          Authorization: `Bearer ${token}`,
          
        },
        body: formData,
      })

      if (!response.ok) {
        throw new Error("Failed to save site settings")
      }
      // Get updated settings from response
      console.log("Success")
      const updatedSettings = await response.json()
      setSettings(updatedSettings)

      // Reset file inputs
      setLogoFile(null)
      setFaviconFile(null)
      if (logoInputRef.current) logoInputRef.current.value = ""
      if (faviconInputRef.current) faviconInputRef.current.value = ""

      toast.success("Site settings saved successfully")
      router.refresh()
    } catch (error) {
      console.error("Error saving site settings:", error)
      toast.error("Failed to save site settings. Please try again.")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200 mb-6">Site Settings</h1>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Site Configuration
          </CardTitle>
          <CardDescription>Manage your e-commerce site settings and appearance</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-6">
              {/* Basic Settings Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Settings</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="siteName" className="flex items-center gap-1">
                      <Type className="h-4 w-4" />
                      Site Name
                    </Label>
                    <Input
                      id="siteName"
                      name="siteName"
                      value={settings.siteName}
                      onChange={handleInputChange}
                      placeholder="Your Store Name"
                      required
                    />
                    <p className="text-sm text-muted-foreground">The name of your e-commerce store</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="url" className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      Base URL
                    </Label>
                    <Input
                      id="url"
                      name="url"
                      value={settings.url}
                      onChange={handleInputChange}
                      placeholder="https://www.yourdomain.com"
                      required
                    />
                    <p className="text-sm text-muted-foreground">Your store's domain name</p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Appearance Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Appearance</h3>
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="logoFile" className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Logo
                    </Label>

                    {settings.logoURL && (
                      <div className="mb-2 p-2 border rounded-md">
                        <div className="relative h-20 w-full mb-2">
                          <Image
                            src={settings.logoURL || "/placeholder.svg"}
                            alt="Site Logo"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">Current: {settings.logoURL}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        ref={logoInputRef}
                        id="logoFile"
                        name="logoFile"
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo")}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">Upload your store's logo image</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="faviconFile" className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4" />
                      Favicon
                    </Label>

                    {settings.faviconURL && (
                      <div className="mb-2 p-2 border rounded-md">
                        <div className="relative h-16 w-16 mx-auto mb-2">
                          <Image
                            src={settings.faviconURL || "/placeholder.svg"}
                            alt="Site Favicon"
                            fill
                            className="object-contain"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground truncate">Current: {settings.faviconURL}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Input
                        ref={faviconInputRef}
                        id="faviconFile"
                        name="faviconFile"
                        type="file"
                        accept="image/*,.ico"
                        onChange={(e) => handleFileChange(e, "favicon")}
                        className="flex-1"
                      />
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload your site's favicon (recommended: .ico format)
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Integrations Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Integrations</h3>
                <div className="space-y-2">
                  <Label htmlFor="googleFontsAPIKey" className="flex items-center gap-1">
                    <Key className="h-4 w-4" />
                    Google Fonts API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="googleFontsAPIKey"
                      name="googleFontsAPIKey"
                      type={showApiKey ? "text" : "password"}
                      value={settings.googleFontsAPIKey || ""}
                      onChange={handleInputChange}
                      placeholder="Your Google Fonts API Key"
                      className="pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3"
                      onClick={() => setShowApiKey(!showApiKey)}
                    >
                      {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showApiKey ? "Hide" : "Show"} API key</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground">API key for Google Fonts integration (optional)</p>
                </div>
              </div>

              <Separator />

              {/* Maintenance Mode Section */}
              <div>
                <h3 className="text-lg font-medium mb-4">Site Status</h3>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="maintenanceMode" className="text-base">
                      Maintenance Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      When enabled, your site will display a maintenance message to visitors
                    </p>
                  </div>
                  <Switch
                    id="maintenanceMode"
                    checked={settings.maintenanceMode}
                    onCheckedChange={handleSwitchChange}
                  />
                </div>

                {settings.maintenanceMode && (
                  <Alert className="mt-4 bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                    <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <AlertTitle className="text-amber-600 dark:text-amber-400">Maintenance Mode Active</AlertTitle>
                    <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                      Your site is currently in maintenance mode. Only administrators will be able to access the site.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Settings"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

