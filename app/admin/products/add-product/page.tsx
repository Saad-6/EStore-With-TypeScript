"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Plus, X, Upload, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import toast from "react-hot-toast"
import { Input } from "@/app/components/ui/input"
import { useRouter } from "next/navigation"

const API_BASE_URL = "https://localhost:7007/api"

const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
})

const variantOptionSchema = z.object({
  value: z.string().min(1, "Option value is required"),
  sku: z.string().optional(),
  stock: z.number().min(0, "Stock must be a positive number").optional(),
  priceAdjustment: z.number().optional(),
  images: z.array(z.instanceof(File)).optional(),
})

const variantSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  displayType: z.enum(["dropdown", "checkbox"]),
  options: z.array(variantOptionSchema).min(1, "At least one option is required"),
})

const productSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  description: z.string().min(1, "Description is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be a positive number"),
  stock: z.number().min(0, "Stock must be a positive number"),
  slug: z.string().min(1, "Slug is required"),
  brand: z.string().optional(),
  isActive: z.boolean().default(true),
  categoryId: z.number().min(1, "Category is required"),
  seo: seoSchema,
  variants: z.array(variantSchema).optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

export default function CreateProductPage() {
  const router = useRouter()
  const [primaryImage, setPrimaryImage] = useState<File | null>(null)
  const [additionalImages, setAdditionalImages] = useState<File[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [variantOptionImages, setVariantOptionImages] = useState<{ [key: string]: File[] }>({})
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      isActive: true,
      seo: {},
      variants: [
        {
          name: "",
          displayType: "dropdown",
          options: [{ value: "", sku: "", stock: 0, priceAdjustment: 0, images: [] }],
        },
      ],
    },
  })

  const {
    fields: variantFields,
    append: appendVariant,
    remove: removeVariant,
  } = useFieldArray({
    control,
    name: "variants",
  })

  const watchName = watch("name")

  useEffect(() => {
    fetchCategories()
  }, [])

  useEffect(() => {
    if (watchName) {
      setValue("slug", generateSlug(watchName))
      setValue("seo.metaTitle", `${watchName} - Buy ${watchName} Online`)
      setValue("seo.metaDescription", `Purchase ${watchName}. ${watch("description") || ""}`)
    }
  }, [watchName, setValue, watch])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast.error("Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("An error occurred while fetching categories")
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
  }

  const onSubmit = async (data: ProductFormValues) => {
    try {
      const formData = new FormData()

      // Append product data
      Object.entries(data).forEach(([key, value]) => {
        if (key !== "seo" && key !== "variants") {
          formData.append(key, value.toString())
        }
      })

      // Append SEO data
      Object.entries(data.seo).forEach(([key, value]) => {
        if (value) formData.append(`seo.${key}`, value)
      })

      // Append variants data
      data.variants?.forEach((variant, index) => {
        formData.append(`Variants[${index}].Name`, variant.name)
        formData.append(`Variants[${index}].DisplayType`, variant.displayType)
        variant.options.forEach((option, optionIndex) => {
          formData.append(`Variants[${index}].Options[${optionIndex}].Value`, option.value)
          if (option.sku) formData.append(`Variants[${index}].Options[${optionIndex}].SKU`, option.sku)
          if (option.stock !== undefined)
            formData.append(`Variants[${index}].Options[${optionIndex}].Stock`, option.stock.toString())
          if (option.priceAdjustment !== undefined)
            formData.append(
              `Variants[${index}].Options[${optionIndex}].PriceAdjustment`,
              option.priceAdjustment.toString(),
            )
          const key = `${index}-${optionIndex}`
          if (variantOptionImages[key]) {
            variantOptionImages[key].forEach((image, imageIndex) => {
              formData.append(`Variants[${index}].Options[${optionIndex}].OptionImages`, image)
            })
          }
        })
      })

      // Append image files
      if (primaryImage) {
        formData.append("PrimaryImageFile", primaryImage)
      }
      additionalImages.forEach((file) => {
        formData.append("AdditionalImageFiles", file)
      })

      const response = await fetch(`${API_BASE_URL}/Product?operation=add`, {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        toast.success("Product added successfully")
        // Use setTimeout to ensure the toast is shown before redirecting
        setTimeout(() => {
          router.push("/admin/products")
        }, 1000)
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

  const handlePrimaryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPrimaryImage(file)
    }
  }

  const handleAdditionalImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      setAdditionalImages((prev) => [...prev, ...Array.from(files)])
    }
  }

  const handleVariantOptionImageUpload = (
    variantIndex: number,
    optionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files)
      const key = `${variantIndex}-${optionIndex}`
      setVariantOptionImages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ...newFiles],
      }))
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
                <Label htmlFor="name" className="text-sm font-semibold mb-1 block">
                  Product Name
                </Label>
                <Input id="name" placeholder="Enter product name" {...register("name")} />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
              </div>

              <div className="mb-6">
                <Label htmlFor="description" className="text-sm font-semibold mb-1 block">
                  Description
                </Label>
                <Textarea id="description" placeholder="Enter product description" {...register("description")} />
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>}
              </div>

              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="sku" className="text-sm font-semibold mb-1 block">
                    SKU
                  </Label>
                  <Input id="sku" placeholder="Enter SKU" {...register("sku")} />
                  {errors.sku && <p className="text-red-500 text-sm mt-1">{errors.sku.message}</p>}
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="price" className="text-sm font-semibold mb-1 block">
                    Price
                  </Label>
                  <Input
                    id="price"
                    type="number"
                    placeholder="Enter price"
                    {...register("price", { valueAsNumber: true })}
                  />
                  {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
                </div>
              </div>

              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="stock" className="text-sm font-semibold mb-1 block">
                    Stock
                  </Label>
                  <Input
                    id="stock"
                    type="number"
                    placeholder="Enter stock"
                    {...register("stock", { valueAsNumber: true })}
                  />
                  {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="slug" className="text-sm font-semibold mb-1 block">
                    Slug
                  </Label>
                  <Input id="slug" placeholder="Enter slug" {...register("slug")} />
                  {errors.slug && <p className="text-red-500 text-sm mt-1">{errors.slug.message}</p>}
                </div>
              </div>

              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="brand" className="text-sm font-semibold mb-1 block">
                    Brand
                  </Label>
                  <Input id="brand" placeholder="Enter brand" {...register("brand")} />
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="categoryId" className="text-sm font-semibold mb-1 block">
                    Category
                  </Label>
                  <Select onValueChange={(value) => setValue("categoryId", Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.categoryId && <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>}
                </div>
              </div>

              <div className="mb-6">
                <div className="flex items-center">
                  <Checkbox id="isActive" {...register("isActive")} />
                  <Label htmlFor="isActive" className="ml-2">
                    Active
                  </Label>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">SEO</h2>
              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="metaTitle" className="text-sm font-semibold mb-1 block">
                    Meta Title
                  </Label>
                  <Input id="metaTitle" placeholder="Enter meta title" {...register("seo.metaTitle")} />
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="metaDescription" className="text-sm font-semibold mb-1 block">
                    Meta Description
                  </Label>
                  <Input
                    id="metaDescription"
                    placeholder="Enter meta description"
                    {...register("seo.metaDescription")}
                  />
                </div>
              </div>
              <div className="flex flex-wrap -mx-2 mb-6">
                <div className="w-1/2 px-2">
                  <Label htmlFor="metaKeywords" className="text-sm font-semibold mb-1 block">
                    Meta Keywords
                  </Label>
                  <Input id="metaKeywords" placeholder="Enter meta keywords" {...register("seo.metaKeywords")} />
                </div>
                <div className="w-1/2 px-2">
                  <Label htmlFor="canonicalUrl" className="text-sm font-semibold mb-1 block">
                    Canonical URL
                  </Label>
                  <Input id="canonicalUrl" placeholder="Enter canonical URL" {...register("seo.canonicalUrl")} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="w-full lg:w-1/3 px-4">
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold mb-4">Images</h2>
              <div className="mb-4">
                <Label
                  htmlFor="primaryImage"
                  className="block text-center p-12 border-2 border-dashed rounded-lg cursor-pointer"
                >
                  {primaryImage ? (
                    <img
                      src={URL.createObjectURL(primaryImage) || "/placeholder.svg"}
                      alt="Primary"
                      className="max-w-full h-auto"
                    />
                  ) : (
                    <div className="text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <span className="mt-2 block text-sm font-medium text-gray-900">Upload primary image</span>
                    </div>
                  )}
                  <Input
                    id="primaryImage"
                    type="file"
                    className="hidden"
                    onChange={handlePrimaryImageUpload}
                    accept="image/*"
                  />
                </Label>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((index) => (
                  <Label
                    key={index}
                    htmlFor={`additionalImage${index}`}
                    className="block p-4 border-2 border-dashed rounded-lg cursor-pointer"
                  >
                    {additionalImages[index - 1] ? (
                      <img
                        src={URL.createObjectURL(additionalImages[index - 1]) || "/placeholder.svg"}
                        alt={`Additional ${index}`}
                        className="max-w-full h-auto"
                      />
                    ) : (
                      <div className="text-center">
                        <Plus className="mx-auto h-8 w-8 text-gray-400" />
                      </div>
                    )}
                    <Input
                      id={`additionalImage${index}`}
                      type="file"
                      className="hidden"
                      onChange={handleAdditionalImageUpload}
                      accept="image/*"
                    />
                  </Label>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </form>

      <Card className="mb-8">
        <CardContent className="p-6">
          <h2 className="text-2xl font-semibold mb-6">Variants</h2>
          {variantFields.map((field, variantIndex) => (
            <div key={field.id} className="mb-8 p-6 border rounded-lg shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Variant {variantIndex + 1}</h3>
                <Button type="button" variant="ghost" size="sm" onClick={() => removeVariant(variantIndex)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <Label htmlFor={`variants.${variantIndex}.name`} className="text-sm font-semibold mb-1 block">
                    Variant Name
                  </Label>
                  <Input
                    id={`variants.${variantIndex}.name`}
                    placeholder="e.g., Size, Color, Material"
                    {...register(`variants.${variantIndex}.name` as const)}
                  />
                  {errors.variants?.[variantIndex]?.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.variants[variantIndex]?.name?.message}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor={`variants.${variantIndex}.displayType`} className="text-sm font-semibold mb-1 block">
                    Display Type
                  </Label>
                  <Controller
                    name={`variants.${variantIndex}.displayType`}
                    control={control}
                    render={({ field }) => (
                      <Select onValueChange={field.onChange} value={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select display type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="dropdown">Dropdown</SelectItem>
                          <SelectItem value="checkbox">Checkbox</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold">Options</h4>
                <Controller
                  name={`variants.${variantIndex}.options`}
                  control={control}
                  render={({ field }) => (
                    <div className="space-y-4">
                      {field.value.map((option, optionIndex) => (
                        <div key={optionIndex} className="p-4 border rounded-lg">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label
                                htmlFor={`variants.${variantIndex}.options.${optionIndex}.value`}
                                className="text-sm font-semibold mb-1 block"
                              >
                                Option Value
                              </Label>
                              <Input
                                id={`variants.${variantIndex}.options.${optionIndex}.value`}
                                placeholder="e.g., Small, Red, Cotton"
                                value={option.value}
                                onChange={(e) => {
                                  const newOptions = [...field.value]
                                  newOptions[optionIndex].value = e.target.value
                                  field.onChange(newOptions)
                                }}
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`variants.${variantIndex}.options.${optionIndex}.sku`}
                                className="text-sm font-semibold mb-1 block"
                              >
                                SKU
                              </Label>
                              <Input
                                id={`variants.${variantIndex}.options.${optionIndex}.sku`}
                                placeholder="Enter SKU"
                                value={option.sku}
                                onChange={(e) => {
                                  const newOptions = [...field.value]
                                  newOptions[optionIndex].sku = e.target.value
                                  field.onChange(newOptions)
                                }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <Label
                                htmlFor={`variants.${variantIndex}.options.${optionIndex}.stock`}
                                className="text-sm font-semibold mb-1 block"
                              >
                                Stock
                              </Label>
                              <Input
                                id={`variants.${variantIndex}.options.${optionIndex}.stock`}
                                type="number"
                                placeholder="Enter stock quantity"
                                value={option.stock}
                                onChange={(e) => {
                                  const newOptions = [...field.value]
                                  newOptions[optionIndex].stock = Number.parseInt(e.target.value)
                                  field.onChange(newOptions)
                                }}
                              />
                            </div>
                            <div>
                              <Label
                                htmlFor={`variants.${variantIndex}.options.${optionIndex}.priceAdjustment`}
                                className="text-sm font-semibold mb-1 block"
                              >
                                Price Adjustment
                              </Label>
                              <Input
                                id={`variants.${variantIndex}.options.${optionIndex}.priceAdjustment`}
                                type="number"
                                placeholder="Enter price adjustment"
                                value={option.priceAdjustment}
                                onChange={(e) => {
                                  const newOptions = [...field.value]
                                  newOptions[optionIndex].priceAdjustment = Number.parseFloat(e.target.value)
                                  field.onChange(newOptions)
                                }}
                              />
                            </div>
                          </div>
                          <div>
                            <Label
                              htmlFor={`variants.${variantIndex}.options.${optionIndex}.images`}
                              className="text-sm font-semibold mb-1 block"
                            >
                              Option Images
                            </Label>
                            <div className="grid grid-cols-5 gap-4 mt-2">
                              <Label
                                htmlFor={`variants.${variantIndex}.options.${optionIndex}.images`}
                                className="aspect-square flex items-center justify-center border-2 border-dashed rounded-lg cursor-pointer hover:border-gray-400 transition-colors"
                              >
                                <Input
                                  id={`variants.${variantIndex}.options.${optionIndex}.images`}
                                  type="file"
                                  multiple
                                  className="hidden"
                                  onChange={(e) => handleVariantOptionImageUpload(variantIndex, optionIndex, e)}
                                  accept="image/*"
                                />
                                <Upload className="h-8 w-8 text-gray-400" />
                              </Label>
                              {variantOptionImages[`${variantIndex}-${optionIndex}`]?.map((image, imageIndex) => (
                                <div key={imageIndex} className="relative aspect-square">
                                  <img
                                    src={URL.createObjectURL(image) || "/placeholder.svg"}
                                    alt={`Option ${optionIndex} image ${imageIndex}`}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={() => {
                                      const newImages = [...variantOptionImages[`${variantIndex}-${optionIndex}`]]
                                      newImages.splice(imageIndex, 1)
                                      setVariantOptionImages((prev) => ({
                                        ...prev,
                                        [`${variantIndex}-${optionIndex}`]: newImages,
                                      }))
                                    }}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </div>
                          <div className="mt-4 flex justify-end">
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                const newOptions = [...field.value]
                                newOptions.splice(optionIndex, 1)
                                field.onChange(newOptions)
                              }}
                            >
                              Remove Option
                            </Button>
                          </div>
                        </div>
                      ))}
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          field.onChange([
                            ...field.value,
                            { value: "", sku: "", stock: 0, priceAdjustment: 0, images: [] },
                          ])
                        }
                      >
                        Add Option
                      </Button>
                    </div>
                  )}
                />
              </div>
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              appendVariant({
                name: "",
                displayType: "dropdown",
                options: [{ value: "", sku: "", stock: 0, priceAdjustment: 0, images: [] }],
              })
            }
          >
            Add Variant
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

