import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { SearchIcon, XIcon, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
  onSearch: (searchTerm: string) => void
}

export function SearchModal({ isOpen, onClose, onSearch }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const modalRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    try {
      onClose()
      onSearch(searchTerm)
    } catch (error) {
      console.error('Error handling search:', error)
      toast.error('Failed to perform search. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
          <motion.div
            ref={modalRef}
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
              <SearchIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
              <Input
                type="text"
                placeholder="Search products, categories, brands..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-grow dark:bg-gray-700 dark:text-white"
                autoFocus
              />
              <Button onClick={handleSearch} className="ml-2 bg-blue-500 hover:bg-blue-600 text-white">
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Search'}
              </Button>
              <Button variant="ghost" onClick={onClose} className="ml-2">
                <XIcon className="w-5 h-5" />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}