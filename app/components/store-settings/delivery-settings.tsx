"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Input } from "../ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "react-hot-toast"
import { ChevronDown, ChevronRight, Loader2, MapPin, Plus, Save, Trash2, TruckIcon } from "lucide-react"
import { useAuth } from "@/app/lib/auth"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://localhost:7007/api"

// Entity types (used internally)
interface RegionEntity {
  id: number
  name: string
  cityId: number
  isNew?: boolean
}

interface CityEntity {
  id: number
  name: string
  stateId: number
  deliveryFeeAdjustment: number | null
  regions: RegionEntity[]
  isExpanded?: boolean
}

interface StateEntity {
  id: number
  name: string
  deliveryFeeAdjustment: number | null
  cities: CityEntity[]
  isExpanded?: boolean
}

// DTO types (for API communication)
interface RegionDTO {
  id: number
  name: string
  cityId: number
}

interface CityDTO {
  id: number
  name: string
  stateId: number
  deliveryFeeAdjustment: number | null
  regions: RegionDTO[]
}

interface StateDTO {
  id: number
  name: string
  deliveryFeeAdjustment: number | null
  cities: CityDTO[]
}

interface DeliveryDTO {
  states: StateDTO[]
}

interface CurrencyDTO {
  symbol: string
  name: string
  leftOriented: boolean
}

