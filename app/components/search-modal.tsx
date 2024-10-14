import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { SearchIcon, XIcon } from 'lucide-react'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

// Mock product data
const products = [
  { id: 1, name: 'Wireless Earbuds', category: 'Electronics' },
  { id: 2, name: 'Smart Watch', category: 'Electronics' },
  { id: 3, name: 'Running Shoes', category: 'Sports' },
  { id: 4, name: 'Coffee Maker', category: 'Home & Kitchen' },
  { id: 5, name: 'Smartphone', category: 'Electronics' },
]

export function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState(products)

  useEffect(() => {
    if (searchTerm) {
      const filtered = products.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults(products)
    }
  }, [searchTerm])

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
            initial={{ scale: 0.9, y: -20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: -20 }}
            className="bg-white rounded-lg shadow-xl w-full max-w-2xl"
          >
            <div className="p-4 border-b flex items-center">
              <SearchIcon className="w-5 h-5 text-gray-500 mr-2" />
              <Input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-grow"
                autoFocus
              />
              <Button variant="ghost" onClick={onClose} className="ml-2">
                <XIcon className="w-5 h-5" />
              </Button>
            </div>
            <div className="max-h-96 overflow-y-auto p-4">
              {results.length > 0 ? (
                <ul className="space-y-2">
                  {results.map((product) => (
                    <li key={product.id} className="hover:bg-gray-100 p-2 rounded">
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-gray-500">{product.category}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-center text-gray-500">No results found</p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}