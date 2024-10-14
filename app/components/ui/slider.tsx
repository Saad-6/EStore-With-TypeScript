import React, { useState, useEffect } from 'react'

interface SliderProps {
  min: number
  max: number
  step?: number
  defaultValue?: number
  onChange: (value: number) => void
}

export const Slider: React.FC<SliderProps> = ({ min, max, step = 1, defaultValue = min, onChange }) => {
  const [value, setValue] = useState(defaultValue)

  useEffect(() => {
    setValue(defaultValue)
  }, [defaultValue])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(e.target.value)
    setValue(newValue)
    if (onChange) {
      onChange(newValue)
    }
  }

  return (
    <div className="relative w-full h-6">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
      />
      <div
        className="absolute top-0 h-2 bg-blue-500 rounded-l-lg"
        style={{ width: `${((value - min) / (max - min)) * 100}%` }}
      ></div>
      <div className="absolute top-6 left-0 right-0 flex justify-between text-xs text-gray-500">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}