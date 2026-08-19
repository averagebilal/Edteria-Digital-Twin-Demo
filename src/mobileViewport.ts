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
  const scrollMode = document.documentElement.classList.contains('chrome-scroll')
  root.style.width = '100%'
  root.style.height = `${Math.max(height, 1)}px`
  if (scrollMode) {
    root.style.position = 'sticky'
    root.style.top = '0px'
    root.style.left = '0px'
  } else {
    root.style.position = 'fixed'
    root.style.top = '0px'
    root.style.left = '0px'
  }
  document.documentElement.style.setProperty('--app-width', `${width}px`)
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}

export function subscribeVisualViewport(onChange: () => void) {
  applyVisualViewportToRoot()
  const visual = window.visualViewport
  visual?.addEventListener('resize', onChange)
  visual?.addEventListener('scroll', onChange)
  window.addEventListener('resize', onChange)
  window.addEventListener('orientationchange', onChange)
  window.addEventListener('scroll', onChange, { passive: true })
  return () => {
    visual?.removeEventListener('resize', onChange)
    visual?.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
    window.removeEventListener('scroll', onChange)
  }
}

export async function requestAppFullscreen() {
  const node = document.documentElement as HTMLElement & {
    webkitRequestFullscreen?: () => Promise<void> | void
  }
  if (document.fullscreenElement) return
  try {
    await node.requestFullscreen?.({ navigationUI: 'hide' })
  } catch {
    try {
      await node.webkitRequestFullscreen?.()
    } catch {
      // Fullscreen is best-effort on iOS Safari.
    }
  }
}

export function enableSafariChromeScroll() {
  document.documentElement.classList.add('chrome-scroll')
  applyVisualViewportToRoot()
}

export function expandMobileChrome() {
  if (isTouchUI()) enableSafariChromeScroll()
  void requestAppFullscreen()
  applyVisualViewportToRoot()
}
