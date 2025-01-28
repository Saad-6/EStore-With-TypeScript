import React, { useState, useEffect } from 'react'
import { HexColorPicker } from "react-colorful"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Input } from './input'

interface ColorPickerProps {
  value: string
  onChange: (value: string) => void
}

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [color, setColor] = useState(value)

  useEffect(() => {
    setColor(value)
  }, [value])

  const handleChange = (newColor: string) => {
    setColor(newColor)
    onChange(newColor)
  }

  return (
    <div className="flex items-center space-x-2">
      <Popover>
        <PopoverTrigger asChild>
          <div
            className="w-10 h-10 rounded-md border cursor-pointer"
            style={{ backgroundColor: color }}
          />
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0">
          <HexColorPicker color={color} onChange={handleChange} />
        </PopoverContent>
      </Popover>
      <Input
        value={color}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="#000000"
        className="flex-grow"
      />
    </div>
  )
}
