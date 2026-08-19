const ROOT_ID = 'root'

function isIOSDevice() {
  if (typeof navigator === 'undefined') return false
  return (
    /iP(hone|ad|od)/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  )
}

export const IS_IOS = isIOSDevice()

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
  const { width, height, offsetTop, offsetLeft } = getViewportSize()
  root.style.position = 'fixed'
  root.style.width = `${Math.max(width, 1)}px`
  root.style.height = `${Math.max(height, 1)}px`
  root.style.top = `${offsetTop}px`
  root.style.left = `${offsetLeft}px`
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
  return () => {
    visual?.removeEventListener('resize', onChange)
    visual?.removeEventListener('scroll', onChange)
    window.removeEventListener('resize', onChange)
    window.removeEventListener('orientationchange', onChange)
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

export function expandMobileChrome() {
  void requestAppFullscreen()
  const html = document.documentElement
  const extra = Math.max(80, Math.round(window.innerHeight * 0.12))
  html.classList.add('allow-chrome-collapse')
  html.style.minHeight = `${window.innerHeight + extra}px`
  window.scrollTo(0, extra)
  window.setTimeout(() => {
    applyVisualViewportToRoot()
    html.style.minHeight = ''
    html.classList.remove('allow-chrome-collapse')
    window.scrollTo(0, 0)
    applyVisualViewportToRoot()
  }, 180)
}
