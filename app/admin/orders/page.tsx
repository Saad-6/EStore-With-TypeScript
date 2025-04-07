"use client"

import { useState, useEffect, useCallback } from "react"
import {
  ChevronDown,
  Phone,
  MapPin,
  Package,
  PackageX,
  Search,
  Calendar,
  Clock,
  CreditCard,
  ShoppingBag,
  Filter,
  ArrowDownUp,
} from "lucide-react"
import toast from "react-hot-toast"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Pagination } from "@/app/components/ui/pagination"
import { Button } from "@/app/components/ui/button"
import { Input } from "@/app/components/ui/input"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import { useAuth } from "@/app/lib/auth"
import { motion, AnimatePresence } from "framer-motion"

const API_BASE_URL = "https://localhost:7007/api"

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
  1: "bg-amber-100 text-amber-800 border-amber-200", // Pending
  2: "bg-blue-100 text-blue-800 border-blue-200", // Confirmed
  3: "bg-violet-100 text-violet-800 border-violet-200", // Shipped
  4: "bg-emerald-100 text-emerald-800 border-emerald-200", // Delivered
  5: "bg-rose-100 text-rose-800 border-rose-200", // Cancelled
  6: "bg-slate-100 text-slate-800 border-slate-200", // Unknown
}

const statusIcons = {
  1: <Clock className="h-3.5 w-3.5 mr-1" />, // Pending
  2: <CreditCard className="h-3.5 w-3.5 mr-1" />, // Confirmed
  3: <Package className="h-3.5 w-3.5 mr-1" />, // Shipped
  4: <ShoppingBag className="h-3.5 w-3.5 mr-1" />, // Delivered
  5: <PackageX className="h-3.5 w-3.5 mr-1" />, // Cancelled
  6: <Package className="h-3.5 w-3.5 mr-1" />, // Unknown
}

