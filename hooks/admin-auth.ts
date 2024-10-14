import { useState, useEffect } from 'react'

export function useAdminAuth() {
  const [isAuthorized, setIsAuthorized] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate an API call to check authorization
    const checkAuth = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay
      setIsAuthorized(true) // Set to true by default as requested
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  return { isAuthorized, isLoading }
}