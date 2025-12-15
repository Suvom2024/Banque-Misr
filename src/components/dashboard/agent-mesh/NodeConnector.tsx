'use client'

interface NodeConnectorProps {
  type: 'input' | 'output'
  position: 'top' | 'bottom' | 'left' | 'right'
  isActive?: boolean
  isInConnectionMode?: boolean
  canConnect?: boolean
  onClick?: () => void
  title?: string
}

export function NodeConnector({
  type,
  position,
  isActive = false,
  isInConnectionMode = false,
  canConnect = false,
  onClick,
  title,
}: NodeConnectorProps) {
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'left-1/2 -top-2 -translate-x-1/2'
      case 'bottom':
        return 'left-1/2 -bottom-2 -translate-x-1/2'
      case 'left':
        return 'top-1/2 -left-2 -translate-y-1/2'
      case 'right':
        return 'top-1/2 -right-2 -translate-y-1/2'
      default:
        return ''
    }
  }

  const getConnectorStyle = () => {
    if (isActive) {
      return {
        backgroundColor: '#FFC72C',
        border: '2.5px solid #7A1A25',
        boxShadow: '0 0 0 2px rgba(255, 199, 44, 0.3)',
      }
    }
    if (isInConnectionMode && canConnect) {
      return {
        backgroundColor: '#FFC72C',
        border: '2.5px solid #7A1A25',
        boxShadow: '0 0 0 3px rgba(122, 26, 37, 0.2)',
        animation: 'pulse-gold 1.5s ease-in-out infinite',
      }
    }
    if (isInConnectionMode && type === 'output') {
      return {
        backgroundColor: '#FFC72C',
        border: '2.5px solid #7A1A25',
        boxShadow: '0 0 0 2px rgba(255, 199, 44, 0.3)',
        animation: 'pulse-gold 1.5s ease-in-out infinite',
      }
    }
    return {
      backgroundColor: 'white',
      border: '2.5px solid #CBD5E1',
      boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
    }
  }

  return (
    <div
      className={`node-connector ${getPositionClasses()} ${isActive ? 'active' : ''} ${isInConnectionMode && canConnect ? 'ring-2 ring-bm-maroon' : ''}`}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.()
      }}
      title={title || `${type} connector`}
      style={{
        width: '12px',
        height: '12px',
        borderRadius: '50%',
        position: 'absolute',
        zIndex: 20,
        cursor: isInConnectionMode && canConnect ? 'crosshair' : 'pointer',
        transition: 'all 0.2s',
        ...getConnectorStyle(),
      }}
      onMouseEnter={(e) => {
        if (!isActive && !isInConnectionMode) {
          e.currentTarget.style.borderColor = '#7A1A25'
          e.currentTarget.style.transform = 'scale(1.25)'
        } else if (isInConnectionMode && canConnect) {
          e.currentTarget.style.transform = 'scale(1.3)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive && !isInConnectionMode) {
          e.currentTarget.style.borderColor = '#CBD5E1'
          e.currentTarget.style.transform = 'scale(1)'
        } else if (isInConnectionMode && canConnect) {
          e.currentTarget.style.transform = 'scale(1)'
        }
      }}
    />
  )
}

