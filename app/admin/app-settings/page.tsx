"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/app/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/app/components/ui/tabs"
import { toast } from "react-hot-toast"
import {
  AlertCircle,
  CreditCard,
  DollarSign,
  Eye,
  EyeOff,
  Globe,
  ImageIcon,
  Key,
  Loader2,
  MapPin,
  Plus,
  Settings,
  Trash2,
  TruckIcon,
  Type,
} from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7007/api"

// Types
interface SimplifiedCurrency {
  key: string
  name: string
  symbol: string
  leftOriented: boolean
}

interface RegionEntity {
  id: number
  name: string
  cityId: number
}

interface CityEntity {
  id: number
  name: string
  stateId: number
  deliveryFeeAdjustment: number | null
  regions: RegionEntity[]
}

interface StateEntity {
  id: number
  name: string
  deliveryFeeAdjustment: number | null
  cities: CityEntity[]
}

interface DeliveryDTO {
  states: StateEntity[] | null
}

interface CurrencyDTO {
  symbol: string
  name: string
  leftOriented: boolean
}

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

interface SiteSettingsDTO {
  id: number
  url: string
  siteName: string
  logo?: File
  favicon?: File
  googleFontsAPIKey: string | null
  maintenanceMode: boolean
}

// Form state types
interface NewLocationForm {
  name: string
  deliveryFeeAdjustment: string
}

