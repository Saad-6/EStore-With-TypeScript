import React, { useState, useEffect } from 'react'

interface CheckboxProps {
  id: string
  checked?: boolean
  onChange?: (checked: boolean) => void
}

export const Checkbox: React.FC<CheckboxProps> = ({ id, checked = false, onChange }) => {
  const [isChecked, setIsChecked] = useState(checked)

  useEffect(() => {
    setIsChecked(checked)
  }, [checked])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newChecked = e.target.checked
    setIsChecked(newChecked)
    if (onChange) {
      onChange(newChecked)
    }
  }

  return (
    <div className="relative inline-block w-5 h-5">
      <input
        type="checkbox"
        id={id}
        checked={isChecked}
        onChange={handleChange}
        className="absolute w-0 h-0 opacity-0"
      />
      <label
        htmlFor={id}
        className={`block w-5 h-5 border-2 rounded cursor-pointer ${
          isChecked ? 'bg-blue-500 border-blue-500' : 'bg-white border-gray-300'
        }`}
      >
        {isChecked && (
          <svg
            className="w-4 h-4 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        )}
      </label>
    </div>
  )
}