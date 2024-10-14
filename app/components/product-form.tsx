import React, { useState, useEffect } from 'react'
import { Category } from '@/interfaces/product-interfaces'
import { prototype } from 'events';

interface SEODTO {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
  canonicalUrl: string;
}

interface ProductImageDTO {
  url: string;
  altText: string;
}

interface VariantOptionDTO {
  id?: number;
  value: string;
  optionImages?: ProductImageDTO[];
  priceAdjustment: number;
  stock: number;
  sku?: string;
}

interface VariantDTO {
  id?: number;
  name: string;
  options: VariantOptionDTO[];
}

interface ProductDTO {
  id?: number;
  name: string;
  description: string;
  price: number;
  sku: string;
  stock: number;
  brand: string;
  category: Category;
  slug: string;
  isActive: boolean;
  seo: SEODTO;
  primaryImage: ProductImageDTO;
  images: ProductImageDTO[];
  variants: VariantDTO[];
}

interface ProductFormProps {
  product?: ProductDTO;
  onSubmit: (product: ProductDTO, operation: string) => void;
  categories: Category[];
}

const ProductForm: React.FC<ProductFormProps> = ({ product, onSubmit, categories }) => {
  const [formData, setFormData] = useState<ProductDTO>({
    id : product?.id,
    name: '',
    description: '',
    price: 0,
    sku: '',
    stock: 0,
    brand: '',
    category: categories[0] || null,
    slug: '',
    isActive: true,
    seo: {
      metaTitle: '',
      metaDescription: '',
      metaKeywords: '',
      canonicalUrl: ''
    },
    primaryImage: { url: '', altText: '' },
    images: [],
    variants: []
  })

  useEffect(() => {
    if (product) {
      setFormData(product)
      console.log(product)
    }
  }, [product])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSEOChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, seo: { ...prev.seo, [name]: value } }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const { name, value } = e.target
    if (index === -1) {
      // Primary image
      setFormData(prev => ({ ...prev, primaryImage: { ...prev.primaryImage, [name]: value } }))
    } else {
      // Additional images
      const newImages = [...formData.images]
      newImages[index] = { ...newImages[index], [name]: value }
      setFormData(prev => ({ ...prev, images: newImages }))
    }
  }

  const handleAddImage = () => {
    if (formData.images.length < 4) {
      setFormData(prev => ({ ...prev, images: [...prev.images, { url: '', altText: '' }] }))
    }
  }

  const handleRemoveImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, images: newImages }))
  }

  const handleAddVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: '', options: [{ value: '', priceAdjustment: 0, stock: 0 }] }]
    }))
  }

  const handleRemoveVariant = (index: number) => {
    const newVariants = formData.variants.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleVariantChange = (e: React.ChangeEvent<HTMLInputElement>, variantIndex: number) => {
    const { value } = e.target
    const newVariants = [...formData.variants]
    newVariants[variantIndex].name = value
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleAddVariantOption = (variantIndex: number) => {
    const newVariants = [...formData.variants]
    newVariants[variantIndex].options.push({ value: '', priceAdjustment: 0, stock: 0 })
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleRemoveVariantOption = (variantIndex: number, optionIndex: number) => {
    const newVariants = [...formData.variants]
    newVariants[variantIndex].options = newVariants[variantIndex].options.filter((_, i) => i !== optionIndex)
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleVariantOptionChange = (e: React.ChangeEvent<HTMLInputElement>, variantIndex: number, optionIndex: number) => {
    const { name, value } = e.target
    const newVariants = [...formData.variants]
    newVariants[variantIndex].options[optionIndex] = {
      ...newVariants[variantIndex].options[optionIndex],
      [name]: name === 'priceAdjustment' || name === 'stock' ? Number(value) : value
    }
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleVariantOptionImageChange = (e: React.ChangeEvent<HTMLInputElement>, variantIndex: number, optionIndex: number, imageIndex: number) => {
    const { name, value } = e.target
    const newVariants = [...formData.variants]
    if (!newVariants[variantIndex].options[optionIndex].optionImages) {
      newVariants[variantIndex].options[optionIndex].optionImages = []
    }
    newVariants[variantIndex].options[optionIndex].optionImages[imageIndex] = {
      ...newVariants[variantIndex].options[optionIndex].optionImages[imageIndex],
      [name]: value
    }
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleAddVariantOptionImage = (variantIndex: number, optionIndex: number) => {
    const newVariants = [...formData.variants]
    if (!newVariants[variantIndex].options[optionIndex].optionImages) {
      newVariants[variantIndex].options[optionIndex].optionImages = []
    }
    newVariants[variantIndex].options[optionIndex].optionImages.push({ url: '', altText: '' })
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleRemoveVariantOptionImage = (variantIndex: number, optionIndex: number, imageIndex: number) => {
    const newVariants = [...formData.variants]
    newVariants[variantIndex].options[optionIndex].optionImages = newVariants[variantIndex].options[optionIndex].optionImages.filter((_, i) => i !== imageIndex)
    setFormData(prev => ({ ...prev, variants: newVariants }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData, product ? 'update' : 'add')
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Existing form fields */}
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            maxLength={200}
          />
        </div>
        <div>
          <label htmlFor="slug" className="block text-sm font-medium text-gray-700">Slug</label>
          <input
            type="text"
            id="slug"
            name="slug"
            value={formData.slug}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            maxLength={200}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={3}
          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          required
        />
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div>
          <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price</label>
          <input
            type="number"
            id="price"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            min="0.01"
            step="0.01"
          />
        </div>
        <div>
          <label htmlFor="sku" className="block text-sm font-medium text-gray-700">SKU</label>
          <input
            type="text"
            id="sku"
            name="sku"
            value={formData.sku}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            maxLength={50}
          />
        </div>
        <div>
          <label htmlFor="stock" className="block text-sm font-medium text-gray-700">Stock</label>
          <input
            type="number"
            id="stock"
            name="stock"
            value={formData.stock}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
            min="0"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700">Brand</label>
          <input
            type="text"
            id="brand"
            name="brand"
            value={formData.brand}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            maxLength={100}
          />
        </div>
        <div>
          <label htmlFor="categoryId" className="block text-sm font-medium text-gray-700">Category</label>
          <select
            id="categoryId"
            name="categoryId"
            value={formData.categoryId}
            onChange={handleChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Is Active</label>
        <input
          type="checkbox"
          name="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
          className="mt-1 focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
        />
      </div>

      {/* SEO fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">SEO</h3>
        <div>
          <label htmlFor="metaTitle" className="block text-sm font-medium text-gray-700">Meta Title</label>
          <input
            type="text"
            id="metaTitle"
            name="metaTitle"
            value={formData.seo.metaTitle}
            onChange={handleSEOChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="metaDescription" className="block text-sm font-medium text-gray-700">Meta Description</label>
          <textarea
            id="metaDescription"
            name="metaDescription"
            value={formData.seo.metaDescription}
            onChange={handleSEOChange}
            rows={2}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div>
          <label htmlFor="metaKeywords" className="block text-sm font-medium text-gray-700">Meta Keywords</label>
          <input
            type="text"
            id="metaKeywords"
            name="metaKeywords"
            value={formData.seo.metaKeywords}
            onChange={handleSEOChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
        <div>
          <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700">Canonical URL</label>
          <input
            type="text"
            id="canonicalUrl"
            name="canonicalUrl"
            
            value={formData.seo.canonicalUrl}
            onChange={handleSEOChange}
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Image fields */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Images</h3>
        <div>
          <label className="block text-sm font-medium text-gray-700">Primary Image</label>
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="url"
              value={formData.primaryImage.url}
              onChange={(e) => handleImageChange(e, -1)}
              placeholder="Image URL"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
            <input
              type="text"
              name="altText"
              value={formData.primaryImage.altText}
              onChange={(e) => handleImageChange(e, -1)}
              placeholder="Alt Text"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
        </div>
        {formData.images.map((image, index) => (
          <div key={index}>
            <label className="block text-sm font-medium text-gray-700">Additional Image {index + 1}</label>
            <div className="grid grid-cols-2 gap-4">
              <input
                type="text"
                name="url"
                value={image.url}
                onChange={(e) => handleImageChange(e, index)}
                placeholder="Image URL"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <input
                type="text"
                name="altText"
                value={image.altText}
                onChange={(e) => handleImageChange(e, index)}
                placeholder="Alt Text"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button type="button" onClick={() => handleRemoveImage(index)} className="mt-2 text-sm text-red-600 hover:text-red-800">
              Remove Image
            </button>
          </div>
        ))}
        {formData.images.length < 4 && (
          <button type="button" onClick={handleAddImage} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
            Add Image (Max 4)
          </button>
        )}
      </div>

      {/* Variants */}
      <div className="space-y-4">
        <h3 className="text-lg font-medium text-gray-900">Variants</h3>
        {formData.variants.map((variant, variantIndex) => (
          <div key={variantIndex} className="border border-gray-300 rounded-md p-4">
            <div className="flex items-center justify-between mb-2">
              <input
                type="text"
                value={variant.name}
                onChange={(e) => handleVariantChange(e, variantIndex)}
                placeholder="Variant Name (e.g., Color, Size)"
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button type="button" onClick={() => handleRemoveVariant(variantIndex)} className="ml-2 text-sm text-red-600 hover:text-red-800">
                Remove Variant
              </button>
            </div>
            {variant?.options?.map((option, optionIndex) => (
              <div key={optionIndex} className="border-t border-gray-200 pt-4 mt-4">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <input
                    type="text"
                    name="value"
                    value={option.value}
                    onChange={(e) => handleVariantOptionChange(e, variantIndex, optionIndex)}
                    placeholder="Option Value"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="number"
                    name="priceAdjustment"
                    value={option.priceAdjustment}
                    onChange={(e) => handleVariantOptionChange(e, variantIndex, optionIndex)}
                    placeholder="Price Adjustment"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <input
                    type="number"
                    name="stock"
                    value={option.stock}
                    onChange={(e) => handleVariantOptionChange(e, variantIndex, optionIndex)}
                    placeholder="Stock"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    name="sku"
                    value={option.sku || ''}
                    onChange={(e) => handleVariantOptionChange(e, variantIndex, optionIndex)}
                    placeholder="SKU"
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700">Option Images</h4>
                  {option.optionImages && option.optionImages.map((image, imageIndex) => (
                    <div key={imageIndex} className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="url"
                        value={image.url}
                        onChange={(e) => handleVariantOptionImageChange(e, variantIndex, optionIndex, imageIndex)}
                        placeholder="Image URL"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <input
                        type="text"
                        name="altText"
                        value={image.altText}
                        onChange={(e) => handleVariantOptionImageChange(e, variantIndex, optionIndex, imageIndex)}
                        placeholder="Alt Text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                      <button type="button" onClick={() => handleRemoveVariantOptionImage(variantIndex, optionIndex, imageIndex)} className="col-span-2 mt-1 text-sm text-red-600 hover:text-red-800">
                        Remove Image
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => handleAddVariantOptionImage(variantIndex, optionIndex)} className="mt-2 text-sm text-indigo-600 hover:text-indigo-800">
                    Add Option Image
                  </button>
                </div>
                <button type="button" onClick={() => handleRemoveVariantOption(variantIndex, optionIndex)} className="mt-2 text-sm text-red-600 hover:text-red-800">
                  Remove Option
                </button>
              </div>
            ))}
            <button type="button" onClick={() => handleAddVariantOption(variantIndex)} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800">
              Add Option
            </button>
          </div>
        ))}
        <button type="button" onClick={handleAddVariant} className="mt-4 text-sm text-indigo-600 hover:text-indigo-800">
          Add Variant
        </button>
      </div>

      <div className="flex justify-end">
        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
          {product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  )
}

export default ProductForm