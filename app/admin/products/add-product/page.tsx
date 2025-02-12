"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Image from "next/image"
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
import { Input } from "@/app/components/ui/input"
import { toast } from "@/hooks/use-toast"
import { useAuth } from "@/app/lib/auth"

const API_BASE_URL = "https://localhost:7007/api"

interface ImageType {
  id?: number
  url: string
  altText?: string
  file?: File
}

interface VariantOptionType {
  id?: number
  value: string
  optionImages: ImageType[]
  priceAdjustment: number
  stock: number
  sku: string
}

interface VariantType {
  id?: number
  name: string
  displayType: "dropdown" | "checkbox"
  options: VariantOptionType[]
}

const seoSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  canonicalUrl: z.string().optional(),
})

const variantOptionSchema = z.object({
  id: z.number().optional(),
  value: z.string().min(1, "Option value is required"),
  sku: z.string().optional(),
  stock: z.number().min(0, "Stock must be a positive number").optional(),
  priceAdjustment: z.number().optional(),
  optionImages: z
    .array(
      z.object({
        id: z.number().optional(),
        url: z.string(),
        altText: z.string().optional(),
        file: z.any().optional(),
      }),
    )
    .optional(),
})

const variantSchema = z.object({
  id: z.number().optional(),
  name: z.string().min(1, "Variant name is required"),
  displayType: z.enum(["dropdown", "checkbox"]),
  options: z.array(variantOptionSchema).min(1, "At least one option is required"),
})