export default function DeliverySettings() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [deliverySettings, setDeliverySettings] = useState<{
    states: StateEntity[]
  }>({
    states: [],
  })
  const [currencySettings, setCurrencySettings] = useState<CurrencyDTO>({
    symbol: "$",
    name: "US Dollar",
    leftOriented: true,
  })
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)

  // New location form
  const [newLocationName, setNewLocationName] = useState("")
  const [newLocationFee, setNewLocationFee] = useState("")
  const [selectedStateId, setSelectedStateId] = useState<number | null>(null)
  const [selectedCityId, setSelectedCityId] = useState<number | null>(null)
  const [addingLocationType, setAddingLocationType] = useState<"state" | "city" | "region" | null>(null)

  const updateDeliveryFeeTimeout = useRef<ReturnType<typeof setTimeout> | null>(null)
  const { getToken } = useAuth()

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        await fetchDeliverySettings()
        await fetchActiveCurrency()
      } catch (error) {
        console.error("Error fetching data:", error)
        toast.error("Failed to load delivery settings")
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

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

      // Ensure the data has the expected structure
      if (data && typeof data === "object") {
        // If states is missing, initialize it as an empty array
        const sanitizedData = {
          states: Array.isArray(data.states) ? data.states : [],
          ...data,
        }
        setDeliverySettings(sanitizedData)
        setHasUnsavedChanges(false)
      }
    } catch (error) {
      console.error("Error fetching delivery settings:", error)
      setError("Failed to load delivery settings. Please try again.")
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

      if (response.status === 404) {
        console.log("No active currency set, using default")
        return
      }

      if (!response.ok) {
        console.error(`Failed to fetch active currency: ${response.status} ${response.statusText}`)
        return
      }

      const text = await response.text()
      if (!text || text.trim() === "") {
        console.log("Empty response from currency endpoint")
        return
      }

      try {
        const data = JSON.parse(text)
        if (data && typeof data === "object" && "symbol" in data && "name" in data) {

          setCurrencySettings(data)
        }
      } catch (parseError) {
        console.error("Error parsing currency data:", parseError)
      }
    } catch (error) {
      console.error("Error fetching active currency:", error)
    }
  }

  // Convert internal entities to DTOs for API
  const prepareDeliveryDTO = (): DeliveryDTO => {
    return {
      states: deliverySettings.states.map((state) => ({
        id: state.id,
        name: state.name,
        deliveryFeeAdjustment: state.deliveryFeeAdjustment,
        cities: (state.cities || []).map((city) => ({
          id: city.id,
          name: city.name,
          stateId: city.stateId,
          deliveryFeeAdjustment: city.deliveryFeeAdjustment,
          regions: (city.regions || []).map((region) => ({
            id: region.id,
            name: region.name,
            cityId: region.cityId,
          })),
        })),
      })),
    }
  }

  // Save delivery settings
  const saveDeliverySettings = async () => {
    try {
      setIsSaving(true)
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return false
      }

      // Prepare the DTO
      const deliveryDTO = prepareDeliveryDTO()

      // Make the API call with the proper DTO format
      const deliveryResponse = await fetch(`${API_BASE_URL}/StoreSettings/Delivery/update`, {
        method: "POST", // Changed to POST to match the server endpoint
        headers: {
          "Content-Type": "application/json", // Important for [FromBody] binding
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        // Send the DTO directly in the request body
        body: JSON.stringify(deliveryDTO),
      })

      if (!deliveryResponse.ok) {
        const errorText = await deliveryResponse.text()
        console.error("Delivery settings response not OK:", errorText)
        throw new Error(`Failed to save delivery settings: ${deliveryResponse.status} ${deliveryResponse.statusText}`)
      }

      toast.success("Delivery settings saved successfully")
      setError(null)
      setHasUnsavedChanges(false)
      return true
    } catch (error) {
      console.error("Error saving delivery settings:", error)
      toast.error("Failed to save delivery settings. Please try again.")
      setError("Failed to save delivery settings. Please try again.")
      return false
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

  // Reset form
  const resetForm = () => {
    setNewLocationName("")
    setNewLocationFee("")
    setAddingLocationType(null)
    setSelectedStateId(null)
    setSelectedCityId(null)
  }

  // Mark changes as unsaved
  const markAsUnsaved = () => {
    setHasUnsavedChanges(true)
  }

  // Add new state
  const handleAddState = () => {
    if (!newLocationName.trim()) {
      toast.error("State/Province name is required")
      return
    }

    const newState: StateEntity = {
      id: Math.floor(Math.random() * 1000000), // Use a smaller integer ID
      name: newLocationName.trim(),
      deliveryFeeAdjustment: newLocationFee ? Number.parseFloat(newLocationFee) : null,
      cities: [],
      isExpanded: true,
    }

    setDeliverySettings({
      ...deliverySettings,
      states: [...(deliverySettings.states || []), newState],
    })

    resetForm()
    markAsUnsaved()
  }

  // Add new city
  const handleAddCity = () => {
    if (!selectedStateId) {
      toast.error("No state selected")
      return
    }

    if (!newLocationName.trim()) {
      toast.error("City name is required")
      return
    }

    const newCity: CityEntity = {
      id: Math.floor(Math.random() * 1000000), // Use a smaller integer ID
      name: newLocationName.trim(),
      stateId: selectedStateId,
      deliveryFeeAdjustment: newLocationFee ? Number.parseFloat(newLocationFee) : null,
      regions: [],
      isExpanded: true,
    }

    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) => {
        if (state.id === selectedStateId) {
          return {
            ...state,
            cities: [...(state.cities || []), newCity],
          }
        }
        return state
      }),
    })

    resetForm()
    markAsUnsaved()
  }

  // Add new region
  const handleAddRegion = () => {
    if (!selectedStateId || !selectedCityId) {
      toast.error("No state or city selected")
      return
    }

    if (!newLocationName.trim()) {
      toast.error("Region name is required")
      return
    }

    const newRegion: RegionEntity = {
      id: Math.floor(Math.random() * 1000000), // Use a smaller integer ID
      name: newLocationName.trim(),
      cityId: selectedCityId,
    }

    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) => {
        if (state.id === selectedStateId) {
          return {
            ...state,
            cities: (state.cities || []).map((city) => {
              if (city.id === selectedCityId) {
                return {
                  ...city,
                  regions: [...(city.regions || []), newRegion],
                }
              }
              return city
            }),
          }
        }
        return state
      }),
    })

    resetForm()
    markAsUnsaved()
  }

  // Remove state
  const handleRemoveState = (stateId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).filter((state) => state.id !== stateId),
    })
    markAsUnsaved()
  }

  // Remove city
  const handleRemoveCity = (stateId: number, cityId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) => {
        if (state.id === stateId) {
          return {
            ...state,
            cities: (state.cities || []).filter((city) => city.id !== cityId),
          }
        }
        return state
      }),
    })
    markAsUnsaved()
  }

  // Remove region
  const handleRemoveRegion = (stateId: number, cityId: number, regionId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) => {
        if (state.id === stateId) {
          return {
            ...state,
            cities: (state.cities || []).map((city) => {
              if (city.id === cityId) {
                return {
                  ...city,
                  regions: (city.regions || []).filter((region) => region.id !== regionId),
                }
              }
              return city
            }),
          }
        }
        return state
      }),
    })
    markAsUnsaved()
  }

  // Toggle state expansion
  const toggleStateExpansion = (stateId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) => {
        if (state.id === stateId) {
          return { ...state, isExpanded: !state.isExpanded }
        }
        return state
      }),
    })
  }

  // Toggle city expansion
  const toggleCityExpansion = (stateId: number, cityId: number) => {
    setDeliverySettings({
      ...deliverySettings,
      states: (deliverySettings.states || []).map((state) => {
        if (state.id === stateId) {
          return {
            ...state,
            cities: (state.cities || []).map((city) => {
              if (city.id === cityId) {
                return { ...city, isExpanded: !city.isExpanded }
              }
              return city
            }),
          }
        }
        return state
      }),
    })
  }

  // Update delivery fee
  const handleUpdateDeliveryFee = (type: "state" | "city", stateId: number, cityId?: number, value?: string) => {
    const fee = value === "" || value === undefined ? null : Number.parseFloat(value)

    if (type === "state") {
      setDeliverySettings({
        ...deliverySettings,
        states: (deliverySettings.states || []).map((state) => {
          if (state.id === stateId) {
            return { ...state, deliveryFeeAdjustment: fee }
          }
          return state
        }),
      })
    } else if (type === "city" && cityId) {
      setDeliverySettings({
        ...deliverySettings,
        states: (deliverySettings.states || []).map((state) => {
          if (state.id === stateId) {
            return {
              ...state,
              cities: (state.cities || []).map((city) => {
                if (city.id === cityId) {
                  return { ...city, deliveryFeeAdjustment: fee }
                }
                return city
              }),
            }
          }
          return state
        }),
      })
    }

    // Mark as unsaved but don't save immediately
    markAsUnsaved()

    // Clear any existing timeout
    clearTimeout(updateDeliveryFeeTimeout.current)
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TruckIcon className="h-5 w-5" />
          Delivery Settings
        </CardTitle>
        <CardDescription>Configure delivery locations and fees for your store</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Delivery Locations</h3>
          <Button onClick={() => setAddingLocationType("state")} size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" /> Add State/Province
          </Button>
        </div>

        {!deliverySettings.states || deliverySettings.states.length === 0 ? (
          <div className="text-center py-8 border border-dashed rounded-md">
            <MapPin className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No delivery locations configured</p>
            <Button variant="outline" size="sm" className="mt-2" onClick={() => setAddingLocationType("state")}>
              Add your first state
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {deliverySettings.states.map((state) => (
              <div key={state.id} className="border border-muted rounded-md overflow-hidden">
                <div
                  className="flex items-center justify-between px-4 py-3 bg-muted/30 cursor-pointer"
                  onClick={() => toggleStateExpansion(state.id)}
                >
                  <div className="flex items-center gap-2">
                    {state.isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    <span className="font-medium">{state.name}</span>

                    {state.deliveryFeeAdjustment !== null && (
                      <Badge variant="outline" className="ml-2">
                        Fee: {formatCurrency(state.deliveryFeeAdjustment)}
                      </Badge>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleRemoveState(state.id)
                      }}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>

                {state.isExpanded && (
                  <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor={`state-${state.id}-fee`}>Delivery Fee Adjustment</Label>
                        <div className="relative">
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
                            onChange={(e) => handleUpdateDeliveryFee("state", state.id, undefined, e.target.value)}
                            placeholder="Use standard fee"
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">Leave empty to use the standard delivery fee</p>
                      </div>

                      <div className="flex items-end justify-end">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedStateId(state.id)
                            setAddingLocationType("city")
                          }}
                          className="flex items-center gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          Add City
                        </Button>
                      </div>
                    </div>

                    {/* Cities */}
                    <div className="mt-4">
                      <h4 className="text-sm font-medium mb-2">Cities</h4>

                      {!state.cities || state.cities.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">No cities added</p>
                      ) : (
                        <div className="space-y-3 pl-4">
                          {state.cities.map((city) => (
                            <div key={city.id} className="border rounded-md">
                              <div
                                className="flex items-center justify-between px-3 py-2 bg-muted/20 cursor-pointer"
                                onClick={() => toggleCityExpansion(state.id, city.id)}
                              >
                                <div className="flex items-center gap-2">
                                  {city.isExpanded ? (
                                    <ChevronDown className="h-4 w-4" />
                                  ) : (
                                    <ChevronRight className="h-4 w-4" />
                                  )}
                                  <span className="font-medium text-sm">{city.name}</span>

                                  {city.deliveryFeeAdjustment !== null && (
                                    <Badge variant="outline" className="ml-1 text-xs">
                                      Fee: {formatCurrency(city.deliveryFeeAdjustment)}
                                    </Badge>
                                  )}
                                </div>

                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveCity(state.id, city.id)
                                  }}
                                  className="h-7 w-7 p-0"
                                >
                                  <Trash2 className="h-3 w-3 text-destructive" />
                                </Button>
                              </div>

                              {city.isExpanded && (
                                <div className="p-3 border-t">
                                  <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="space-y-1">
                                      <Label htmlFor={`city-${city.id}-fee`} className="text-xs">
                                        Delivery Fee Adjustment
                                      </Label>
                                      <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                                          {currencySettings.symbol}
                                        </span>
                                        <Input
                                          id={`city-${city.id}-fee`}
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          className="pl-8 h-8 text-sm"
                                          value={city.deliveryFeeAdjustment?.toString() || ""}
                                          onChange={(e) =>
                                            handleUpdateDeliveryFee("city", state.id, city.id, e.target.value)
                                          }
                                          placeholder="Use state fee"
                                        />
                                      </div>
                                      <p className="text-xs text-muted-foreground">
                                        Leave empty to use the state's fee
                                      </p>
                                    </div>

                                    <div className="flex items-end justify-end">
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => {
                                          setSelectedStateId(state.id)
                                          setSelectedCityId(city.id)
                                          setAddingLocationType("region")
                                        }}
                                        className="h-8 text-xs"
                                      >
                                        <Plus className="h-3 w-3 mr-1" /> Add Region
                                      </Button>
                                    </div>
                                  </div>

                                  {/* Regions */}
                                  {city.regions && city.regions.length > 0 && (
                                    <div>
                                      <h5 className="text-xs font-medium mb-2">Regions</h5>
                                      <div className="space-y-2 pl-3">
                                        {city.regions.map((region) => (
                                          <div
                                            key={region.id}
                                            className="flex items-center justify-between bg-muted/10 rounded px-2 py-1"
                                          >
                                            <span className="text-xs">{region.name}</span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRemoveRegion(state.id, city.id, region.id)}
                                              className="h-6 w-6 p-0"
                                            >
                                              <Trash2 className="h-3 w-3 text-destructive" />
                                            </Button>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Location Form */}
        {addingLocationType && (
          <div className="mt-6 border rounded-md p-4">
            <h3 className="text-lg font-medium mb-4">
              {addingLocationType === "state"
                ? "Add State/Province"
                : addingLocationType === "city"
                  ? "Add City"
                  : "Add Region"}
            </h3>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="locationName">Name</Label>
                <Input
                  id="locationName"
                  value={newLocationName}
                  onChange={(e) => setNewLocationName(e.target.value)}
                  placeholder={
                    addingLocationType === "state"
                      ? "e.g. California"
                      : addingLocationType === "city"
                        ? "e.g. Los Angeles"
                        : "e.g. Downtown"
                  }
                />
              </div>

              {addingLocationType !== "region" && (
                <div className="space-y-2">
                  <Label htmlFor="locationFee">Delivery Fee Adjustment (Optional)</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {currencySettings.symbol}
                    </span>
                    <Input
                      id="locationFee"
                      type="number"
                      min="0"
                      step="0.01"
                      className="pl-8"
                      value={newLocationFee}
                      onChange={(e) => setNewLocationFee(e.target.value)}
                      placeholder={addingLocationType === "state" ? "Use standard fee" : "Use state fee"}
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {addingLocationType === "state"
                      ? "Leave empty to use the standard delivery fee"
                      : "Leave empty to use the state's delivery fee"}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel
              </Button>
              <Button
                type="button"
                onClick={
                  addingLocationType === "state"
                    ? handleAddState
                    : addingLocationType === "city"
                      ? handleAddCity
                      : handleAddRegion
                }
              >
                Add {addingLocationType === "state" ? "State" : addingLocationType === "city" ? "City" : "Region"}
              </Button>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter className="flex justify-end border-t pt-4">
        {hasUnsavedChanges && <p className="text-amber-600 mr-auto text-sm">You have unsaved changes</p>}
        <Button
          onClick={saveDeliverySettings}
          disabled={isSaving || !hasUnsavedChanges}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <div className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full"></div>
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Delivery Settings
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
