'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronLeft, ChevronRight, Phone, MapPin, Package, PackageX, Search } from 'lucide-react'
import toast, { Toaster } from 'react-hot-toast'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pagination } from '@/app/components/ui/pagination'
import { Button } from '@/app/components/ui/button'
import { Input } from '@/app/components/ui/input'
import { BouncingDotsLoader } from '@/app/components/ui/Loaders'
import { headers } from 'next/headers'
import { useAuth } from '@/app/lib/auth'


const API_BASE_URL = 'https://localhost:7007/api'

interface CartItem {
  product: {
    id: string
    name: string
    sku: string
  }
  selectedVariants: Array<{
    variantName: string
    optionValue: string
    priceAdjustment: number
  }>
  quantity: number
  subTotal: number
}

interface Order {
  id: string
  cartItems: CartItem[]
  total: number
  user: {
    id: string
    userName: string
    email: string
  }
  address: {
    firstName: string
    lastName: string
    city: string
    zipCode: string
    streetAddress: string
    phoneNumber: string
  }
  created: string
  status: number
}



const statusColors = {
  0: 'bg-yellow-200 text-yellow-800', // Pending
  1: 'bg-blue-200 text-blue-800',     // Confirmed
  2: 'bg-purple-200 text-purple-800', // Shipped
  3: 'bg-green-200 text-green-800',   // Delivered
  4: 'bg-red-200 text-red-800',       // Cancelled
  5: 'bg-gray-200 text-gray-800'      // Unknown
}

