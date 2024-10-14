import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { Button } from '../components/ui/button'


// Mock order data
const orders = [
  { id: 1, date: '2023-06-01', total: 125.99, status: 'Delivered' },
  { id: 2, date: '2023-05-15', total: 79.99, status: 'Shipped' },
  { id: 3, date: '2023-05-02', total: 249.99, status: 'Delivered' },
  { id: 4, date: '2023-04-18', total: 59.99, status: 'Delivered' },
  { id: 5, date: '2023-04-05', total: 149.99, status: 'Returned' },
  // Add more orders as needed
]

const itemsPerPage = 3

export default function PastOrders() {
  const [currentPage, setCurrentPage] = useState(1)

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = orders.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(orders.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Order ID</th>
              <th className="py-2 px-4">Date</th>
              <th className="py-2 px-4">Total</th>
              <th className="py-2 px-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentItems.map((order, index) => (
              <motion.tr
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="border-b"
              >
                <td className="py-2 px-4">#{order.id}</td>
                <td className="py-2 px-4">{order.date}</td>
                <td className="py-2 px-4">${order.total.toFixed(2)}</td>
                <td className="py-2 px-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold
                    ${order.status === 'Delivered' ? 'bg-green-200 text-green-800' :
                      order.status === 'Shipped' ? 'bg-blue-200 text-blue-800' :
                      'bg-red-200 text-red-800'}`}>
                    {order.status}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-6 flex justify-between items-center">
        <Button
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          variant="outline"
        >
          <ChevronLeftIcon className="w-5 h-5 mr-2" />
          Previous
        </Button>
        <span className="text-sm">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          variant="outline"
        >
          Next
          <ChevronRightIcon className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}