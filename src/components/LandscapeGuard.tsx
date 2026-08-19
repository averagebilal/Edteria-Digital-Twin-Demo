import { useEffect, useState, type ReactNode } from 'react'
import { ASSETS } from '../assets'

type LandscapeGuardProps = {
  children: ReactNode
  onPortraitChange: (portrait: boolean) => void
}

function isPortraitViewport() {
  return window.innerHeight > window.innerWidth
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
    const media = window.matchMedia('(orientation: portrait)')
    media.addEventListener('change', update)

    return () => {
      window.removeEventListener('resize', update)
      window.removeEventListener('orientationchange', update)
      media.removeEventListener('change', update)
    }
  }, [onPortraitChange])

  return (
    <>
      {children}
      {portrait && (
        <div className="orientation-overlay" role="alertdialog" aria-live="assertive">
          <img
            className="orientation-logo"
            src={ASSETS.logo}
            alt="ESTERIA"
            draggable={false}
          />
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
