"use client"

import React, { useEffect, useState } from 'react'
import { PlusIcon, Pencil, Trash2, ChevronLeft, ChevronRight, X, Link } from 'lucide-react'
import { Category, Product, ProductDTO } from '@/interfaces/product-interfaces'
import ProductForm from '@/app/components/product-form'
import toast, { Toaster } from 'react-hot-toast'
import { ConfirmationAlert } from '@/app/components/ui/confirmation-alert'

// Custom Button Component (updated with new color scheme)
interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'danger'
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
}

const Button: React.FC<ButtonProps> = ({ children, onClick, variant = "primary", type = "button", disabled = false }) => {

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

// Custom Modal Component (unchanged)
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
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

// Custom Pagination Component (unchanged)
interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}
const Pagination: React.FC<PaginationProps> = ({ currentPage, totalPages, onPageChange }) => {
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
const API_BASE_URL = 'https://localhost:7007/api';

export default function AdminProductPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories,setCategories] = useState<Category[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddProductModalOpen, setIsAddProductModalOpen] = useState(false);
  const [isEditProductModalOpen, setIsEditProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [deleteProductId,setDeleteProductId] = useState(0);
useEffect(()=>{
fetchCategories();
GetProducts();
},[]);

  const productsPerPage = 10
  const indexOfLastProduct = currentPage * productsPerPage
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct)

  const totalPages = Math.ceil(products.length / productsPerPage)

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

const GetProducts = async () =>{
  const method = 'GET';
  const url = 'https://localhost:7007/api/Product/';
  const res = await fetch(url, {
    method: method,
  });
  if (res.ok) {
    const products: Product[] = await res.json();
  
   setProducts(products)
    
  } else {
    const errorText = await res.text();
    console.error("Failed to fetch product:", errorText);
    toast.error(`Failed to fetch product. Server response: ${errorText}`, { duration: 20000 });
  }
}

const handleAddOrUpdateProduct = async (product: ProductDTO, operation: string) : Promise<void> =>  {
  try {
    console.log("Operation is handleAddOrUpdate is :",operation);
    const method = 'POST' ;
    const url = `https://localhost:7007/api/Product?operation=${encodeURIComponent(operation)}`;

    const res = await fetch(url, {
      method: method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...product, operation }),
    });

    if (res.ok) {
      const updatedProduct: Product = await res.json();
      if (operation === 'add') {
        setProducts([...products, updatedProduct]);
        setIsAddProductModalOpen(false);
        toast.success('Product added successfully', { 
          duration: 3000,
          icon: '🎉'
        });
      } else {
        setProducts(products.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        setIsEditProductModalOpen(false);
        toast.success('Product updated successfully', { 
          duration: 3000,
          icon: '🎉'
        });
      }
      GetProducts();
    } else {
      const errorText = await res.text();
      console.error("Failed to add/update product:", errorText);
      toast.error(`Failed to ${operation} product. Server response: ${errorText}`, { duration: 20000 });
    }
  } catch (error) {
    console.error("Error adding/updating product:", error);
    toast.error(`An error occurred while ${operation === 'add' ? 'adding' : 'updating'} the product: ${error}`);
  }
}


  const handleDeleteProduct = (id: number) => {
    setIsAlertOpen(true);
    setDeleteProductId(id);
    //setProducts(products.filter(p => p.id !== id))
  }
  const handleConfirmDelete = async()=>{
    try {
      const response = await fetch(`https://localhost:7007/api/Product/${deleteProductId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        GetProducts();
        toast.success('Product deleted successfully', {
          duration: 3000,
          icon: '🗑️',
        });
      } else {
        const errorText = await response.text();
        console.error('Failed to delete product:', errorText);
        toast.error(`Failed to delete product. Server response: ${errorText}`, {
          duration: 5000,
        });
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`An error occurred while deleting the product: ${error}`, {
        duration: 5000,
      });
    }
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
      <Link href='products/add-product'>
      
      </Link>
        <Button onClick={() =>{ setIsAddProductModalOpen(true)}}>
          <PlusIcon className="inline-block mr-2 h-4 w-4" /> Add New Product
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentProducts.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap">{product.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.category.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">${product.price}</td>
                <td className="px-6 py-4 whitespace-nowrap">{product.stock}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button variant="secondary" onClick={() => {
                      setEditingProduct(product)
                      setIsEditProductModalOpen(true)
                    }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="danger" onClick={() => handleDeleteProduct(product.id)}>
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
        isOpen={isAddProductModalOpen}
        onClose={() => setIsAddProductModalOpen(false)}
        title="Add New Product"
      >
        <ProductForm
          onSubmit={handleAddOrUpdateProduct}
          categories={categories}
        />
      </Modal>

      <Modal
        isOpen={isEditProductModalOpen}
        onClose={() => setIsEditProductModalOpen(false)}
        title="Edit Product"
      >
        {editingProduct && (
          <ProductForm
            product={editingProduct}
            onSubmit={handleAddOrUpdateProduct}
            categories={categories}
          />
        )}
      </Modal>
    </div>
  )
}