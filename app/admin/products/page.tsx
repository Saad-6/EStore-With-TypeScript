"use client"
import type React from "react"
import { useEffect, useState } from "react"
import { PlusIcon, Pencil, Trash2, ChevronLeft, ChevronRight } from "lucide-react"
import type { Category, Product } from "@/interfaces/product-interfaces"
import toast from "react-hot-toast"
import { ConfirmationAlert } from "@/app/components/ui/confirmation-alert"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/app/lib/auth"


const API_BASE_URL = "https://localhost:7007/api"

// Custom Pagination Component
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
  return (
    <div className="flex justify-center items-center space-x-2 mt-4">
      <Button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} variant="outline">
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <span>{`Page ${currentPage} of ${totalPages}`}</span>
      <Button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} variant="outline">
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}

export default function AdminProductPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [isAlertOpen, setIsAlertOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [deleteProductId, setDeleteProductId] = useState(0)
  const router = useRouter()
  const  {getToken}  = useAuth()

  useEffect(() => {
    fetchCategories()
    getProducts()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/Category`)
      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      } else {
        toast.error("Failed to fetch categories")
      }
    } catch (error) {
      console.error("Error fetching categories:", error)
      toast.error("An error occurred while fetching categories")
    }
  }

  const getProducts = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/Product/`)
      if (response.ok) {
        const products: Product[] = await response.json()
        setProducts(products)
      } else {
        const errorText = await response.text()
        console.error("Failed to fetch products:", errorText)
        toast.error(`Failed to fetch products. Server response: ${errorText}`)
      }
    } catch (error) {
      console.error("Error fetching products:", error)
      toast.error("An error occurred while fetching products")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteProduct = (id: number) => {
    setIsAlertOpen(true)
    setDeleteProductId(id)
  }

  const handleConfirmDelete = async () => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
      console.log(token);
      const response = await fetch(`${API_BASE_URL}/Product/${deleteProductId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        getProducts()
        toast.success("Product deleted successfully", {
          duration: 3000,
          icon: "🗑️",
        })
      } else {
        const errorText = await response.text()
        console.error("Failed to delete product:", errorText)
        toast.error(`Failed to delete product. Server response: ${errorText}`, {
          duration: 5000,
        })
      }
    } catch (error) {
      console.error("Error deleting product:", error)
      toast.error(`An error occurred while deleting the product: ${error}`, {
        duration: 5000,
      })
    } finally {
      setIsAlertOpen(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <BouncingDotsLoader color="primary" />
      </div>
    )
  }

  return (
    <div className="container bg-white rounded-md mx-auto p-4">
      <ConfirmationAlert
        isOpen={isAlertOpen}
        onClose={() => setIsAlertOpen(false)}
        onConfirm={handleConfirmDelete}
        message="Are you sure you want to delete this product? This action cannot be undone."
      />

      <h1 className="text-2xl font-bold mb-4">Product Management</h1>

      <div className="mb-4 flex justify-between items-center">
        <input
          type="text"
          placeholder="Search products..."
          className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
        <Link href="/admin/products/add-product">
          <Button>
            <PlusIcon className="inline-block mr-2 h-4 w-4" /> Add New Product
          </Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {products.slice((currentPage - 1) * 10, currentPage * 10).map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/admin/products/add-product?id=${product.id}`)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="destructive" onClick={() => handleDeleteProduct(product.id)}>
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
        totalPages={Math.ceil(products.length / 10)}
        onPageChange={setCurrentPage}
      />
    </div>
  )
}