const statusLabels = {
  0: 'Pending',
  1: 'Confirmed',
  2: 'Shipped',
  3: 'Delivered',
  4: 'Cancelled',
  5: 'Unknown'
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<number | null>(null)
  const [searchOrderId, setSearchOrderId] = useState<string>('')
  const[isLoading,setIsLoading] = useState(false);
  const ordersPerPage = 10
  const indexOfLastOrder = currentPage * ordersPerPage
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage
  const filteredOrders = filterStatus !== null
    ? orders.filter(order => order.status === filterStatus)
    : orders
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder)
  const{getToken} = useAuth();
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage)

  useEffect(() => {
    fetchOrders()
  }, [filterStatus])

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
      const url = filterStatus !== null
        ? `${API_BASE_URL}/Order?status=${filterStatus}`
        : `${API_BASE_URL}/Order`
      const response = await fetch(
        url
        ,{
          headers:{
            Authorization: `Bearer ${token}`,
          }
        
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        setCurrentPage(1) // Reset to first page when filter changes
      } else {
        toast.error('Failed to fetch orders')
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast.error('An error occurred while fetching orders')
    }
    setIsLoading(false);
  }

  const handleStatusChange = async (orderId: string, newStatus: number) => {
    try {
      const token = getToken();
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
      const response = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setOrders(orders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        ))
        toast.success(`Order status updated to ${statusLabels[newStatus as keyof typeof statusLabels]}`)
      } else {
        toast.error('Failed to update order status')
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      toast.error('An error occurred while updating order status')
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleSearchOrder = async () => {
    if (!searchOrderId.trim()) {
      toast.error('Please enter an order ID')
      return
    }

    try {
      const response = await fetch(`${API_BASE_URL}/Order/${searchOrderId}`)
      if (response.ok) {
        const order = await response.json()
        setOrders([order])
        setCurrentPage(1)
        setFilterStatus(null)
      } else {
        toast.error('Order not found')
      }
    } catch (error) {
      console.error('Error searching for order:', error)
      toast.error('An error occurred while searching for the order')
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
    <div className="container mx-auto p-4 bg-white rounded-md">

      <h1 className="text-3xl font-bold mb-6  text-neutral-700">Order Management</h1>
      
      <div className="mb-4 flex flex-wrap gap-4">
  <div className="bg-white rounded-md shadow-sm">
    <Select 
      onValueChange={(value) => setFilterStatus(value === 'all' ? null : parseInt(value))}
      defaultValue="all"
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Filter by Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All Orders</SelectItem>
        <SelectItem value="0">Pending</SelectItem>
        <SelectItem value="1">Confirmed</SelectItem>
        <SelectItem value="2">Shipped</SelectItem>
        <SelectItem value="3">Delivered</SelectItem>
        <SelectItem value="4">Cancelled</SelectItem>
      </SelectContent>
    </Select>
  </div>
  <div className="flex bg-white rounded-md shadow-sm">
    <Input
      type="text"
      placeholder="Search by Order ID"
      value={searchOrderId}
      onChange={(e) => setSearchOrderId(e.target.value)}
      className="w-64 rounded-r-none border-r-0"
    />
    <Button onClick={handleSearchOrder} className="rounded-l-none">
      <Search className="h-4 w-4 mr-2" />
      Search
    </Button>
  </div>
</div>

      {filteredOrders.length === 0 ? (
        <Card className="w-full border-2 border-indigo-100 shadow-lg">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <PackageX className="w-16 h-16 text-indigo-300 mb-4" />
            <h2 className="text-2xl font-semibold text-indigo-600 mb-2">No Orders Found</h2>
            <p className="text-gray-600">
              {filterStatus !== null 
                ? `There are no ${statusLabels[filterStatus as keyof typeof statusLabels].toLowerCase()} orders at the moment.`
                : "There are no orders to display."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {currentOrders.map((order) => (
            <Card key={order.id} className="w-full border-2 border-indigo-100 shadow-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-50 to-blue-50">
                <CardTitle className="text-lg font-semibold text-neutral-700">
                  Order #{order.id}
                </CardTitle>
                <Badge className={`${statusColors[order.status as keyof typeof statusColors]} px-3 py-1 text-sm font-semibold`}>
                  {statusLabels[order.status as keyof typeof statusLabels]}
                </Badge>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 rounded-lg shadow">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Customer</p>
                    <p className="font-semibold">{order.user?.userName ?? "Unregistered user"}</p>
                    <p className="text-gray-600">{order.user?.email}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Total</p>
                    <p className="text-2xl font-bold text-green-600">${order.total.toFixed(2)}</p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Shipping Address</p>
                    <p className="font-semibold">{order.address.firstName} {order.address.lastName}</p>
                    <p className="text-gray-600 flex items-center">
                      <MapPin className="h-4 w-4 mr-1 text-indigo-500" />
                      {order.address.streetAddress}, {order.address.city}, {order.address.zipCode}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg shadow">
                    <p className="text-sm font-medium text-indigo-600 mb-1">Contact</p>
                    <p className="flex items-center font-semibold">
                      <Phone className="h-4 w-4 mr-2 text-indigo-500" />
                      {order.address.phoneNumber}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center">
                  <Select 
                    onValueChange={(value) => handleStatusChange(order.id, parseInt(value))}
                    defaultValue={order.status.toString()}
                  >
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder={statusLabels[order.status as keyof typeof statusLabels]} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Pending</SelectItem>
                      <SelectItem value="1">Confirmed</SelectItem>
                      <SelectItem value="2">Shipped</SelectItem>
                      <SelectItem value="3">Delivered</SelectItem>
                      <SelectItem value="4">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button onClick={() => toggleOrderExpansion(order.id)} variant="outline">
                    {expandedOrder === order.id ? 'Hide Details' : 'Show Details'}
                    <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${expandedOrder === order.id ? 'rotate-180' : ''}`} />
                  </Button>
                </div>
                {expandedOrder === order.id && (
                  <div className="mt-4 border-t border-indigo-100 pt-4">
                    <h4 className="font-semibold mb-2 text-indigo-600 flex items-center">
                      <Package className="h-5 w-5 mr-2" />
                      Order Items:
                    </h4>
                    <div className="flex flex-wrap -mx-2">
                      {order.cartItems.map((item, index) => (
                        <div key={index} className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 px-2 mb-4">
                          <Card className="h-full">
                            <CardContent className="p-3">
                              <p className="font-medium text-indigo-600">{item.product.name}</p>
                              <p className="text-sm text-gray-600">SKU: {item.product.sku}</p>
                              <p className="text-sm">Quantity: {item.quantity}</p>
                              <p className="text-sm font-semibold text-green-600">Subtotal: ${item.subTotal.toFixed(2)}</p>
                              {item.selectedVariants.length > 0 && (
                                <div className="mt-1">
                                  <p className="text-sm font-medium text-indigo-600">Variants:</p>
                                  <ul className="list-disc list-inside">
                                    {item.selectedVariants.map((variant, vIndex) => (
                                      <li key={vIndex} className="text-sm">
                                        {variant.variantName}: {variant.optionValue}
                                        {variant.priceAdjustment !== 0 && (
                                          <span className="ml-1 text-gray-600">
                                            ({variant.priceAdjustment > 0 ? '+' : '-'}${Math.abs(variant.priceAdjustment).toFixed(2)})
                                          </span>
                                        )}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {filteredOrders.length > 0 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}
    </div>
  )
}