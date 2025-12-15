'use client'

import { useEffect } from 'react'

/**
 * FontLoader component that ensures Material Symbols font is loaded
 * before showing icons to prevent FOUT (Flash of Unstyled Text)
 */
export function FontLoader() {
  useEffect(() => {
    // Check if fonts are already loaded
    if (document.fonts && document.fonts.check) {
      const checkFont = () => {
        const isLoaded = document.fonts.check('1em "Material Symbols Outlined"')
        if (isLoaded) {
          document.documentElement.classList.add('fonts-loaded')
        } else {
          // Wait for font to load
          document.fonts.ready.then(() => {
            document.documentElement.classList.add('fonts-loaded')
          })
        }
      }
      
      // Check immediately
      checkFont()
      
      // Also listen for font loading events
      if (document.fonts.addEventListener) {
        document.fonts.addEventListener('loadingdone', checkFont)
      }
    } else {
      // Fallback: add class after a short delay
      setTimeout(() => {
        document.documentElement.classList.add('fonts-loaded')
      }, 100)
    }
  }, [])

  return null
}

