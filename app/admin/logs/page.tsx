'use client'

import { useState, useEffect, useCallback } from 'react'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'

import { Button } from "@/components/ui/button"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from '@/hooks/use-toast'

interface LogEntity {
  id: number
  message: string
  dateTime: string
}

const themes = {
  light: {
    background: 'bg-white',
    text: 'text-gray-900',
    border: 'border-gray-200',
  },
  dark: {
    background: 'bg-gray-900',
    text: 'text-white',
    border: 'border-gray-700',
  },
  blue: {
    background: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-200',
  },
}

type Theme = keyof typeof themes

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<LogEntity[]>([])
  const [loading, setLoading] = useState(true)
  const [theme, setTheme] = useState<Theme>('light')
  const { toast } = useToast()

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true)
      const response = await fetch('https://localhost:7007/api/Log')
      if (!response.ok) {
        throw new Error('Failed to fetch logs')
      }
      const data = await response.json()
      setLogs(data)
      setLoading(false)
    } catch (err) {
      setLoading(false)
      toast({
        title: "Error",
        description: "Failed to fetch logs. Please try again.",
        variant: "destructive",
      })
    }
  }, [toast])

  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'PPpp')
  }

  const handleClearLogs = async () => {
    try {
      const response = await fetch('https://localhost:7007/api/Log', {
        method: 'DELETE',
      })
      if (!response.ok) {
        throw new Error('Failed to clear logs')
      }
      toast({
        title: "Success",
        description: "Logs have been cleared.",
      })
      fetchLogs()
    } catch (err) {
      toast({
        title: "Error",
        description: "Failed to clear logs. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className={`container mx-auto px-4 py-8 ${themes[theme].background} ${themes[theme].text}`}>
      <Card className={`mb-8 ${themes[theme].background} ${themes[theme].border}`}>
        <CardHeader>
          <CardTitle className="text-3xl font-bold">Admin Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <Select value={theme} onValueChange={(value: Theme) => setTheme(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light Theme</SelectItem>
                <SelectItem value="dark">Dark Theme</SelectItem>
                <SelectItem value="blue">Blue Theme</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={handleClearLogs} variant="destructive">
              Clear Logs
            </Button>
          </div>
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse ${themes[theme].border}`}>
                <thead>
                  <tr className={`${themes[theme].background} ${themes[theme].border}`}>
                    <th className="p-2 text-left">ID</th>
                    <th className="p-2 text-left">Message</th>
                    <th className="p-2 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className={`border-b ${themes[theme].border}`}>
                      <td className="p-2">{log.id}</td>
                      <td className="p-2">{log.message}</td>
                      <td className="p-2 text-right">{formatDate(log.dateTime)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

