'use client'

import { useState, useEffect } from 'react'

interface CosmicBadgeProps {
  bucketSlug: string
}

export default function CosmicBadge({ bucketSlug }: CosmicBadgeProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const isDismissed = localStorage.getItem('cosmic-badge-dismissed')
    if (!isDismissed) {
      const timer = setTimeout(() => setIsVisible(true), 1000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('cosmic-badge-dismissed', 'true')
  }

  if (!isVisible) return null

  return (
    <a
      href={`https://www.cosmicjs.com?utm_source=bucket_${bucketSlug}&utm_medium=referral&utm_campaign=app_badge&utm_content=built_with_cosmic`}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        color: '#e2e8f0',
        textDecoration: 'none',
        fontSize: '14px',
        fontWeight: '500',
        backgroundColor: '#1a1d26',
        border: '1px solid #2e3350',
        padding: '12px 16px',
        width: '180px',
        borderRadius: '8px',
        zIndex: 50,
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.5)',
        transition: 'background-color 0.2s ease',
      }}
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#22263a')}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#1a1d26')}
    >
      <button
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          handleDismiss()
        }}
        style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          width: '24px',
          height: '24px',
          background: '#2e3350',
          border: 'none',
          borderRadius: '50%',
          color: '#e2e8f0',
          fontSize: '14px',
          fontWeight: 'bold',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10,
        }}
        aria-label="Dismiss badge"
      >
        ×
      </button>
      <img
        src="https://cdn.cosmicjs.com/b67de7d0-c810-11ed-b01d-23d7b265c299-logo508x500.svg"
        alt="Cosmic Logo"
        style={{ width: '20px', height: '20px' }}
      />
      Built with Cosmic
    </a>
  )
}