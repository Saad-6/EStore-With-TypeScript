'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

const lightTheme = {
  scrollTrack: 'hsl(210, 50%, 95%)',
  scrollThumb: 'hsl(210, 70%, 70%)',
  scrollThumbHover: 'hsl(210, 70%, 60%)',
}

const darkTheme = {
  scrollTrack: 'hsl(0, 0%, 15%)',
  scrollThumb: 'hsl(0, 0%, 25%)',
  scrollThumbHover: 'hsl(0, 0%, 35%)',
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('light')

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme) {
      setTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('theme', theme)
    const root = document.documentElement
    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }

    // Set scrollbar colors
    const currentTheme = theme === 'light' ? lightTheme : darkTheme
    root.style.setProperty('--scroll-track', currentTheme.scrollTrack)
    root.style.setProperty('--scroll-thumb', currentTheme.scrollThumb)
    root.style.setProperty('--scroll-thumb-hover', currentTheme.scrollThumbHover)
  }, [theme])

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light')
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
