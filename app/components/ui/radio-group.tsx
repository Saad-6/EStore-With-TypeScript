import React, { createContext, useContext, useState } from 'react'
import { cn } from '../../lib/utils'

interface RadioGroupContextType {
  value: string
  onChange: (value: string) => void
}

const RadioGroupContext = createContext<RadioGroupContextType | undefined>(undefined)

interface RadioGroupProps {
  value: string
  onValueChange: (value: string) => void
  children: React.ReactNode
  className?: string
}

export function RadioGroup({ value, onValueChange, children, className }: RadioGroupProps) {
  return (
    <RadioGroupContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={cn('space-y-2', className)}>{children}</div>
    </RadioGroupContext.Provider>
  )
}

interface RadioGroupItemProps {
  value: string
  id: string
  children?: React.ReactNode
  className?: string
}

export function RadioGroupItem({ value, id, children, className }: RadioGroupItemProps) {
  const context = useContext(RadioGroupContext)
  if (!context) {
    throw new Error('RadioGroupItem must be used within a RadioGroup')
  }

  const { value: groupValue, onChange } = context

  const handleChange = () => {
    onChange(value)
  }

  return (
    <div className={cn('flex items-center space-x-2', className)}>
      <input
        type="radio"
        id={id}
        checked={groupValue === value}
        onChange={handleChange}
        className="form-radio h-4 w-4 text-blue-600 transition duration-150 ease-in-out"
      />
      <label htmlFor={id} className="text-sm leading-5 text-gray-900">
        {children}
      </label>
    </div>
  )
}