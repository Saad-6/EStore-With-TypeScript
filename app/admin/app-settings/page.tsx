'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { toast } from 'react-hot-toast'
import { Loader2 } from 'lucide-react'
import { Input } from '@/app/components/ui/input'

interface SiteSettings {
  url: string
  id: number
}

export default function SiteSettingsPage() {
  const [settings, setSettings] = useState<SiteSettings>({ url: '', id: 0 })
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchSettings = async () => {
      setIsLoading(true)
      try {
        const response = await fetch('https://localhost:7007/api/SiteSettings')
        if (!response.ok) {
          throw new Error('Failed to fetch site settings')
        }
        const data = await response.json()
        setSettings(data)
      } catch (error) {
        console.error('Error fetching site settings:', error)
        toast.error('Failed to load site settings. Please try again.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSettings({ ...settings, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      const response = await fetch('https://localhost:7007/api/SiteSettings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error('Failed to save site settings')
      }

      toast.success('Site settings saved successfully')
      router.refresh()
    } catch (error) {
      console.error('Error saving site settings:', error)
      toast.error('Failed to save site settings. Please try again.')
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
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Site Settings</CardTitle>
          <CardDescription>Manage your e-commerce site settings</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="URL">Base URL</Label>
                <Input
                  id="URL"
                  name="url"
                  value={settings.url}
                  onChange={handleInputChange}
                  placeholder="https://www.yourdomain.com"
                  required
                />
              </div>
              {/* Add more settings fields here as needed */}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Settings'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}