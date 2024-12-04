'use client'

import React, { useState, useEffect } from 'react'
import { useForm, useFieldArray, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Plus, X, Upload, PlusCircle } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Card,
  CardContent,
} from "@/components/ui/card"

import toast from 'react-hot-toast'
import { Input } from '@/app/components/ui/input'

const API_BASE_URL = 'https://localhost:7007/api'

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  type: z.enum(["dropdown", "checkbox"]),
  options: z.array(z.object({
    value: z.string().min(1, "Option value is required"),
    sku: z.string().optional(),
    stock: z.number().min(0, "Stock must be a positive number").optional(),
    priceAdjustment: z.number().optional(),
  })).min(1, "At least one option is required"),
})

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().min(0, "Stock must be a positive number"),
  slug: z.string().min(1, "Slug is required"),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  brand: z.string().optional(),
  variants: z.array(variantSchema).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function CreateProductPage() {
  const [images, setImages] = useState<string[]>([])
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([])
  const { register, control, handleSubmit, setValue, formState: { errors } } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      variants: [{ name: '', type: 'dropdown', options: [{ value: '', sku: '', stock: 0, priceAdjustment: 0 }] }],
    },
  })

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: "variants",
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('An error occurred while fetching categories')
    }
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const response = await fetch(`${API_BASE_URL}/Product?operation=add`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast.success('Product added successfully')
        // Optionally, redirect to product list or clear form
      } else {
        const errorText = await response.text()
        console.error("Failed to add product:", errorText)
        toast.error(`Failed to add product. Server response: ${errorText}`)
      }
    } catch (error) {
      console.error("Error adding product:", error)
      toast.error(`An error occurred while adding the product: ${error}`)
    }
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        const newImages = [...images]
        newImages[index] = reader.result as string
        setImages(newImages)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <PlusCircle className="mr-2 h-8 w-8" />
          Create Product
        </h1>
        <Button 
          type="submit" 
          form="product-form" 
          className="px-6 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 ease-in-out"
        >
          Save Product
        </Button>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap -mx-4">
        <div className="w-full lg:w-2/3 px-4">
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-6">
                <Label htmlFor="name" className="text-sm font-semibold mb-1 block">Product Name</Label>
                <Input id="name" placeholder="Enter product name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="mb-6">
                <Label htmlFor="description" className="text-sm font-semibold mb-1 block">Description</Label>
                <Textarea id="description" rows={7} placeholder="Enter product description" {...register("description")} />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="sku" className="text-sm font-semibold mb-1 block">SKU</Label>
                  <Input id="sku" placeholder="Enter SKU" {...register("sku")} />
                  {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>}
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="price" className="text-sm font-semibold mb-1 block">Price</Label>
                  <Input id="price" type="number" placeholder="Enter price" {...register("price", { valueAsNumber: true })} />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
              </div>

              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="stock" className="text-sm font-semibold mb-1 block">Stock</Label>
                  <Input id="stock" type="number" placeholder="Enter stock" {...register("stock", { valueAsNumber: true })} />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="slug" className="text-sm font-semibold mb-1 block">Slug</Label>
                  <Input id="slug" placeholder="Enter slug" {...register("slug")} />
                  {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">SEO</h2>
              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="metaTitle" className="text-sm font-semibold mb-1 block">Meta Title</Label>
                  <Input id="metaTitle" placeholder="Enter meta title" {...register("metaTitle")} />
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="metaDescription" className="text-sm font-semibold mb-1 block">Meta Description</Label>
                  <Input id="metaDescription" placeholder="Enter meta description" {...register("metaDescription")} />
                </div>
              </div>
              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="metaKeywords" className="text-sm font-semibold mb-1 block">Meta Keywords</Label>
                  <Input id="metaKeywords" placeholder="Enter meta keywords" {...register("metaKeywords")} />
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="canonicalUrl" className="text-sm font-semibold mb-1 block">Canonical URL</Label>
                  <Input id="canonicalUrl" placeholder="Enter canonical URL" {...register("canonicalUrl")} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Variants</h2>
              {variantFields.map((field, index) => (
                <div key={field.id} className="mb-6 p-4 border rounded">
                  <div className="mb-4">
                    <Label htmlFor={`variants.${index}.type`} className="text-sm font-semibold mb-1 block">Variant Type</Label>
                    <Select
                      onValueChange={(value) => {
                        const newVariants = [...variantFields];
                        newVariants[index].type = value as "dropdown" | "checkbox";
                        setValue('variants', newVariants);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select variant type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="dropdown">Dropdown</SelectItem>
                        <SelectItem value="checkbox">Checkbox</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-between items-center mb-4">
                    <Label htmlFor={`variants.${index}.name`} className="text-sm font-semibold mb-1 block">Variant Name</Label>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(index)}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <Input
                    id={`variants.${index}.name`}
                    placeholder="Enter variant name"
                    {...register(`variants.${index}.name` as const)}
                  />
                  {errors.variants?.[index]?.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.variants[index]?.name?.message}</p>
                  )}
                  <Controller
                    render={({ field }) => (
                      <div>
                        {field.value.map((option, optionIndex) => (
                          <div key={optionIndex} className="mt-4 p-4 border rounded">
                            <Input
                              placeholder="Option value"
                              value={option.value}
                              onChange={(e) => {
                                const newOptions = [...field.value];
                                newOptions[optionIndex].value = e.target.value;
                                field.onChange(newOptions);
                              }}
                            />
                            <div className="flex flex-wrap -mx-2 mt-2">
                              <div className="w-1/3 px-2">
                                <Input
                                  placeholder="SKU"
                                  value={option.sku}
                                  onChange={(e) => {
                                    const newOptions = [...field.value];
                                    newOptions[optionIndex].sku = e.target.value;
                                    field.onChange(newOptions);
                                  }}
                                />
                              </div>
                              <div className="w-1/3 px-2">
                                <Input
                                  type="number"
                                  placeholder="Stock"
                                  value={option.stock}
                                  onChange={(e) => {
                                    const newOptions = [...field.value];
                                    newOptions[optionIndex].stock = parseInt(e.target.value);
                                    field.onChange(newOptions);
                                  }}
                                />
                              </div>
                              <div className="w-1/3 px-2">
                                <Input
                                  type="number"
                                  placeholder="Price Adjustment"
                                  value={option.priceAdjustment}
                                  onChange={(e) => {
                                    const newOptions = [...field.value];
                                    newOptions[optionIndex].priceAdjustment = parseFloat(e.target.value);
                                    field.onChange(newOptions);
                                  }}
                                />
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...field.value];
                                newOptions.splice(optionIndex, 1);
                                field.onChange(newOptions);
                              }}
                              className="mt-2"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => field.onChange([...field.value, { value: '', sku: '', stock: 0, priceAdjustment: 0 }])}
                          className="mt-2"
                        >
                          Add Option
                        </Button>
                      </div>
                    )}
                    name={`variants.${index}.options`}
                    control={control}
                  />
                </div>
              ))}
              <Button type="button" variant="outline" onClick={() => appendVariant({ name: '', type: 'dropdown', options: [{ value: '', sku: '', stock: 0, priceAdjustment: 0 }] })}>
                Add Variant
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-1/3 px-4">
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              <div className="mb-4">
                <Label htmlFor="primaryImage" className="block text-center p-12 border-2 border-dashed rounded-lg cursor-pointer">
                  {images[0] ? (
                    <img src={images[0]} alt="Primary" className="max-w-full h-auto" />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-900">
                        Upload primary image
                      </span>
                    </div>
                  )}
                  <Input id="primaryImage" type="file" className="hidden" onChange={(e) => handleImageUpload(e, 0)} accept="image/*" />
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((index) => (
                  <Label key={index} htmlFor={`additionalImage${index}`} className="block p-4 border-2 border-dashed rounded-lg cursor-pointer">
                    {images[index] ? (
                      <img src={images[index]} alt={`Additional ${index}`} className="max-w-full h-auto" />
                    ) : (
                      <div className="text-center">
                        <Plus className="mx-auto h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <Input id={`additionalImage${index}`} type="file" className="hidden" onChange={(e) => handleImageUpload(e, index)} accept="image/*" />
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="mb-6">
                <Label htmlFor="category" className="text-sm font-semibold mb-1 block">Category</Label>
                <Select onValueChange={(value) => setValue("category", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>{category.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
              </div>

              <div className="mb-6">
                <Label htmlFor="brand" className="text-sm font-semibold mb-1 block">Brand</Label>
                <Input id="brand" placeholder="Enter brand" {...register("brand")} />
              </div>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  )
}

