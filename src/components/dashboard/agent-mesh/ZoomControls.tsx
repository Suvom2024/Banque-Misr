'use client'

import { useState } from 'react'

interface ZoomControlsProps {
  onZoomIn?: () => void
  onZoomOut?: () => void
  onFitToScreen?: () => void
}

export function ZoomControls({ onZoomIn, onZoomOut, onFitToScreen }: ZoomControlsProps) {
  const [zoomLevel, setZoomLevel] = useState(100)

  const handleZoomIn = () => {
    const newZoom = Math.min(zoomLevel + 10, 200)
    setZoomLevel(newZoom)
    onZoomIn?.()
  }

  const handleZoomOut = () => {
    const newZoom = Math.max(zoomLevel - 10, 50)
    setZoomLevel(newZoom)
    onZoomOut?.()
  }

  return (
    <div className="absolute bottom-6 left-6 z-40 flex gap-2">
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-1 flex items-center">
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-bm-maroon transition-colors"
          title="Zoom Out"
        >
          <span className="material-symbols-outlined text-xl">remove</span>
        </button>
        <span className="text-xs font-bold text-slate-600 w-12 text-center select-none">{zoomLevel}%</span>
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-bm-maroon transition-colors"
          title="Zoom In"
        >
          <span className="material-symbols-outlined text-xl">add</span>
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-md border border-slate-200 p-1 flex items-center">
        <button
          onClick={onFitToScreen}
          className="p-2 hover:bg-slate-50 rounded-md text-slate-500 hover:text-bm-maroon transition-colors"
          title="Fit to Screen"
        >
          <span className="material-symbols-outlined text-xl">center_focus_strong</span>
        </button>
      </div>
    </div>
  )
}

