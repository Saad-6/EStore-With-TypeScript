"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "react-hot-toast"
import { DollarSign, Globe, Loader2 } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7007/api"

// Types
interface SimplifiedCurrency {
  key: string
  name: string
  symbol: string
  leftOriented: boolean
}

interface CurrencyDTO {
  symbol: string
  name: string
  leftOriented: boolean
}

export default function CurrencySettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [availableCurrencies, setAvailableCurrencies] = useState<SimplifiedCurrency[]>([])
  const [currencySettings, setCurrencySettings] = useState<CurrencyDTO>({
    symbol: "$",
    name: "US Dollar",
    leftOriented: true,
  })

  const { getToken } = useAuth()

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await fetchAvailableCurrencies()
        await fetchActiveCurrency()
      } catch (error) {
        console.error("Error fetching currency data:", error)
        toast.error("Failed to load currency settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

  // Save currency settings
  const saveCurrencySettings = async () => {
    try {
      setIsSaving(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return false
      }

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

      setCurrencySettings(updatedCurrency)
      toast.success("Currency settings saved successfully")
      return true
    } catch (error) {
      console.error("Error saving currency settings:", error)
      toast.error("Failed to save currency settings. Please try again.")
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await saveCurrencySettings()
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
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
  )
}
