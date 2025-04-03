"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronUp, ChevronDown } from "lucide-react"

interface StripDTO {
  id: number
  texts: StripTextEntity[]
  backgroundColor: string
  textColor: string
  isActive: boolean
}

interface StripTextEntity {
  id: number
  text: string
  stripId: number
}
const API_BASE_URL = "https://localhost:7007/api"

export default function TopStrip() {
  const [strip, setStrip] = useState<StripDTO | null>(null)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const stripRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchStrip()
  }, [])

  // Auto-rotate through texts
  useEffect(() => {
    if (!strip?.texts.length) return

    const interval = setInterval(() => {
      setCurrentTextIndex((prev) => (prev + 1) % strip.texts.length)
    }, 5000) // Change text every 5 seconds

    return () => clearInterval(interval)
  }, [strip])

  const fetchStrip = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/BaseLayout/strip`)

      if (response.ok) {
        const data: StripDTO = await response.json()
        setStrip(data)
      }
    } catch (error) {
      console.error("Error fetching strip:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // If strip is not active or there are no texts, don't render anything
  if (isLoading || !strip || !strip.isActive || !strip.texts.length) {
    return null
  }

  return (
    <>
      <div
        ref={stripRef}
        className={`w-full transition-all duration-300 overflow-hidden ${isCollapsed ? "h-0" : "py-2"} ${strip.backgroundColor} ${strip.textColor}`}
      >
        <div className="container mx-auto px-4 flex justify-center items-center">
          <div className="text-center font-medium animate-fade-in">{strip.texts[currentTextIndex]?.text}</div>
        </div>
      </div>

      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className={`absolute right-4 z-10 p-1 rounded-b-md ${strip.backgroundColor} ${strip.textColor}`}
        style={{ top: isCollapsed ? 0 : stripRef.current?.offsetHeight || 0 }}
        aria-label={isCollapsed ? "Expand promotional strip" : "Collapse promotional strip"}
      >
        {isCollapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
      </button>
    </>
  )
}