const productSchema = z.object({
  id: z.number().optional(),
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

export default function CreateEditProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productId = searchParams.get("id")
  const isEditing = !!productId

  const [primaryImage, setPrimaryImage] = useState<ImageType | null>(null)
  const [additionalImages, setAdditionalImages] = useState<ImageType[]>([])
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [variantOptionImages, setVariantOptionImages] = useState<{ [key: string]: ImageType[] }>({})
  const {getToken} = useAuth();
  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
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
          options: [{ value: "", sku: "", stock: 0, priceAdjustment: 0, optionImages: [] }],
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

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch categories",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching categories",
        variant: "destructive",
      })
    }
  }, [])

  const fetchProduct = useCallback(async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Product/id/${productId}`, {
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
      if (response.ok) {
        const product = await response.json()
        reset(product)
        if (product.categoryId) {
          setValue("categoryId", product.categoryId)
        }
        if (product.primaryImage) {
          setPrimaryImage({
            id: product.primaryImage.id,
            url: product.primaryImage.url,
            altText: product.primaryImage.altText,
          })
        }
        if (product.images) {
          console.log("Product:",product);
          console.log("Product Images:",product.images)
          setAdditionalImages(
            product.images.map((img: any) => ({
              id: img.id,
              url: img.url,
              altText: img.altText,
            })),
          )
        }
        if (product.variants) {
          const newVariantOptionImages: { [key: string]: ImageType[] } = {}

          product.variants.forEach((variant: VariantType, variantIndex: number) => {
            variant.options.forEach((option: VariantOptionType, optionIndex: number) => {
              if (option.optionImages && option.optionImages.length > 0) {
                const key = `${variantIndex}-${optionIndex}`
                newVariantOptionImages[key] = option.optionImages.map((img: any) => ({
                  id: img.id,
                  url: img.url,
                  altText: img.altText,
                }))
              }
            })
          })

          setVariantOptionImages(newVariantOptionImages)
        }
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch product",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching product:", error)
      toast({
        title: "Error",
        description: "An error occurred while fetching the product",
        variant: "destructive",
      })
    }
  }, [productId, reset, setValue])

  useEffect(() => {
    fetchCategories()
    if (isEditing) {
      fetchProduct()
    }
  }, [isEditing, fetchCategories, fetchProduct])

  useEffect(() => {
    if (watchName) {
      setValue("slug", generateSlug(watchName))
      setValue("seo.metaTitle", `${watchName} - Buy ${watchName} Online`)
    }
  }, [watchName, setValue])

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
  }

  const validateForm = (data: ProductFormValues): string[] => {
    const errors: string[] = []

    if (!data.name) errors.push("Product name is required")
    if (!data.description) errors.push("Product description is required")
    if (!data.sku) errors.push("SKU is required")
    if (data.price <= 0) errors.push("Price must be greater than 0")
    if (data.stock < 0) errors.push("Stock cannot be negative")
    if (!data.slug) errors.push("Slug is required")
    if (!data.categoryId) errors.push("Category is required")

    if (data.variants) {
      data.variants.forEach((variant, index) => {
        if (!variant.name) errors.push(`Variant ${index + 1} name is required`)
        if (!variant.options || variant.options.length === 0) {
          errors.push(`Variant ${index + 1} must have at least one option`)
        } else {
          variant.options.forEach((option, optionIndex) => {
            if (!option.value) errors.push(`Option ${optionIndex + 1} of Variant ${index + 1} must have a value`)
          })
        }
      })
    }

    return errors
  }

  const onSubmit = async (data: ProductFormValues) => {
    const validationErrors = validateForm(data)
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) =>
        toast({ title: "Validation Error", description: error, variant: "destructive" }),
      )
      return
    }

    try {
      const formData = new FormData()

      // Append basic product data
      Object.keys(data).forEach((key) => {
        if (key !== "seo" && key !== "variants") {
          formData.append(key, data[key as keyof ProductFormValues]?.toString() ?? "")
        }
      })

      // Append SEO data
      if (data.seo) {
        Object.keys(data.seo).forEach((key) => {
          formData.append(`SEO.${key}`, data.seo[key as keyof typeof data.seo] ?? "")
        })
      }

      // Handle primary image
      if (primaryImage?.file) {
        formData.append("PrimaryImageFile", primaryImage.file)
      } else if (primaryImage?.url) {
        formData.append("PrimaryImage.Url", primaryImage.url)
        formData.append("PrimaryImage.AltText", primaryImage.altText || "")
      }

      // Handle additional images
      const newAdditionalImages = additionalImages.filter((img) => img.file)
      const existingAdditionalImages = additionalImages.filter((img) => !img.file && img.url)

      newAdditionalImages.forEach((img) => {
        formData.append("AdditionalImages.Files", img.file as File)
      })
      formData.append(
        "AdditionalImages.AlreadyPresentUrls",
        JSON.stringify(existingAdditionalImages.map((img) => img.url)),
      )

      // Handle variants
      if (data.variants && data.variants.length > 0) {
        data.variants.forEach((variant, variantIndex) => {
          formData.append(`Variants.NewVariants[${variantIndex}].Id`, variant.id?.toString() || "0")
          formData.append(`Variants.NewVariants[${variantIndex}].Name`, variant.name)
          formData.append(`Variants.NewVariants[${variantIndex}].DisplayType`, variant.displayType)

          variant.options.forEach((option, optionIndex) => {
            formData.append(
              `Variants.NewVariants[${variantIndex}].NewOptions[${optionIndex}].Id`,
              option.id?.toString() || "0",
            )
            formData.append(`Variants.NewVariants[${variantIndex}].NewOptions[${optionIndex}].Value`, option.value)
            formData.append(`Variants.NewVariants[${variantIndex}].NewOptions[${optionIndex}].SKU`, option.sku || "")
            formData.append(
              `Variants.NewVariants[${variantIndex}].NewOptions[${optionIndex}].Stock`,
              option.stock?.toString() || "0",
            )
            formData.append(
              `Variants.NewVariants[${variantIndex}].NewOptions[${optionIndex}].PriceAdjustment`,
              option.priceAdjustment?.toString() || "0",
            )

            // Handle option images
            const optionImages = variantOptionImages[`${variantIndex}-${optionIndex}`] || []
            const newImages = optionImages.filter((img) => img.file)
            const existingImages = optionImages.filter((img) => img.id)

            newImages.forEach((image, imageIndex) => {
              formData.append(
                `Variants.NewVariants[${variantIndex}].NewOptions[${optionIndex}].NewOptionImages`,
                image.file,
              )
            })

            formData.append(
              `Variants.NewVariants[${variantIndex}].NewOptions[${optionIndex}].ExistingOptionImageIds`,
              JSON.stringify(existingImages.map((img) => img.id)),
            )
          })

          // Handle existing option IDs
          const existingOptionIds = variant.options.filter((option) => option.id).map((option) => option.id)
          formData.append(`Variants.NewVariants[${variantIndex}].ExistingOptionId`, JSON.stringify(existingOptionIds))
        })

        // Append existing variant IDs
        const existingVariantIds = data.variants.filter((variant) => variant.id).map((variant) => variant.id)
        formData.append("Variants.ExistingVariantIds", JSON.stringify(existingVariantIds))
      } else {
        formData.append("Variants.NewVariants", JSON.stringify([]))
        formData.append("Variants.ExistingVariantIds", JSON.stringify([]))
      }

      const token = getToken();
      if (!token) {
        toast({
          title : "Error",
          description : "User Authentication token not found",
          variant:"destructive"
        })
        return;
      }
      const operation = isEditing ? "update" : "add"

      const response = await fetch(`${API_BASE_URL}/Product?operation=${operation}`, {
        method: "POST",
        headers:{
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: `Product ${isEditing ? "updated" : "added"} successfully`,
          variant: "default",
        })
        setTimeout(() => {
          router.push("/admin/products")
        }, 1000)
      } else {
        const errorData = await response.json()
        console.error(`Failed to ${isEditing ? "update" : "add"} product:`, errorData)

        if (errorData.errors) {
          Object.keys(errorData.errors).forEach((key) => {
            const errorMessage = errorData.errors[key].join(", ")
            toast({
              title: "Error",
              description: `${key}: ${errorMessage}`,
              variant: "destructive",
            })
          })
        } else {
          toast({
            title: "Error",
            description: `Failed to ${isEditing ? "update" : "add"} product. ${errorData.title || "Unknown error occurred"}`,
            variant: "destructive",
          })
        }
      }
    } catch (error) {
      console.error(`Error ${isEditing ? "updating" : "adding"} product:`, error)
      toast({
        title: "Error",
        description: `An error occurred while ${isEditing ? "updating" : "adding"} the product: ${error}`,
        variant: "destructive",
      })
    }
  }

  const handlePrimaryImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setPrimaryImage({
        url: URL.createObjectURL(file),
        file: file,
        altText: file.name,
      })
    }
  }

  const handleAdditionalImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files) {
      const newImages = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
        altText: file.name,
      }))
      setAdditionalImages((prev) => [...prev, ...newImages])
    }
  }

  const handleVariantOptionImageUpload = (
    variantIndex: number,
    optionIndex: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files
    if (files) {
      const newFiles = Array.from(files).map((file) => ({
        url: URL.createObjectURL(file),
        file: file,
        altText: file.name,
      }))
      const key = `${variantIndex}-${optionIndex}`
      setVariantOptionImages((prev) => ({
        ...prev,
        [key]: [...(prev[key] || []), ...newFiles],
      }))
    }
  }

  const removeImage = (
    index: number,
    type: "additional" | "primary" | "variant",
    variantIndex?: number,
    optionIndex?: number,
  ) => {
    if (type === "additional") {
      setAdditionalImages((prev) => prev.filter((_, i) => i !== index))
    } else if (type === "primary") {
      setPrimaryImage(null)
    } else if (type === "variant" && variantIndex !== undefined && optionIndex !== undefined) {
      const key = `${variantIndex}-${optionIndex}`
      setVariantOptionImages((prev) => ({
        ...prev,
        [key]: prev[key].filter((_, i) => i !== index),
      }))
    }
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold flex items-center">
          <PlusCircle className="mr-2 h-8 w-8" />
          {isEditing ? "Edit" : "Create"} Product
        </h1>
        <Button
          type="submit"
          form="product-form"
          className="px-6 py-3 text-lg font-semibold rounded-full bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-200 ease-in-out"
        >
          {isEditing ? "Update" : "Save"} Product
        </Button>
      </div>

      <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-wrap -mx-4">
        {isEditing && <input type="hidden" {...register("id", { valueAsNumber: true })} />}
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
                  <Select
                    onValueChange={(value) => setValue("categoryId", Number.parseInt(value))}
                    defaultValue={watch("categoryId")?.toString()}
                  >
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
                    <div className="relative">
                      <Image
                        src={primaryImage.url || "/placeholder.svg"}
                        alt="Primary"
                        width={200}
                        height={200}
                        className="max-w-full h-auto mx-auto"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-0 right-0"
                        onClick={() => removeImage(0, "primary")}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
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
                {additionalImages.map((image, index) => (
                  <div key={index} className="relative">
                    <Image
                      src={image.url || "/placeholder.svg"}
                      alt={`Additional ${index + 1}`}
                      width={100}
                      height={100}
                      className="max-w-full h-auto mx-auto"
                    />
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      className="absolute top-0 right-0"
                      onClick={() => removeImage(index, "additional")}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Label htmlFor="additionalImage" className="block p-4 border-2 border-dashed rounded-lg cursor-pointer">
                  <div className="text-center">
                    <Plus className="mx-auto h-8 w-8 text-gray-400" />
                  </div>
                  <Input
                    id="additionalImage"
                    type="file"
                    className="hidden"
                    onChange={handleAdditionalImageUpload}
                    accept="image/*"
                    multiple
                  />
                </Label>
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
                                  <Image
                                    src={image.url || "/placeholder.svg"}
                                    alt={`Option ${optionIndex} image ${imageIndex}`}
                                    width={100}
                                    height={100}
                                    className="w-full h-full object-cover rounded-lg"
                                  />
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    className="absolute top-1 right-1 h-6 w-6"
                                    onClick={() => removeImage(imageIndex, "variant", variantIndex, optionIndex)}
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
                            { value: "", sku: "", stock: 0, priceAdjustment: 0, optionImages: [] },
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
                options: [{ value: "", sku: "", stock: 0, priceAdjustment: 0, optionImages: [] }],
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

