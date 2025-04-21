"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { Label } from "@/components/ui/label"
import { Input } from "@/app/components/ui/input"
import { useAuth } from "@/app/lib/auth"
import toast from "react-hot-toast"

interface EmailConfiguration {
  server: string
  port: number
  email: string
  password: string
}

export default function EmailSettingsPage() {
  const [emailConfig, setEmailConfig] = useState<EmailConfiguration>({
    server: "",
    port: 587,
    email: "",
    password: "",
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [hasExistingConfig, setHasExistingConfig] = useState(false)

const { getToken } = useAuth()
  useEffect(() => {
    fetchEmailSettings()
  }, [])

  const fetchEmailSettings = async () => {
    try {
        const token = getToken()
            if (!token) {
              toast.error("Authentication token not found")
              return
            }
      setLoading(true)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/StoreSettings/Email`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        console.log("Status code : ", response)
        if(response.status === 204){
            setHasExistingConfig(false)
            return;
        }
        const data = await response.json()
        setEmailConfig({
          server: data.server,
          port: data.port,
          email: data.email,
          password: data.password,
        })
        setHasExistingConfig(true)
      }  else {
        throw new Error(`Failed to fetch email settings: ${response.status}`)
      }
    } catch (error) {
      console.error("Error fetching email settings:", error)
      toast.error("Failed to load email settings. Please try again.");
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setEmailConfig((prev) => ({
      ...prev,
      [name]: name === "port" ? Number.parseInt(value) || 0 : value,
    }))
  }

  const saveEmailSettings = async () => {
    try {
      setSaving(true)

      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
      // Validate inputs
      if (!emailConfig.server || !emailConfig.email || !emailConfig.password || !emailConfig.port) {
        toast("All fields are required")
        return
      }

      const operation = hasExistingConfig ? "update" : "add"

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/StoreSettings/Email/settinngs?operation=${operation}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            server: emailConfig.server,
            port: emailConfig.port,
            email: emailConfig.email,
            password: emailConfig.password,
          }),
        },
      )

      if (response.ok) {
        toast.success(`Email settings ${hasExistingConfig ? "updated" : "saved"} successfully`);
        setHasExistingConfig(true)
      } else {
        const errorData = await response.text()
        throw new Error(errorData || `Failed to save email settings: ${response.status}`)
      }
    } catch (error) {
      console.error("Error saving email settings:", error)
      toast.error(error instanceof Error ? error.message : "Failed to save email settings");
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Email Server Settings</CardTitle>
          <CardDescription>
            Configure the email server used for sending order confirmations, password resets, and other notifications.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="server">SMTP Server</Label>
            <Input
              id="server"
              name="server"
              placeholder="smtp.example.com"
              value={emailConfig.server}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="port">Port</Label>
            <Input
              id="port"
              name="port"
              type="number"
              placeholder="587"
              value={emailConfig.port}
              onChange={handleInputChange}
            />
            <p className="text-sm text-muted-foreground">Common ports: 25, 465, 587</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address <small className="text-slate-500">(Sometimes referred to as 'Username')</small></Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="noreply@yourstore.com"
              value={emailConfig.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={emailConfig.password}
              onChange={handleInputChange}
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={saveEmailSettings} disabled={saving} className="w-full">
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {hasExistingConfig ? "Updating..." : "Saving..."}
              </>
            ) : hasExistingConfig ? (
              "Update Email Settings"
            ) : (
              "Save Email Settings"
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
