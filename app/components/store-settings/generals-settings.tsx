"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { AlertCircle, Eye, EyeOff, Globe, ImageIcon, Key, Loader2, Type } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7007/api"

interface StoreSettingsEntity {
  id: number
  url: string
  siteName: string
  logoURL: string | null
  faviconURL: string | null
  googleFontsAPIKey: string | null
  maintenanceMode: boolean
  currencyEntityId?: number
  deliveryEntityId?: number
}

export default function GeneralSettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [siteSettings, setSiteSettings] = useState<StoreSettingsEntity>({
    id: 0,
    url: "",
    siteName: "",
    logoURL: null,
    faviconURL: null,
    googleFontsAPIKey: null,
    maintenanceMode: false,
  })

  // File references
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  // UI states
  const [showApiKey, setShowApiKey] = useState(false)

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)

  const { getToken } = useAuth()

  // Fetch data on component mount
  useEffect(() => {
 
    fetchSiteSettings()
  }, [])

  // Fetch site settings
  const fetchSiteSettings = async () => {
    try {
      setIsLoading(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/StoreSettings`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        console.log("No site settings found, using defaults")
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch site settings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()

      setSiteSettings(data)
    } catch (error) {
      console.error("Error fetching site settings:", error)
      toast.error("Failed to load site settings")
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target
    setSiteSettings({
      ...siteSettings,
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

  const handleSwitchChange = (field: string, checked: boolean) => {
    setSiteSettings({
      ...siteSettings,
      [field]: checked,
    })
  }

  // Save general settings
  const saveGeneralSettings = async () => {
    try {
      setIsSaving(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return false
      }

      // Create FormData for site settings
      const formData = new FormData()
      formData.append("id", siteSettings.id.toString())
      formData.append("url", siteSettings.url)
      formData.append("siteName", siteSettings.siteName)
      formData.append("googleFontsAPIKey", siteSettings.googleFontsAPIKey || "")
      formData.append("maintenanceMode", siteSettings.maintenanceMode.toString())

      // Add files if selected
      if (logoFile) {
        formData.append("logo", logoFile)
      }

      if (faviconFile) {
        formData.append("favicon", faviconFile)
      }

      // Save site settings
      const siteResponse = await fetch(`${API_BASE_URL}/StoreSettings`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      })

      if (!siteResponse.ok) {
        const errorText = await siteResponse.text()
        console.error("Site settings response not OK:", errorText)
        throw new Error(`Failed to save site settings: ${siteResponse.status} ${siteResponse.statusText}`)
      }

      const updatedSettings = await siteResponse.json()
      console.log("General settings saved successfully:", updatedSettings)
      setSiteSettings(updatedSettings)

      // Reset file inputs
      setLogoFile(null)
      setFaviconFile(null)
      if (logoInputRef.current) logoInputRef.current.value = ""
      if (faviconInputRef.current) faviconInputRef.current.value = ""

      toast.success("General settings saved successfully")
      return true
    } catch (error) {
      console.error("Error saving general settings:", error)
      toast.error("Failed to save general settings. Please try again.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveGeneralSettings()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <form id="general-settings-form" onSubmit={handleSubmit} className="space-y-6">
      {/* General tab content */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Basic Settings
            </CardTitle>
            <CardDescription>Configure your store's basic information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="siteName" className="flex items-center gap-1">
                <Type className="h-4 w-4" />
                Site Name
              </Label>
              <Input
                id="siteName"
                name="siteName"
                value={siteSettings.siteName}
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
                value={siteSettings.url}
                onChange={handleInputChange}
                placeholder="https://www.yourdomain.com"
                required
              />
              <p className="text-sm text-muted-foreground">Your store's domain name</p>
            </div>

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
                  value={siteSettings.googleFontsAPIKey || ""}
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
                checked={siteSettings.maintenanceMode}
                onCheckedChange={(checked) => handleSwitchChange("maintenanceMode", checked)}
              />
            </div>

            {siteSettings.maintenanceMode && (
              <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-900/20 dark:border-amber-800">
                <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <AlertTitle className="text-amber-600 dark:text-amber-400">Maintenance Mode Active</AlertTitle>
                <AlertDescription className="text-amber-600/80 dark:text-amber-400/80">
                  Your site is currently in maintenance mode. Only administrators will be able to access the site.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5" />
              Appearance
            </CardTitle>
            <CardDescription>Configure your store's visual elements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="logoFile" className="flex items-center gap-1">
                <ImageIcon className="h-4 w-4" />
                Logo
              </Label>

              {siteSettings.logoURL && (
                <div className="mb-2 p-2 border rounded-md">
                  <div className="relative h-20 w-full mb-2">
                    <Image
                      src={siteSettings.logoURL || "/placeholder.svg"}
                      alt="Site Logo"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Current: {siteSettings.logoURL}</p>
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

              {siteSettings.faviconURL && (
                <div className="mb-2 p-2 border rounded-md">
                  <div className="relative h-16 w-16 mx-auto mb-2">
                    <Image
                      src={siteSettings.faviconURL || "/placeholder.svg"}
                      alt="Site Favicon"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground truncate">Current: {siteSettings.faviconURL}</p>
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
              <p className="text-sm text-muted-foreground">Upload your site's favicon (recommended: .ico format)</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Save Button */}
      <div className="mt-6 flex justify-end">
        <Button type="submit" disabled={isSaving} className="px-6">
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save General Settings"
          )}
        </Button>
      </div>
    </form>
  )
}
