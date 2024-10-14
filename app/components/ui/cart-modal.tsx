import { XIcon } from 'lucide-react'
import React, { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}

export function Modal({ isOpen, onClose, children }: ModalProps) {
  const [isBrowser, setIsBrowser] = useState(false)

  useEffect(() => {
    setIsBrowser(true)
  }, [])

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-3xl mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          <button
            className="absolute top-0 right-0 p-2 m-2 text-gray-400 hover:text-gray-500"
            onClick={onClose}
          >
            <XIcon className="w-6 h-6" />
          </button>
          {children}
        </div>
      </div>
      <div className="fixed inset-0 bg-black opacity-25"></div>
    </div>
  )

  if (isBrowser) {
    return isOpen ? createPortal(modalContent, document.body) : null
  } else {
    return null
  }
}