const ROOT_ID = 'root'

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export const IS_IOS = isIOSDevice()

export function isTouchUI() {
  if (typeof window === 'undefined') return false
  return (
    IS_IOS ||
    window.matchMedia('(pointer: coarse)').matches ||
    window.matchMedia('(hover: none)').matches
  )
}

export function getViewportSize() {
  const visual = window.visualViewport
  return {
    width: Math.round(visual?.width ?? window.innerWidth),
    height: Math.round(visual?.height ?? window.innerHeight),
    offsetTop: visual?.offsetTop ?? 0,
    offsetLeft: visual?.offsetLeft ?? 0,
  }
}

export function applyVisualViewportToRoot() {
  const root = document.getElementById(ROOT_ID)
  if (!root) return
  const { width, height } = getViewportSize()
  root.style.position = 'fixed'
  root.style.inset = '0'
  root.style.width = '100vw'
  root.style.height = `${Math.max(height, 1)}px`
  document.documentElement.style.setProperty('--app-width', `${width}px`)
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}

export async function attemptImmersiveMode() {
  const element = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
  }

  try {
    if (document.fullscreenElement) return true

    if (element.requestFullscreen && document.fullscreenEnabled !== false) {
      try {
        await element.requestFullscreen()
        return true
      } catch {
        await element.requestFullscreen({ navigationUI: 'hide' })
        return true
      }
    }

    if (element.webkitRequestFullscreen) {
      await element.webkitRequestFullscreen()
      return true
    }
  } catch {
    // Fullscreen unsupported, rejected, or unavailable.
  }

  return false
}

export function nudgeBrowserChrome() {
  requestAnimationFrame(() => {
    try {
      window.scrollTo({ top: 1, behavior: 'smooth' })
    } catch {
      // Best-effort chrome collapse only.
    }
  })
}

export function subscribeVisualViewport(onChange: () => void) {
  let frame = 0
  const handle = () => {
    applyVisualViewportToRoot()
    if (frame) return
    frame = window.requestAnimationFrame(() => {
      frame = 0
      onChange()
    })
  }

  applyVisualViewportToRoot()
  const visual = window.visualViewport
  visual?.addEventListener('resize', handle)
  visual?.addEventListener('scroll', handle)
  window.addEventListener('resize', handle)
  window.addEventListener('orientationchange', handle)
  window.addEventListener('fullscreenchange', handle)
  window.addEventListener('webkitfullscreenchange', handle)
  return () => {
    visual?.removeEventListener('resize', handle)
    visual?.removeEventListener('scroll', handle)
    window.removeEventListener('resize', handle)
    window.removeEventListener('orientationchange', handle)
    window.removeEventListener('fullscreenchange', handle)
    window.removeEventListener('webkitfullscreenchange', handle)
  }
}
