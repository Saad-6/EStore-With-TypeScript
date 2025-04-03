'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'

const API_BASE_URL = "https://localhost:7007/api";
interface FontContextType {
  fontFamily: string
  fontCategory: string
  isLoaded: boolean
}

const FontContext = createContext<FontContextType>({
  fontFamily: 'Inter',
  fontCategory: 'sans-serif',
  isLoaded: false
})

export const useFont = () => useContext(FontContext)

export function FontProvider({ children }: { children: ReactNode }) {
  const [fontData, setFontData] = useState<FontContextType>({
    fontFamily: 'Inter',
    fontCategory: 'sans-serif',
    isLoaded: false
  })

  useEffect(() => {
    const fetchActiveFont = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/BaseLayout/Active`)
        
        if (response.ok) {
          const data = await response.json()
          // Load the font
          const fontFamily = data.family
          const fontCategory = data.category
          
          // Parse variants to get regular and bold weights
          const variants = JSON.parse(data.variants)
          const regularVariant = variants.includes('regular') ? 'regular' : '400'
          const boldVariant = variants.includes('700') ? '700' : (variants.includes('bold') ? 'bold' : regularVariant)
          
          // Create a link element for the font
          const link = document.createElement('link')
          link.href = `https://fonts.googleapis.com/css2?family=${fontFamily.replace(/ /g, '+')}:wght@${regularVariant};${boldVariant}&display=swap`
          link.rel = 'stylesheet'
          document.head.appendChild(link)
          
          // Set the font data
          setFontData({
            fontFamily,
            fontCategory,
            isLoaded: true
          })
          
          // Update CSS variables
          document.documentElement.style.setProperty('--font-family', `"${fontFamily}", ${fontCategory}`)
        }
      } catch (error) {
        console.error('Error fetching active font:', error)
      }
    }

    fetchActiveFont()
  }, [])

  return (
    <FontContext.Provider value={fontData}>
      {children}
    </FontContext.Provider>
  )
}