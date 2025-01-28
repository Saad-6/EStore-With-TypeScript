'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm, FormProvider } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"

import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

import { toast } from '@/hooks/use-toast'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/app/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/app/components/ui/input'
import { ColorPicker } from '@/app/components/ui/Color-Picker'


const formSchema = z.object({
  bannerText: z.string().min(1, "Banner text is required"),
  bannerMoving: z.boolean(),
  bannerBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  bannerTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  navbarBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  navbarTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  footerBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  footerTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  bodyBackgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  bodyTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  primaryButtonColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  primaryButtonTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  secondaryButtonColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  secondaryButtonTextColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color"),
  headingFont: z.string().min(1, "Heading font is required"),
  bodyFont: z.string().min(1, "Body font is required"),
  sidebarPosition: z.enum(["left", "right"]),
  contentWidth: z.enum(["full", "contained"]),
})

export default function DesignCustomizationPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      bannerText: "Welcome to our store!",
      bannerMoving: true,
      bannerBackgroundColor: "#000000",
      bannerTextColor: "#FFFFFF",
      navbarBackgroundColor: "#FFFFFF",
      navbarTextColor: "#000000",
      footerBackgroundColor: "#F3F4F6",
      footerTextColor: "#4B5563",
      bodyBackgroundColor: "#FFFFFF",
      bodyTextColor: "#1F2937",
      primaryButtonColor: "#3B82F6",
      primaryButtonTextColor: "#FFFFFF",
      secondaryButtonColor: "#9CA3AF",
      secondaryButtonTextColor: "#FFFFFF",
      headingFont: "Inter",
      bodyFont: "Roboto",
      sidebarPosition: "left",
      contentWidth: "contained",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/admin/design', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error('Failed to save design settings')
      }

      toast({
        title: "Success",
        description: "Design settings have been saved.",
      })
      router.refresh()
    } catch (error) {
      console.error('Error saving design settings:', error)
      toast({
        title: "Error",
        description: "Failed to save design settings. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-8">Design Customization</h1>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="banner" >
            <TabsList >
              <TabsTrigger value="banner">Banner</TabsTrigger>
              <TabsTrigger value="navbar">Navbar</TabsTrigger>
              <TabsTrigger value="footer">Footer</TabsTrigger>
              <TabsTrigger value="body">Body</TabsTrigger>
              <TabsTrigger value="buttons">Buttons</TabsTrigger>
              <TabsTrigger value="typography">Typography</TabsTrigger>
              <TabsTrigger value="layout">Layout</TabsTrigger>
            </TabsList>
            <TabsContent value="banner">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="bannerText"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Text</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter banner text" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bannerMoving"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>
                            Moving Banner
                          </FormLabel>
                          <FormDescription>
                            Enable moving text for the banner
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bannerBackgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Background Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bannerTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Banner Text Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="navbar">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="navbarBackgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navbar Background Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="navbarTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Navbar Text Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="footer">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="footerBackgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Background Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="footerTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Footer Text Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="body">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="bodyBackgroundColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Background Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bodyTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Text Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="buttons">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="primaryButtonColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Button Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="primaryButtonTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Button Text Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryButtonColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Button Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="secondaryButtonTextColor"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Secondary Button Text Color</FormLabel>
                        <FormControl>
                          <ColorPicker {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="typography">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="headingFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Heading Font</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Inter" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="bodyFont"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Body Font</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Roboto" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="layout">
              <Card>
                <CardContent className="space-y-4 pt-6">
                  <FormField
                    control={form.control}
                    name="sidebarPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sidebar Position</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="left" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Left
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="right" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Right
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contentWidth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content Width</FormLabel>
                        <FormControl>
                          <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-1"
                          >
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="full" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Full Width
                              </FormLabel>
                            </FormItem>
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <RadioGroupItem value="contained" />
                              </FormControl>
                              <FormLabel className="font-normal">
                                Contained
                              </FormLabel>
                            </FormItem>
                          </RadioGroup>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </FormProvider>
    </div>
  )
}

