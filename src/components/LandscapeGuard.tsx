import { useEffect, useState, type ReactNode } from 'react'
import BrandLogo from './BrandLogo'

type LandscapeGuardProps = {
  children: ReactNode
  onPortraitChange: (portrait: boolean) => void
}

function isPortraitViewport() {
  const width = window.visualViewport?.width ?? window.innerWidth
  const height = window.visualViewport?.height ?? window.innerHeight
  return height > width
}

export default function LandscapeGuard({
  children,
  onPortraitChange,
}: LandscapeGuardProps) {
  const [portrait, setPortrait] = useState(isPortraitViewport)

  useEffect(() => {
    const update = () => {
      const next = isPortraitViewport()
      setPortrait(next)
      onPortraitChange(next)
    }

    update()
    window.addEventListener('resize', update)
    window.addEventListener('orientationchange', update)
    window.addEventListener('fullscreenchange', update)
    window.addEventListener('webkitfullscreenchange', update)
    window.visualViewport?.addEventListener('resize', update)
    const media = window.matchMedia('(orientation: portrait)')
    media.addEventListener('change', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      window.removeEventListener('fullscreenchange', update)
      window.removeEventListener('webkitfullscreenchange', update)
      window.visualViewport?.removeEventListener('resize', update)
      media.removeEventListener('change', update)
    }
  }, [onPortraitChange])

  return (
    <>
      {children}
      {portrait && (
        <div className="orientation-overlay" role="alertdialog" aria-live="assertive">
          <BrandLogo className="orientation-logo" />
          <svg className="orientation-icon" viewBox="0 0 64 64" aria-hidden="true">
            <rect x="18" y="8" width="28" height="48" rx="6" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="M40 54h8a6 6 0 0 0 6-6V22" fill="none" stroke="currentColor" strokeWidth="2.2" />
            <path d="M48 16l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <p className="orientation-text">Rotate your device to continue</p>
        </div>
      )}
    </>
  )
}
