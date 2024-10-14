"use client"

import React, { useState, useEffect } from 'react'
import { PlusIcon, Pencil, Trash2, ChevronLeft, ChevronRight, X } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { ConfirmationAlert } from '@/app/components/ui/confirmation-alert'

interface Category {
  id: number
  name: string
  description: string
  thumbNailUrl: string
}

const API_BASE_URL = 'https://localhost:7007/api'

// Custom Button Component
const Button = ({ children, onClick, variant = "primary", type = "button", disabled = false }) => {
  const baseStyle = "px-4 py-2 rounded-md font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500",
    danger: "bg-red-600 text-white hover:bg-red-700 focus:ring-red-500"
  }
  
  return (
    <button
      className={`${baseStyle} ${variantStyles[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

// Custom Modal Component
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

// Custom Pagination Component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        variant="secondary"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span>{`Page ${currentPage} of ${totalPages}`}</span>
      <Button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        variant="secondary"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false)
  const [newCategory, setNewCategory] = useState<Omit<Category, 'id'>>({
    name: '',
    description: '',
    thumbNailUrl: ''
  })
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null)

  const categoriesPerPage = 10
  const indexOfLastCategory = currentPage * categoriesPerPage
  const indexOfFirstCategory = indexOfLastCategory - categoriesPerPage
  const currentCategories = categories.slice(indexOfFirstCategory, indexOfLastCategory)

  const totalPages = Math.ceil(categories.length / categoriesPerPage)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast.error('Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
      toast.error('An error occurred while fetching categories')
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch(`${API_BASE_URL}/Category`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCategory),
      })
      if (response.ok) {
        const addedCategory = await response.json()
        setCategories([...categories, addedCategory])
        setIsAddCategoryModalOpen(false)
        setNewCategory({ name: '', description: '', thumbNailUrl: '' })
        toast.success('Category added successfully')
      } else {
        toast.error('Failed to add category')
      }
    } catch (error) {
      console.error('Error adding category:', error)
      toast.error('An error occurred while adding the category')
    }
  }

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id)
    setIsAlertOpen(true)
  }

  const handleDeleteCategory = async () => {
    if (categoryToDelete === null) return

    try {
      const response = await fetch(`${API_BASE_URL}/Category/${categoryToDelete}`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setCategories(categories.filter(category => category.id !== categoryToDelete))
        toast.success('Category deleted successfully')
      } else {
        toast.error('Failed to delete category')
      }
    } catch (error) {
      console.error('Error deleting category:', error)
      toast.error('An error occurred while deleting the category')
    } finally {
      setCategoryToDelete(null)
      setIsAlertOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <Toaster position="top-right" />
      <h1 className="text-2xl font-bold mb-4">Category Management</h1>
      
      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search categories..."
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Button onClick={() => setIsAddCategoryModalOpen(true)}>
          <PlusIcon className="inline-block mr-2 h-4 w-4" /> Add New Category
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thumbnail</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentCategories.map((category) => (
              <tr key={category.id}>
                <td className="px-6 py-4 whitespace-nowrap">{category.name}</td>
                <td className="px-6 py-4">
                  <div className="max-w-xs break-words">{category.description}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <img src={category.thumbNailUrl} alt={category.name} className="h-10 w-10 rounded-full" />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button variant="danger" onClick={() => handleDeleteClick(category.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />

      <Modal
        isOpen={isAddCategoryModalOpen}
        onClose={() => setIsAddCategoryModalOpen(false)}
        title="Add New Category"
      >
        <form onSubmit={handleAddCategory} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              id="name"
              value={newCategory.name}
              onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              value={newCategory.description}
              onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
            />
          </div>
          <div>
            <label htmlFor="thumbNailUrl" className="block text-sm font-medium text-gray-700">Thumbnail URL</label>
            <input
              type="url"
              id="thumbNailUrl"
              value={newCategory.thumbNailUrl}
              onChange={(e) => setNewCategory({ ...newCategory, thumbNailUrl: e.target.value })}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <Button type="submit">Add Category</Button>
        </form>
      </Modal>

      <ConfirmationAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleDeleteCategory}
        message="Are you sure you want to delete this category? This action cannot be undone."
      />
    </div>
  )
}