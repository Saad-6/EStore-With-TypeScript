"use client"

import { useState, useEffect, useCallback } from "react"
import { Loader2, TrashIcon, RefreshCw, FileTextIcon } from "lucide-react"
import { format } from "date-fns"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/app/lib/auth"
import { BouncingDotsLoader } from "@/app/components/ui/Loaders"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const API_BASE_URL = "https://localhost:7007/api"

interface LogEntity {
  id: number
  message: string
  dateTime: string
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const { getToken } = useAuth()
  const { toast } = useToast()

  const fetchLogs = useCallback(async () => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "Failed to fetch logs. Authentication token not found.",
          variant: "destructive",
        })
        return
      }

      setLoading(true)
      const response = await fetch(`${API_BASE_URL}/Log`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to fetch logs")
      }
      const data = await response.json()
      setLogs(data)
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to fetch logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }, [toast, getToken])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "PPpp")
  }

  const handleClearLogs = async () => {
    try {
      const token = getToken()
      if (!token) {
        toast({
          title: "Error",
          description: "Authentication token not found.",
          variant: "destructive",
        })
        return
      }

      const response = await fetch(`${API_BASE_URL}/Log`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        throw new Error("Failed to clear logs")
      }
      toast({
        title: "Success",
        description: "Logs have been cleared successfully.",
      })
      fetchLogs()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear logs. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsDeleteDialogOpen(false)
    }
  }

  return (
    <div className="container mx-auto p-4 bg-white dark:bg-gray-900 rounded-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-neutral-700 dark:text-neutral-200">System Logs</h1>

        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            onClick={() => setIsDeleteDialogOpen(true)}
            disabled={loading || logs.length === 0}
          >
            <TrashIcon className="h-4 w-4 mr-2" />
            Clear Logs
          </Button>
        </div>
      </div>

      <Card className="w-full border-2 border-indigo-100 dark:border-indigo-900 shadow-lg">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center min-h-[400px]">
              <BouncingDotsLoader color="primary" />
            </div>
          ) : logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center mb-4">
                <FileTextIcon className="h-8 w-8 text-indigo-500" />
              </div>
              <h2 className="text-2xl font-semibold text-indigo-600 dark:text-indigo-400 mb-2">No Logs Found</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">There are currently no system logs to display.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Message
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date & Time
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">
                        {log.id}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{log.message}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400 text-right">
                        {formatDate(log.dateTime)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete all system logs from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleClearLogs} className="bg-red-600 hover:bg-red-700">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete All Logs"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