export default function SiteSettingsPage() {
  // State
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [availableCurrencies, setAvailableCurrencies] = useState<SimplifiedCurrency[]>([])
  const [siteSettings, setSiteSettings] = useState<StoreSettingsEntity>({
    id: 0,
    url: "",
    siteName: "",
    logoURL: null,
    faviconURL: null,
    googleFontsAPIKey: null,
    maintenanceMode: false,
  })
  const [currencySettings, setCurrencySettings] = useState<CurrencyDTO>({
    symbol: "$",
    name: "US Dollar",
    leftOriented: true,
  })
  const [deliverySettings, setDeliverySettings] = useState<DeliveryDTO>({
    states: [] as StateEntity[],
  })

  // File references
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [faviconFile, setFaviconFile] = useState<File | null>(null)

  // UI states
  const [showApiKey, setShowApiKey] = useState(false)

  // Dialog states
  const [showAddStateDialog, setShowAddStateDialog] = useState(false)
  const [showAddCityDialog, setShowAddCityDialog] = useState(false)
  const [showAddRegionDialog, setShowAddRegionDialog] = useState(false)
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)

  // Form states
  const [newLocationForm, setNewLocationForm] = useState<NewLocationForm>({
    name: "",
    deliveryFeeAdjustment: "",
  })

  const logoInputRef = useRef<HTMLInputElement>(null)
  const faviconInputRef = useRef<HTMLInputElement>(null)
  const updateDeliveryFeeTimeout = useRef<NodeJS.Timeout | null>(null)

  const { getToken } = useAuth()
  const router = useRouter()

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await fetchSiteSettings()
        await fetchAvailableCurrencies()
        await fetchActiveCurrency()
        await fetchDeliverySettings()
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load site settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  // Fetch site settings
  const fetchSiteSettings = async () => {
    try {
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
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch site settings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Site settings fetched:", data)
      setSiteSettings(data)
    } catch (error) {
      console.error("Error fetching site settings:", error)
      // Don't throw here, just use the default site settings
    }
  }

  // Fetch available currencies
  const fetchAvailableCurrencies = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/StoreSettings/Currency/available`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch available currencies: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Available currencies fetched:", data)
      setAvailableCurrencies(data)
    } catch (error) {
      console.error("Error fetching available currencies:", error)
      // Don't throw here, just use the default currencies
    }
  }

  // Fetch active currency
  const fetchActiveCurrency = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/StoreSettings/Currency/active`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // If 404, it means no active currency is set yet, so we'll use the default
      if (response.status === 404) {
        console.log("No active currency set, using default")
        return
      }

      if (!response.ok) {
        console.error(`Failed to fetch active currency: ${response.status} ${response.statusText}`)
        return // Don't throw, just use default
      }

      try {
        // First try to parse as JSON
        const text = await response.text()
        if (!text || text.trim() === "") {
          console.log("Empty response from currency endpoint")
          return
        }

        // The API is returning DeliveryDTO instead of CurrencyDTO
        // We need to handle this case and extract the currency data if possible
        const data = JSON.parse(text)

        // Check if the response has the expected CurrencyDTO structure
        if (data && typeof data === "object" && "symbol" in data && "name" in data) {
          console.log("Currency data fetched:", data)
          setCurrencySettings(data)
        } else {
          console.warn("Unexpected currency data format:", data)
          // Keep using default currency settings
        }
      } catch (parseError) {
        console.error("Error parsing currency data:", parseError)
        // Don't throw, just use default
      }
    } catch (error) {
      console.error("Error fetching active currency:", error)
      // Don't throw here, just use the default currency
    }
  }

  // Fetch delivery settings
  const fetchDeliverySettings = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      const response = await fetch(`${API_BASE_URL}/StoreSettings/Delivery`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.status === 404) {
        console.log("No delivery settings found, using defaults")
        return
      }

      if (!response.ok) {
        throw new Error(`Failed to fetch delivery settings: ${response.status} ${response.statusText}`)
      }

      const data = await response.json()
      console.log("Delivery settings fetched:", data)

      // Ensure the data has the expected structure
      if (data && typeof data === "object") {
        // If states is missing, initialize it as an empty array
        const sanitizedData = {
          states: Array.isArray(data.states) ? data.states : [],
          ...data,
        }
        setDeliverySettings(sanitizedData)
      }
    } catch (error) {
      console.error("Error fetching delivery settings:", error)
      // Don't throw here, just use the default delivery settings
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

  // Handle currency change
  const handleCurrencyChange = (currencyKey: string) => {
    const selectedCurrency = availableCurrencies.find((c) => c.key === currencyKey)
    if (selectedCurrency) {
      setCurrencySettings({
        symbol: selectedCurrency.symbol,
        name: selectedCurrency.name,
        leftOriented: currencySettings.leftOriented,
      })
    }
  }

  // Handle currency orientation change
  const handleOrientationChange = (leftOriented: boolean) => {
    setCurrencySettings({
      ...currencySettings,
      leftOriented,
    })
  }

  // Handle delivery settings changes
  const handleDeliverySettingChange = (field: keyof DeliveryDTO, value: string) => {
    const numValue = value === "" ? null : Number.parseFloat(value)
    setDeliverySettings({
      ...deliverySettings,
      [field]: numValue,
    })
  }

  // Handle form input changes
  const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNewLocationForm({
      ...newLocationForm,
      [name]: value,
    })
  }

  // Reset form
  const resetForm = () => {
    setNewLocationForm({
      name: "",
      deliveryFeeAdjustment: "",
    })
  }

  // Add this helper function to save delivery settings after state changes
  const saveDeliverySettingsAfterChange = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }

      await saveDeliverySettings(token)
      toast.success("Delivery settings updated successfully")
    } catch (error) {
      console.error("Error saving delivery settings:", error)
      toast.error("Failed to save delivery settings. Please try again.")
    }
  }

  // Add new state/province
  const handleAddState = async () => {
    if (!newLocationForm.name.trim()) {
      toast.error("State/Province name is required")
      return
    }

    const newState: StateEntity = {
      id: Date.now(), // Temporary ID, would be replaced by server-generated ID
      name: newLocationForm.name.trim(),
      deliveryFeeAdjustment: newLocationForm.deliveryFeeAdjustment
        ? Number.parseFloat(newLocationForm.deliveryFeeAdjustment)
        : null,
      cities: [],
    }

    setDeliverySettings({
      ...deliverySettings,
      states: [...(deliverySettings.states || []), newState],
    })

    resetForm()
    setShowAddStateDialog(false)

    // Save the changes to the API
    await saveDeliverySettingsAfterChange()
  }

  // Add new city
  const handleAddCity = async () => {
    if (!selectedStateId) {
      toast.error("No state selected")
      return
    }

    if (!newLocationForm.name.trim()) {
      toast.error("City name is required")
      return
    }

    const newCity: CityEntity = {
      id: Date.now(), // Temporary ID
      name: newLocationForm.name.trim(),
      stateId: selectedStateId,
      deliveryFeeAdjustment: newLocationForm.deliveryFeeAdjustment
        ? Number.parseFloat(newLocationForm.deliveryFeeAdjustment)
        : null,
      regions: [],
    }

    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) =>
        state.id === selectedStateId ? { ...state, cities: [...(state.cities || []), newCity] } : state,
      ),
    })

    resetForm()
    setShowAddCityDialog(false)

    // Save the changes to the API
    await saveDeliverySettingsAfterChange()
  }

  // Add new region
  const handleAddRegion = async () => {
    if (!selectedStateId || !selectedCityId) {
      toast.error("No state or city selected")
      return
    }

    if (!newLocationForm.name.trim()) {
      toast.error("Region name is required")
      return
    }

    const newRegion: RegionEntity = {
      id: Date.now(), // Temporary ID
      name: newLocationForm.name.trim(),
      cityId: selectedCityId,
    }

    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) =>
        state.id === selectedStateId
          ? {
              ...state,
              cities: (state.cities || []).map((city) =>
                city.id === selectedCityId ? { ...city, regions: [...(city.regions || []), newRegion] } : city,
              ),
            }
          : state,
      ),
    })

    resetForm()
    setShowAddRegionDialog(false)

    // Save the changes to the API
    await saveDeliverySettingsAfterChange()
  }

  // Remove state
  const handleRemoveState = async (stateId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).filter((state) => state.id !== stateId),
    })

    // Save the changes to the API
    await saveDeliverySettingsAfterChange()
  }

  // Remove city
  const handleRemoveCity = async (stateId: number, cityId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) =>
        state.id === stateId ? { ...state, cities: (state.cities || []).filter((city) => city.id !== cityId) } : state,
      ),
    })

    // Save the changes to the API
    await saveDeliverySettingsAfterChange()
  }

  // Remove region
  const handleRemoveRegion = async (stateId: number, cityId: number, regionId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) =>
        state.id === stateId
          ? {
              ...state,
              cities: (state.cities || []).map((city) =>
                city.id === cityId
                  ? { ...city, regions: (city.regions || []).filter((region) => region.id !== regionId) }
                  : city,
              ),
            }
          : state,
      ),
    })

    // Save the changes to the API
    await saveDeliverySettingsAfterChange()
  }

  // Update delivery fee for a location
  const handleUpdateDeliveryFee = async (type: "state" | "city", stateId: number, cityId?: number, value?: string) => {
    const fee = value === "" || value === undefined ? null : Number.parseFloat(value)

    if (type === "state") {
      setDeliverySettings({
        ...deliverySettings,
        states: (deliverySettings.states || []).map((state) =>
          state.id === stateId ? { ...state, deliveryFeeAdjustment: fee } : state,
        ),
      })
    } else if (type === "city" && cityId) {
      setDeliverySettings({
        ...deliverySettings,
        states: (deliverySettings.states || []).map((state) =>
          state.id === stateId
            ? {
                ...state,
                cities: (state.cities || []).map((city) =>
                  city.id === cityId ? { ...city, deliveryFeeAdjustment: fee } : city,
                ),
              }
            : state,
        ),
      })
    }

    // Add a small delay to avoid too many API calls when typing
    clearTimeout(updateDeliveryFeeTimeout.current)
    updateDeliveryFeeTimeout.current = setTimeout(() => {
      saveDeliverySettingsAfterChange()
    }, 1000) // 1 second delay
  }

  // Save delivery settings
  const saveDeliverySettings = async (token: string): Promise<boolean> => {
    try {
      // Create a JSON string of the delivery settings
      const deliveryData = JSON.stringify({
        states: deliverySettings.states || [],
      })

      // Create the URL with the JSON data as a query parameter
      const url = `${API_BASE_URL}/StoreSettings/Delivery/update?dto=${encodeURIComponent(deliveryData)}`
      console.log("Saving delivery settings to:", url)

      // Make the API call
      const deliveryResponse = await fetch(url, {
        method: "GET", // Using GET as specified in the API
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (!deliveryResponse.ok) {
        const errorText = await deliveryResponse.text()
        console.error("Delivery settings response not OK:", errorText)
        throw new Error(`Failed to save delivery settings: ${deliveryResponse.status} ${deliveryResponse.statusText}`)
      }

      console.log("Delivery settings saved successfully")
      return true
    } catch (error) {
      console.error("Error saving delivery settings:", error)
      throw error
    }
  }

  // Save general settings
  const saveGeneralSettings = async (token: string): Promise<boolean> => {
    try {
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

      return true
    } catch (error) {
      console.error("Error saving general settings:", error)
      throw error
    }
  }

  // Save currency settings
  const saveCurrencySettings = async (token: string): Promise<boolean> => {
    try {
      // Save currency settings
      const currencyResponse = await fetch(`${API_BASE_URL}/StoreSettings/Currency`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(currencySettings),
      })

      if (!currencyResponse.ok) {
        const errorText = await currencyResponse.text()
        console.error("Currency settings response not OK:", errorText)
        throw new Error(`Failed to save currency settings: ${currencyResponse.status} ${currencyResponse.statusText}`)
      }

      const updatedCurrency = await currencyResponse.json()
      console.log("Currency settings saved successfully:", updatedCurrency)
      setCurrencySettings(updatedCurrency)

      return true
    } catch (error) {
      console.error("Error saving currency settings:", error)
      throw error
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        setIsSaving(false)
        return
      }

      // Get the form element that was submitted
      const form = e.target as HTMLFormElement

      // Determine which tab's form is being submitted by checking the form's id
      const formId = form.id
      let success = false

      if (formId === "general-settings-form") {
        success = await saveGeneralSettings(token)
      } else if (formId === "currency-settings-form") {
        success = await saveCurrencySettings(token)
      } else if (formId === "delivery-settings-form") {
        success = await saveDeliverySettings(token)
      }

      if (success) {
        const tabName = formId.split("-")[0]
        toast.success(`${tabName.charAt(0).toUpperCase() + tabName.slice(1)} settings saved successfully`)
      }
    } catch (error) {
      console.error("Error saving settings:", error)
      toast.error(`Failed to save settings. Please try again.`)
    } finally {
      setIsSaving(false)
    }
  }

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null) return "Not set"

    const { symbol, leftOriented } = currencySettings
    return leftOriented ? `${symbol}${amount.toFixed(2)}` : `${amount.toFixed(2)}${symbol}`
  }

  // Add this after your other useEffect hooks
  useEffect(() => {
    // This will run whenever the tab changes in the Tabs context
    const handleTabsChange = () => {
      if (!isSaving) {
        setActiveTab(document.querySelector('[data-state="active"]')?.getAttribute("data-value") || "general")
      }
    }

    // Add event listeners to tab buttons
    const tabButtons = document.querySelectorAll('[role="tab"]')
    tabButtons.forEach((button) => {
      button.addEventListener("click", handleTabsChange)
    })

    return () => {
      tabButtons.forEach((button) => {
        button.removeEventListener("click", handleTabsChange)
      })
    }
  }, [isSaving])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200 mb-6">Store Settings</h1>

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">
            <div className="flex items-center gap-1">
              <Settings className="h-4 w-4" />
              General
            </div>
          </TabsTrigger>
          <TabsTrigger value="currency">
            <div className="flex items-center gap-1">
              <CreditCard className="h-4 w-4" />
              Currency
            </div>
          </TabsTrigger>
          <TabsTrigger value="delivery">
            <div className="flex items-center gap-1">
              <TruckIcon className="h-4 w-4" />
              Delivery
            </div>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
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
                    <p className="text-sm text-muted-foreground">
                      Upload your site's favicon (recommended: .ico format)
                    </p>
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
        </TabsContent>

        <TabsContent value="currency">
          <form id="currency-settings-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Currency tab content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Currency Settings
                </CardTitle>
                <CardDescription>Configure your store's currency and display options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="currency">Store Currency</Label>
                    <Select
                      value={availableCurrencies.find((c) => c.name === currencySettings.name)?.key || ""}
                      onValueChange={handleCurrencyChange}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select currency" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableCurrencies.map((currency) => (
                          <SelectItem key={currency.key} value={currency.key}>
                            <span className="flex items-center gap-2">
                              <span className="font-mono">{currency.symbol}</span>
                              <span>
                                {currency.name} ({currency.key})
                              </span>
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-muted-foreground">Select the primary currency for your store</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Symbol Position</Label>
                    <div className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <div className="text-base">
                          {currencySettings.leftOriented
                            ? `${currencySettings.symbol}100.00`
                            : `100.00${currencySettings.symbol}`}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {currencySettings.leftOriented ? "Symbol before amount" : "Symbol after amount"}
                        </p>
                      </div>
                      <Switch checked={currencySettings.leftOriented} onCheckedChange={handleOrientationChange} />
                    </div>
                  </div>
                </div>

                <Alert className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                  <Globe className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <AlertTitle className="text-blue-600 dark:text-blue-400">Currency Information</AlertTitle>
                  <AlertDescription className="text-blue-600/80 dark:text-blue-400/80">
                    Changing your store's currency will affect how prices are displayed to customers. It does not
                    automatically convert existing product prices.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isSaving} className="px-6">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Currency Settings"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>

        <TabsContent value="delivery">
          <form id="delivery-settings-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Delivery tab content */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TruckIcon className="h-5 w-5" />
                  Delivery Settings
                </CardTitle>
                <CardDescription>Configure delivery fees and supported locations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Location Management */}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-medium">Delivery Locations</h3>
                    <Dialog open={showAddStateDialog} onOpenChange={setShowAddStateDialog}>
                      <DialogTrigger asChild>
                        <Button
                          type="button"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={(e) => {
                            e.preventDefault() // Prevent any form submission
                            setShowAddStateDialog(true)
                          }}
                        >
                          <Plus className="h-4 w-4" />
                          Add State/Province
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add State/Province</DialogTitle>
                          <DialogDescription>Add a new state or province to your delivery locations</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Label htmlFor="stateName">Name</Label>
                            <Input
                              id="stateName"
                              name="name"
                              value={newLocationForm.name}
                              onChange={handleFormInputChange}
                              placeholder="e.g. California"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="stateDeliveryFee">Delivery Fee Adjustment (Optional)</Label>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                {currencySettings.symbol}
                              </span>
                              <Input
                                id="stateDeliveryFee"
                                name="deliveryFeeAdjustment"
                                type="number"
                                min="0"
                                step="0.01"
                                className="pl-8"
                                value={newLocationForm.deliveryFeeAdjustment}
                                onChange={handleFormInputChange}
                                placeholder="Use standard fee"
                              />
                            </div>
                            <p className="text-sm text-muted-foreground">
                              Leave empty to use the standard delivery fee
                            </p>
                          </div>
                        </div>
                        <DialogFooter>
                          <Button type="button" variant="outline" onClick={() => setShowAddStateDialog(false)}>
                            Cancel
                          </Button>
                          <Button type="button" onClick={handleAddState}>
                            Add State/Province
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>

                  {!deliverySettings.states || deliverySettings.states.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-8 border border-dashed rounded-lg">
                      <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
                      <h4 className="text-lg font-medium mb-2">No Locations Added</h4>
                      <p className="text-sm text-muted-foreground text-center mb-4">
                        Add states or provinces to configure location-specific delivery options
                      </p>
                      <Button
                        variant="outline"
                        onClick={() => setShowAddStateDialog(true)}
                        className="flex items-center gap-1"
                      >
                        <Plus className="h-4 w-4" />
                        Add State/Province
                      </Button>
                    </div>
                  ) : (
                    <Accordion type="multiple" className="w-full">
                      {deliverySettings.states.map((state) => (
                        <AccordionItem key={state.id} value={`state-${state.id}`}>
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center justify-between w-full pr-4">
                              <span>{state.name}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-sm text-muted-foreground">
                                  Fee Adjustment:{" "}
                                  {state.deliveryFeeAdjustment !== null
                                    ? formatCurrency(state.deliveryFeeAdjustment)
                                    : "Standard"}
                                </span>
                                <span className="text-sm text-muted-foreground">
                                  {state.cities?.length || 0} {state.cities?.length === 1 ? "City" : "Cities"}
                                </span>
                              </div>
                            </div>
                          </AccordionTrigger>
                          <AccordionContent>
                            <div className="space-y-4 pt-2">
                              <div className="flex items-center justify-between">
                                <div className="space-y-1">
                                  <Label htmlFor={`state-${state.id}-fee`}>State Delivery Fee Adjustment</Label>
                                  <div className="relative w-48">
                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                      {currencySettings.symbol}
                                    </span>
                                    <Input
                                      id={`state-${state.id}-fee`}
                                      type="number"
                                      min="0"
                                      step="0.01"
                                      className="pl-8"
                                      value={state.deliveryFeeAdjustment?.toString() || ""}
                                      onChange={(e) =>
                                        handleUpdateDeliveryFee("state", state.id, undefined, e.target.value)
                                      }
                                      placeholder="Use standard fee"
                                    />
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Dialog>
                                    <DialogTrigger asChild>
                                      <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={(e) => {
                                          e.preventDefault() // Prevent any form submission
                                          setSelectedStateId(state.id)
                                          setShowAddCityDialog(true)
                                          resetForm()
                                        }}
                                        className="flex items-center gap-1"
                                      >
                                        <Plus className="h-4 w-4" />
                                        Add City
                                      </Button>
                                    </DialogTrigger>
                                    <DialogContent>
                                      <DialogHeader>
                                        <DialogTitle>Add City to {state.name}</DialogTitle>
                                        <DialogDescription>Add a new city to this state/province</DialogDescription>
                                      </DialogHeader>
                                      <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="cityName">City Name</Label>
                                          <Input
                                            id="cityName"
                                            name="name"
                                            value={newLocationForm.name}
                                            onChange={handleFormInputChange}
                                            placeholder="e.g. Los Angeles"
                                          />
                                        </div>
                                        <div className="space-y-2">
                                          <Label htmlFor="cityDeliveryFee">Delivery Fee Adjustment (Optional)</Label>
                                          <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                              {currencySettings.symbol}
                                            </span>
                                            <Input
                                              id="cityDeliveryFee"
                                              name="deliveryFeeAdjustment"
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              className="pl-8"
                                              value={newLocationForm.deliveryFeeAdjustment}
                                              onChange={handleFormInputChange}
                                              placeholder="Use state fee"
                                            />
                                          </div>
                                          <p className="text-sm text-muted-foreground">
                                            Leave empty to use the state's delivery fee
                                          </p>
                                        </div>
                                      </div>
                                      <DialogFooter>
                                        <Button type="button" variant="outline" onClick={() => resetForm()}>
                                          Cancel
                                        </Button>
                                        <Button type="button" onClick={handleAddCity}>
                                          Add City
                                        </Button>
                                      </DialogFooter>
                                    </DialogContent>
                                  </Dialog>
                                  <Button
                                    size="sm"
                                    variant="destructive"
                                    onClick={() => handleRemoveState(state.id)}
                                    className="flex items-center gap-1"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Remove State
                                  </Button>
                                </div>
                              </div>

                              {/* Cities Table */}
                              {state.cities && state.cities.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow>
                                      <TableHead>City</TableHead>
                                      <TableHead>Delivery Fee Adjustment</TableHead>
                                      <TableHead>Regions</TableHead>
                                      <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {state.cities.map((city) => (
                                      <TableRow key={city.id}>
                                        <TableCell>{city.name}</TableCell>
                                        <TableCell>
                                          <div className="relative w-32">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                              {currencySettings.symbol}
                                            </span>
                                            <Input
                                              type="number"
                                              min="0"
                                              step="0.01"
                                              className="pl-8"
                                              value={city.deliveryFeeAdjustment?.toString() || ""}
                                              onChange={(e) =>
                                                handleUpdateDeliveryFee("city", state.id, city.id, e.target.value)
                                              }
                                              placeholder="Use state fee"
                                            />
                                          </div>
                                        </TableCell>
                                        <TableCell>
                                          <span className="text-sm">
                                            {city.regions?.length || 0}{" "}
                                            {city.regions?.length === 1 ? "Region" : "Regions"}
                                          </span>
                                        </TableCell>
                                        <TableCell className="text-right">
                                          <div className="flex items-center justify-end gap-2">
                                            <Button
                                              type="button"
                                              size="sm"
                                              variant="outline"
                                              onClick={(e) => {
                                                e.preventDefault() // Prevent any form submission
                                                setSelectedStateId(state.id)
                                                setSelectedCityId(city.id)
                                                setShowAddRegionDialog(true)
                                                resetForm()
                                              }}
                                              className="flex items-center gap-1"
                                            >
                                              <Plus className="h-4 w-4" />
                                              Add Region
                                            </Button>
                                            <Button
                                              size="sm"
                                              variant="destructive"
                                              onClick={() => handleRemoveCity(state.id, city.id)}
                                              className="flex items-center gap-1"
                                            >
                                              <Trash2 className="h-4 w-4" />
                                              Remove
                                            </Button>
                                          </div>
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg">
                                  <p className="text-sm text-muted-foreground mb-2">
                                    No cities added to this state/province
                                  </p>
                                  <Button
                                    type="button"
                                    size="sm"
                                    variant="outline"
                                    onClick={(e) => {
                                      e.preventDefault() // Prevent any form submission
                                      setSelectedStateId(state.id)
                                      setShowAddCityDialog(true)
                                      resetForm()
                                    }}
                                    className="flex items-center gap-1"
                                  >
                                    <Plus className="h-4 w-4" />
                                    Add City
                                  </Button>
                                </div>
                              )}

                              {/* Regions for each city */}
                              {state.cities?.map(
                                (city) =>
                                  city.regions &&
                                  city.regions.length > 0 && (
                                    <div key={`regions-${city.id}`} className="mt-4">
                                      <h4 className="text-sm font-medium mb-2">Regions in {city.name}</h4>
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>Region</TableHead>
                                            <TableHead className="text-right">Actions</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {city.regions.map((region) => (
                                            <TableRow key={region.id}>
                                              <TableCell>{region.name}</TableCell>
                                              <TableCell className="text-right">
                                                <Button
                                                  size="sm"
                                                  variant="destructive"
                                                  onClick={() => handleRemoveRegion(state.id, city.id, region.id)}
                                                  className="flex items-center gap-1"
                                                >
                                                  <Trash2 className="h-4 w-4" />
                                                  Remove
                                                </Button>
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    </div>
                                  ),
                              )}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Save Button */}
            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isSaving} className="px-6">
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Delivery Settings"
                )}
              </Button>
            </div>
          </form>
        </TabsContent>
      </Tabs>

      {/* Add Region Dialog */}
      <Dialog open={showAddRegionDialog} onOpenChange={setShowAddRegionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Region</DialogTitle>
            <DialogDescription>Add a new region to the selected city</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="regionName">Region Name</Label>
              <Input
                id="regionName"
                name="name"
                value={newLocationForm.name}
                onChange={handleFormInputChange}
                placeholder="e.g. Downtown"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowAddRegionDialog(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleAddRegion}>
              Add Region
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
