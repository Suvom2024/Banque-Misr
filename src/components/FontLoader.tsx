'use client'

// FontLoader component - Material Symbols font is already loaded in layout.tsx
// This component is kept for potential future font loading optimizations
// but currently does nothing to avoid redundant loading
export function FontLoader() {
  // Material Symbols font is already loaded via <link> tag in layout.tsx
  // No need to duplicate the loading logic here
  return null
}

