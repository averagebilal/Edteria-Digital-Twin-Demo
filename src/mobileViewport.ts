const ROOT_ID = 'root'
const SCROLL_ROOM = 28

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

let chromeBaseline = 0
let clampingScroll = false

export function applyVisualViewportToRoot() {
  const root = document.getElementById(ROOT_ID)
  if (!root) return
  const { width, height } = getViewportSize()
  root.style.position = 'fixed'
  root.style.top = '0px'
  root.style.left = '0px'
  root.style.width = '100%'
  root.style.height = `${Math.max(height, 1)}px`
  document.documentElement.style.setProperty('--app-width', `${width}px`)
  document.documentElement.style.setProperty('--app-height', `${height}px`)
}

function clampChromeScroll() {
  if (clampingScroll) return
  if (!document.documentElement.classList.contains('chrome-scroll')) return
  if (document.documentElement.classList.contains('chrome-locked')) {
    if (window.scrollY !== 0) {
      clampingScroll = true
      window.scrollTo(0, 0)
      clampingScroll = false
    }
    return
  }
  if (window.scrollY > SCROLL_ROOM) {
    clampingScroll = true
    window.scrollTo(0, SCROLL_ROOM)
    clampingScroll = false
  }
}

function maybeLockAfterChromeHide() {
  if (!document.documentElement.classList.contains('chrome-scroll')) return
  if (document.documentElement.classList.contains('chrome-locked')) return
  const { height } = getViewportSize()
  if (chromeBaseline > 0 && height >= chromeBaseline + 20) {
    document.documentElement.classList.add('chrome-locked')
    clampingScroll = true
    window.scrollTo(0, 0)
    clampingScroll = false
  }
}

function onViewportChange() {
  applyVisualViewportToRoot()
  maybeLockAfterChromeHide()
  clampChromeScroll()
}

export function subscribeVisualViewport(onChange: () => void) {
  const handle = () => {
    onViewportChange()
    onChange()
  }
  const handleOrientation = () => {
    chromeBaseline = 0
    document.documentElement.classList.remove('chrome-locked')
    handle()
    chromeBaseline = getViewportSize().height
  }
  applyVisualViewportToRoot()
  const visual = window.visualViewport
  visual?.addEventListener('resize', handle)
  visual?.addEventListener('scroll', handle)
  window.addEventListener('resize', handle)
  window.addEventListener('orientationchange', handleOrientation)
  window.addEventListener('scroll', handle, { passive: true })
  return () => {
    visual?.removeEventListener('resize', handle)
    visual?.removeEventListener('scroll', handle)
    window.removeEventListener('resize', handle)
    window.removeEventListener('orientationchange', handleOrientation)
    window.removeEventListener('scroll', handle)
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
  document.documentElement.classList.remove('chrome-locked')
  chromeBaseline = getViewportSize().height
  applyVisualViewportToRoot()
}

export function expandMobileChrome() {
  if (isTouchUI()) enableSafariChromeScroll()
  void requestAppFullscreen()
  applyVisualViewportToRoot()
}
