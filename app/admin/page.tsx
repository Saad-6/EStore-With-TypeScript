'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  CurrencyDollarIcon, 
  ShoppingCartIcon, 
  UserGroupIcon, 
} from '@heroicons/react/24/outline'
import { TrendingUpIcon } from 'lucide-react'
interface StatCardProps {
  value: number | string;  // Adjust the type based on what value can hold
  icon: React.ComponentType;  // Type for the Icon component
  change: number;  // Adjust the type based on what change can hold
  title: string;
}
// Mock data for charts (unchanged)
const salesData = [
  { name: 'Jan', sales: 4000 },
  { name: 'Feb', sales: 3000 },
  { name: 'Mar', sales: 5000 },
  { name: 'Apr', sales: 4500 },
  { name: 'May', sales: 6000 },
  { name: 'Jun', sales: 5500 },
]

const categoryData = [
  { name: 'Electronics', value: 400 },
  { name: 'Clothing', value: 300 },
  { name: 'Books', value: 200 },
  { name: 'Home', value: 100 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

const StatCard: React.FC<StatCardProps> = ({ value, icon: Icon, change, title }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="bg-gray-800 rounded-lg shadow-md p-6"
  >
    <div className="flex items-center justify-between mb-4">
      <div className="text-xl font-semibold text-gray-200">{title}</div>
      <div className="w-8 h-8 text-blue-400">

      <Icon  />
      </div>
    </div>
    <div className="text-3xl font-bold mb-2 text-white">{value}</div>
    <div className={`flex items-center ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
      <TrendingUpIcon className={`w-4 h-4 mr-1 ${change >= 0 ? '' : 'transform rotate-180'}`} />
      <span>{Math.abs(change)}% from last month</span>
    </div>
  </motion.div>
)

export default function AdminDashboard() {
  return (
    <div className="space-y-8 bg-white p-6 rounded-md">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-3xl font-bold text-gray-900"
      >
        Dashboard
      </motion.h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Revenue" value="$54,763" icon={CurrencyDollarIcon} change={12.5} />
        <StatCard title="Orders" value="1,243" icon={ShoppingCartIcon} change={-3.2} />
        <StatCard title="Customers" value="8,764" icon={UserGroupIcon} change={7.8} />
        <StatCard title="Avg. Order Value" value="$124" icon={TrendingUpIcon} change={2.1} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Sales Overview</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
              <Bar dataKey="sales" fill="#3B82F6" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-gray-800 rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-semibold mb-4 text-white">Sales by Category</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', color: '#fff' }} />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="bg-gray-800 rounded-lg shadow-md p-6"
      >
        <h2 className="text-xl font-semibold mb-4 text-white">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {[
                { id: '1234', customer: 'John Doe', date: '2023-06-01', total: '$120.50', status: 'Completed' },
                { id: '1235', customer: 'Jane Smith', date: '2023-06-02', total: '$85.00', status: 'Processing' },
                { id: '1236', customer: 'Bob Johnson', date: '2023-06-03', total: '$220.75', status: 'Shipped' },
              ].map((order) => (
                <tr key={order.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-300">#{order.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.customer}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.date}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{order.total}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${order.status === 'Completed' ? 'bg-green-800 text-green-100' : 
                        order.status === 'Processing' ? 'bg-yellow-800 text-yellow-100' : 
                        'bg-blue-800 text-blue-100'}`}>
                      {order.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  )
}