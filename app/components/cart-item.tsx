import Image from 'next/image'
import { useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import { Button } from './ui/button'

interface CartItemProps {
  id: number
  name: string
  price: number
  image: string
  quantity: number
  onUpdateQuantity: (id: number, newQuantity: number) => void
  onRemove: (id: number) => void
}

export default function CartItem({ id, name, price, image, quantity, onUpdateQuantity, onRemove }: CartItemProps) {
  const [itemQuantity, setItemQuantity] = useState(quantity)

  const handleQuantityChange = (change: number) => {
    const newQuantity = Math.max(1, itemQuantity + change)
    setItemQuantity(newQuantity)
    onUpdateQuantity(id, newQuantity)
  }

  return (
    <div className="flex items-center space-x-4 py-4 border-b border-gray-200 last:border-b-0">
      <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-md overflow-hidden">
        <Image
          src={image}
          alt={name}
          width={96}
          height={96}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="flex-grow">
        <h3 className="text-lg font-semibold text-gray-800">{name}</h3>
        <p className="text-sm text-gray-600 mt-1">Unit Price: ${price.toFixed(2)}</p>
        <div className="flex items-center mt-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(-1)}
            disabled={itemQuantity <= 1}
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-2 w-8 text-center">{itemQuantity}</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(1)}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col items-end space-y-2">
        <span className="text-lg font-semibold text-gray-800">
          ${(price * itemQuantity).toFixed(2)}
        </span>
        <Button
          variant="destructive"
          size="icon"
          className="h-8 w-8"
          onClick={() => onRemove(id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}