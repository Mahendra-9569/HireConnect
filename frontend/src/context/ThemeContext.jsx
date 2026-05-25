import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { getTheme, setTheme } from '../api/client'

const ThemeContext = createContext(null)

const THEME_KEY = 'app-theme'

function getInitialTheme() {
  const saved = getTheme() || localStorage.getItem(THEME_KEY)

  if (saved === 'light' || saved === 'dark') return saved


  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }

  return 'light'
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getInitialTheme)


  useEffect(() => {
    const root = document.documentElement


    root.style.transition = 'background-color 0.3s ease, color 0.3s ease'

    if (theme === 'dark') {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }


    localStorage.setItem(THEME_KEY, theme)
    setTheme(theme)
  }, [theme])


  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    const handler = (e) => {
      const saved = localStorage.getItem(THEME_KEY)
      if (!saved) {
        setThemeState(e.matches ? 'dark' : 'light')
      }
    }

    media.addEventListener('change', handler)
    return () => media.removeEventListener('change', handler)
  }, [])

  const value = useMemo(() => ({
    theme,

    toggleTheme: () =>
      setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark')),

    setTheme: (next) => {
      if (next === 'light' || next === 'dark') {
        setThemeState(next)
      }
    },

    isDark: theme === 'dark',
  }), [theme])

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)