const statusLabels = {
  1: "Pending",
  2: "Confirmed",
  3: "Shipped",
  4: "Delivered",
  5: "Cancelled",
  6: "Unknown",
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null)
  const [filterStatus, setFilterStatus] = useState<number | null>(null)
  const [searchOrderId, setSearchOrderId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)
  const [pageSize, setPageSize] = useState(5)
  const [sortOrder, setSortOrder] = useState<"latest" | "oldest">("latest")
  const { getToken } = useAuth()

  const fetchOrders = useCallback(async () => {
    setIsLoading(true)
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
      const url = new URL(`${API_BASE_URL}/Order`)
      url.searchParams.append("page", currentPage.toString())
      url.searchParams.append("size", pageSize.toString())
      url.searchParams.append("sort", sortOrder)
      if (filterStatus !== null) {
        url.searchParams.append("status", filterStatus.toString())
      }
      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const data = await response.json()
        setOrders(data.orders)
        setTotalPages(Math.ceil(data.totalCount / pageSize))
      } else {
        toast.error("Failed to fetch orders")
      }
    } catch (error) {
      console.error("Error fetching orders:", error)
      toast.error("An error occurred while fetching orders")
    }
    setIsLoading(false)
  }, [getToken, currentPage, pageSize, filterStatus, sortOrder])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: number) => {
    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
      const response = await fetch(`${API_BASE_URL}/Order/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })
      if (response.ok) {
        setOrders(orders.map((order) => (order.id === orderId ? { ...order, status: newStatus } : order)))
        toast.success(`Order status updated to ${statusLabels[newStatus as keyof typeof statusLabels]}`)
      } else {
        toast.error("Failed to update order status")
      }
    } catch (error) {
      console.error("Error updating order status:", error)
      toast.error("An error occurred while updating order status")
    }
  }

  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId)
  }

  const handleSearchOrder = async () => {
    if (!searchOrderId.trim()) {
      toast.error("Please enter an order ID")
      return
    }

    try {
      const token = getToken()
      if (!token) {
        toast.error("Authentication token not found")
        return
      }
      const response = await fetch(`${API_BASE_URL}/Order/${searchOrderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (response.ok) {
        const orders = await response.json()
        if (orders.length > 0) {
          setOrders(orders)
        } else {
          setOrders([])
        }
        setCurrentPage(1)
        setTotalPages(1)
        setFilterStatus(null)
      } else {
        toast.error("Order not found")
      }
    } catch (error) {
      console.error("Error searching for order:", error)
      toast.error("An error occurred while searching for the order")
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  return (
    <div className="container mx-auto p-6 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 rounded-lg shadow-sm">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-200">Order Management</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">View and manage customer orders</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 border border-gray-200 dark:border-gray-700">
          <div className="flex-shrink-0 pl-3">
            <Filter className="h-4 w-4 text-gray-400" />
          </div>
          <Select
            onValueChange={(value) => {
              setFilterStatus(value === "all" ? null : Number.parseInt(value))
              setCurrentPage(1)
            }}
            defaultValue="all"
          >
            <SelectTrigger className="border-0 shadow-none focus:ring-0 pl-2">
              <SelectValue placeholder="Filter by Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Orders</SelectItem>
              <SelectItem value="1">Pending</SelectItem>
              <SelectItem value="2">Confirmed</SelectItem>
              <SelectItem value="3">Shipped</SelectItem>
              <SelectItem value="4">Delivered</SelectItem>
              <SelectItem value="5">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <Input
            type="text"
            placeholder="Search by Order ID"
            value={searchOrderId}
            onChange={(e) => setSearchOrderId(e.target.value)}
            className="border-0 focus:ring-0"
          />
          <Button
            onClick={handleSearchOrder}
            variant="ghost"
            className="h-9 px-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 pl-3">
              <ArrowDownUp className="h-4 w-4 text-gray-400" />
            </div>
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value as "latest" | "oldest")}>
              <SelectTrigger className="border-0 shadow-none focus:ring-0 pl-2">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Latest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center bg-white dark:bg-gray-800 rounded-lg shadow-sm p-1 border border-gray-200 dark:border-gray-700">
            <div className="flex-shrink-0 pl-3">
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <Select
              value={pageSize.toString()}
              onValueChange={(value) => {
                setPageSize(Number(value))
                setCurrentPage(1)
              }}
            >
              <SelectTrigger className="border-0 shadow-none focus:ring-0 pl-2">
                <SelectValue placeholder="Page Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-32">
          <BouncingDotsLoader color="primary" />
        </div>
      ) : orders.length === 0 ? (
        <Card className="w-full border-0 shadow-lg bg-white dark:bg-gray-800 overflow-hidden">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-6 shadow-inner">
              <PackageX className="h-10 w-10 text-gray-500 dark:text-gray-400" />
            </div>
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-200 mb-3">No Orders Found</h2>
            <p className="text-gray-600 dark:text-gray-400 mb-8 text-center max-w-md">
              {filterStatus !== null
                ? `There are no ${statusLabels[filterStatus as keyof typeof statusLabels].toLowerCase()} orders at the moment.`
                : searchOrderId
                  ? "No orders match your search criteria."
                  : "There are no orders to display at the moment."}
            </p>
            {(filterStatus !== null || searchOrderId) && (
              <Button
                variant="outline"
                onClick={() => {
                  setFilterStatus(null)
                  setSearchOrderId("")
                  fetchOrders()
                }}
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700/30"
              >
                Clear Filters
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-5">
          <AnimatePresence>
            {orders?.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="w-full border-0 shadow-md hover:shadow-lg transition-shadow duration-200 bg-white dark:bg-gray-800 overflow-hidden">
                  <CardHeader className="p-4 border-b border-gray-200 dark:border-gray-700 bg-slate-700 dark:bg-slate-800">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          <CardTitle className="text-lg font-semibold text-white">Order #{order.id}</CardTitle>
                          <Badge
                            className={`ml-3 ${statusColors[order.status as keyof typeof statusColors]} px-2.5 py-0.5 text-xs font-medium flex items-center`}
                          >
                            {statusIcons[order.status as keyof typeof statusIcons]}
                            {statusLabels[order.status as keyof typeof statusLabels]}
                          </Badge>
                        </div>
                        <CardDescription className="mt-1 flex items-center text-slate-300">
                          <Calendar className="h-3.5 w-3.5 mr-1.5" />
                          {formatDate(order.created)}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          onValueChange={(value) => handleStatusChange(order.id, Number.parseInt(value))}
                          defaultValue={order?.status?.toString()}
                        >
                          <SelectTrigger className="h-9 w-[160px] bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                            <SelectValue placeholder={statusLabels[order.status as keyof typeof statusLabels]} />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">Pending</SelectItem>
                            <SelectItem value="2">Confirmed</SelectItem>
                            <SelectItem value="3">Shipped</SelectItem>
                            <SelectItem value="4">Delivered</SelectItem>
                            <SelectItem value="5">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          onClick={() => toggleOrderExpansion(order.id)}
                          variant="outline"
                          size="sm"
                          className="h-9 border-gray-200 dark:border-gray-700 bg-white text-gray-800 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
                        >
                          {expandedOrder === order.id ? "Hide" : "Details"}
                          <ChevronDown
                            className={`ml-1 h-4 w-4 transition-transform duration-200 ${expandedOrder === order.id ? "rotate-180" : ""}`}
                          />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800/30">
                        <p className="text-xs font-medium text-blue-700 dark:text-blue-400 uppercase tracking-wider mb-2">
                          Customer
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {order.user?.userName ?? "Unregistered user"}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">{order.user?.email}</p>
                      </div>

                      <div className="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-lg border border-emerald-100 dark:border-emerald-800/30">
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 uppercase tracking-wider mb-2">
                          Total
                        </p>
                        <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                          <span className="text-emerald-600 dark:text-emerald-400">${order?.total?.toFixed(2)}</span>
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm">
                          {order.cartItems.length} item{order.cartItems.length !== 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-100 dark:border-amber-800/30">
                        <p className="text-xs font-medium text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-2">
                          Shipping Address
                        </p>
                        <p className="font-semibold text-gray-800 dark:text-gray-200">
                          {order?.address?.firstName} {order?.address?.lastName}
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm flex items-start">
                          <MapPin className="h-4 w-4 mr-1 text-amber-600 dark:text-amber-500 mt-0.5 flex-shrink-0" />
                          <span>
                            {order?.address?.streetAddress}, {order?.address?.city}, {order?.address?.zipCode}
                          </span>
                        </p>
                      </div>

                      <div className="bg-slate-50 dark:bg-slate-900/30 p-4 rounded-lg border border-slate-100 dark:border-slate-800/30">
                        <p className="text-xs font-medium text-slate-700 dark:text-slate-400 uppercase tracking-wider mb-2">
                          Contact
                        </p>
                        <p className="flex items-center font-semibold text-gray-800 dark:text-gray-200">
                          <Phone className="h-4 w-4 mr-2 text-slate-600 dark:text-slate-500" />
                          {order?.address?.phoneNumber}
                        </p>
                      </div>
                    </div>

                    <AnimatePresence>
                      {expandedOrder === order.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-6 pt-5 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="font-semibold mb-4 text-gray-800 dark:text-gray-200 flex items-center">
                              <ShoppingBag className="h-5 w-5 mr-2 text-slate-600 dark:text-slate-400" />
                              Order Items
                            </h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                              {order.cartItems.map((item, index) => (
                                <Card
                                  key={index}
                                  className="border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden"
                                >
                                  <CardHeader className="p-3 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
                                    <CardTitle className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">
                                      {item.product.name}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent className="p-3 space-y-2">
                                    <div className="flex justify-between items-center">
                                      <span className="text-xs text-gray-500 dark:text-gray-400">
                                        SKU: {item.product.sku}
                                      </span>
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-gray-100 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                      >
                                        Qty: {item.quantity}
                                      </Badge>
                                    </div>

                                    {item.selectedVariants.length > 0 && (
                                      <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
                                        <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                                          Variants:
                                        </p>
                                        <ul className="space-y-1">
                                          {item.selectedVariants.map((variant, vIndex) => (
                                            <li
                                              key={vIndex}
                                              className="text-xs text-gray-600 dark:text-gray-400 flex justify-between"
                                            >
                                              <span>
                                                {variant.variantName}:{" "}
                                                <span className="font-medium text-gray-700 dark:text-gray-300">
                                                  {variant.optionValue}
                                                </span>
                                              </span>
                                              {variant.priceAdjustment !== 0 && (
                                                <span className="text-xs ml-1 text-gray-500 dark:text-gray-400">
                                                  {variant.priceAdjustment > 0 ? "+" : "-"}$
                                                  {Math.abs(variant.priceAdjustment).toFixed(2)}
                                                </span>
                                              )}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}

                                    <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
                                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                        Subtotal:
                                      </span>
                                      <span className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                                        ${item.subTotal.toFixed(2)}
                                      </span>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      )}
    </div>
  )
}

