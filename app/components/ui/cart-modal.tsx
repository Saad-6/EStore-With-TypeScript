import { XIcon } from "lucide-react"
import type React from "react"
import { createPortal } from "react-dom"
import { Button } from "./button"
import { Input } from "./input"
import { Label } from "./label"

import type { Product, Variant } from "@/interfaces/product-interfaces"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product
  quantity: number
  selectedVariants: Record<number, number>
  onQuantityChange: (quantity: number) => void
  onVariantChange: (variantId: number, optionId: number) => void
  onConfirm: () => void
}

export function Modal({
  isOpen,
  onClose,
  product,
  quantity,
  selectedVariants,
  onQuantityChange,
  onVariantChange,
  onConfirm,
}: ModalProps) {
  if (!isOpen) return null

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuantity = Number.parseInt(e.target.value, 10)
    if (!isNaN(newQuantity) && newQuantity > 0) {
      onQuantityChange(newQuantity)
    }
  }

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-auto">
        <div className="absolute top-0 right-0 pt-4 pr-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <span className="sr-only">Close</span>
            <XIcon className="h-6 w-6" aria-hidden="true" />
          </button>
        </div>
        <div className="p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Confirm Add to Cart - <span>{product.name}</span>
          </h3>
          <div className="space-y-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                type="number"
                id="quantity"
                name="quantity"
                min="1"
                value={quantity}
                onChange={handleQuantityChange}
                className="mt-1 block w-full rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm dark:bg-white dark:text-black"
              />
            </div>
            {product.variants &&
              product.variants.map((variant: Variant) => (
                <div key={variant.id}>
                  <Label htmlFor={`variant-${variant.id}`}>{variant.name}</Label>
                  <Select
                    value={selectedVariants[variant.id]?.toString() || ""}
                    onValueChange={(value) => onVariantChange(variant.id, Number.parseInt(value, 10))}
                  >
                    <SelectTrigger className="w-full mt-1 dark:text-black">
                      <SelectValue placeholder={`Select ${variant.name}`} />
                    </SelectTrigger>
                    <SelectContent>
                      {variant.options.map((option) => (
                        <SelectItem key={option.id} value={option.id.toString()}>
                          {option.value}
                          {option.priceAdjustment !== 0 && (
                            <span className={`ml-2 ${option.priceAdjustment > 0 ? "text-green-600" : "text-red-600"}`}>
                              {option.priceAdjustment > 0 ? "+" : "-"}${Math.abs(option.priceAdjustment).toFixed(2)}
                            </span>
                          )}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
          </div>
          <div className="mt-6 flex justify-end space-x-3">
            <Button variant="default" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="outline" onClick={onConfirm}>
              Add to Cart
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}

