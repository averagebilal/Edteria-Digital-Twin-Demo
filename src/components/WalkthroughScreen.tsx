import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { preloadImage, ROOM_ASSETS, ROOM_VIEW_CONFIG } from '../assets'
import interactionMap from '../data/esteriaInteractionMap.json'
import { IS_IOS } from '../mobileViewport'
import type { RoomId } from '../types'

type WalkthroughScreenProps = {
  currentRoom: RoomId
  onNavigate: (room: RoomId) => void
  onExit: () => void
  audioControl?: ReactNode
}

const DRAG_THRESHOLD = 7
const SENSITIVITY = 0.92
const MIN_ZOOM = 1
const MAX_ZOOM = 1.35
const INERTIA_DECAY = 0.92
const INERTIA_MIN = 0.18
const PHOTO_THUMBS = !IS_IOS

let dragHintShown = false

function clamp(value: number, min: number, max: number) {
  if (min > max) return (min + max) / 2
  return Math.min(max, Math.max(min, value))
}

function isHotspotTarget(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('.room-pointer'))
}

export default function WalkthroughScreen({
  currentRoom,
  onNavigate,
  onExit,
  audioControl,
}: WalkthroughScreenProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const coverRef = useRef(1)
  const panRef = useRef({ x: 0, y: 0, zoom: 1.28 })
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originX: 0,
    originY: 0,
    moved: false,
    lastX: 0,
    lastY: 0,
    lastT: 0,
    vx: 0,
    vy: 0,
  })
  const inertiaRef = useRef(0)
  const [visibleRoom, setVisibleRoom] = useState(currentRoom)
  const [fading, setFading] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [showHint, setShowHint] = useState(!dragHintShown)

  const points = interactionMap.walkthrough[visibleRoom].points

  const applyTransform = useCallback(() => {
    const canvas = canvasRef.current
    const viewport = viewportRef.current
    if (!canvas || !viewport) return
    if (viewport.clientWidth < 8 || viewport.clientHeight < 8) return
    const [width, height] = interactionMap.walkthrough[visibleRoom].referenceSize
    const { x, y, zoom } = panRef.current
    const cover = coverRef.current
    canvas.style.width = `${width * cover}px`
    canvas.style.height = `${height * cover}px`
    canvas.style.transform = `translate3d(${x}px, ${y}px, 0) scale(${zoom})`
    canvas.style.setProperty('--scene-scale', String(zoom))
  }, [visibleRoom])

  const clampPan = useCallback((room: RoomId = visibleRoom) => {
    const viewport = viewportRef.current
    if (!viewport || viewport.clientWidth < 8 || viewport.clientHeight < 8) return
    const [width, height] = interactionMap.walkthrough[room].referenceSize
    const zoom = panRef.current.zoom
    const displayedWidth = width * coverRef.current * zoom
    const displayedHeight = height * coverRef.current * zoom
    panRef.current.x = clamp(
      panRef.current.x,
      viewport.clientWidth - displayedWidth,
      0,
    )
    panRef.current.y = clamp(
      panRef.current.y,
      viewport.clientHeight - displayedHeight,
      0,
    )
  }, [visibleRoom])

  const applyRoomView = useCallback(
    (room: RoomId) => {
      const viewport = viewportRef.current
      if (!viewport || viewport.clientWidth < 8 || viewport.clientHeight < 8) return
      const [width, height] = interactionMap.walkthrough[room].referenceSize
      const config = ROOM_VIEW_CONFIG[room]
      const cover = Math.max(
        viewport.clientWidth / width,
        viewport.clientHeight / height,
      )
      if (!Number.isFinite(cover) || cover <= 0) return
      coverRef.current = cover
      panRef.current.zoom = config.initialZoom
      const scale = cover * config.initialZoom
      panRef.current.x =
        (viewport.clientWidth - width * scale) / 2 + config.initialX
      panRef.current.y =
        (viewport.clientHeight - height * scale) / 2 + config.initialY
      clampPan(room)
      applyTransform()
    },
    [applyTransform, clampPan],
  )

  const stopInertia = useCallback(() => {
    if (inertiaRef.current) {
      cancelAnimationFrame(inertiaRef.current)
      inertiaRef.current = 0
    }
  }, [])

  useLayoutEffect(() => {
    applyRoomView(visibleRoom)
  }, [applyRoomView, visibleRoom])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const onResize = () => {
      if (viewport.clientWidth < 8 || viewport.clientHeight < 8) return
      const [width, height] = interactionMap.walkthrough[visibleRoom].referenceSize
      const nextCover = Math.max(
        viewport.clientWidth / width,
        viewport.clientHeight / height,
      )
      if (!Number.isFinite(nextCover) || nextCover <= 0) return
      const oldScale = coverRef.current * panRef.current.zoom
      if (!Number.isFinite(oldScale) || oldScale <= 0) {
        coverRef.current = nextCover
        applyRoomView(visibleRoom)
        return
      }
      coverRef.current = nextCover
      const newScale = nextCover * panRef.current.zoom
      const centerX = viewport.clientWidth / 2
      const centerY = viewport.clientHeight / 2
      const imageX = (centerX - panRef.current.x) / oldScale
      const imageY = (centerY - panRef.current.y) / oldScale
      panRef.current.x = centerX - imageX * newScale
      panRef.current.y = centerY - imageY * newScale
      clampPan()
      applyTransform()
    }

    const observer = new ResizeObserver(onResize)
    observer.observe(viewport)
    window.addEventListener('orientationchange', onResize)
    window.visualViewport?.addEventListener('resize', onResize)
    return () => {
      observer.disconnect()
      window.removeEventListener('orientationchange', onResize)
      window.visualViewport?.removeEventListener('resize', onResize)
    }
  }, [applyRoomView, applyTransform, clampPan, visibleRoom])

  useEffect(() => {
    if (currentRoom === visibleRoom) return
    let cancelled = false
    void preloadImage(ROOM_ASSETS[currentRoom].src).then(() => {
      if (cancelled) return
      setFading(true)
      window.setTimeout(() => {
        if (cancelled) return
        setVisibleRoom(currentRoom)
        requestAnimationFrame(() => setFading(false))
      }, 280)
    })
    return () => {
      cancelled = true
    }
  }, [currentRoom, visibleRoom])

  useEffect(() => {
    if (!showHint) return
    dragHintShown = true
    const timer = window.setTimeout(() => setShowHint(false), 2600)
    return () => window.clearTimeout(timer)
  }, [showHint])

  const startInertia = useCallback(() => {
    stopInertia()
    const step = () => {
      panRef.current.x += dragRef.current.vx
      panRef.current.y += dragRef.current.vy
      dragRef.current.vx *= INERTIA_DECAY
      dragRef.current.vy *= INERTIA_DECAY
      clampPan()
      applyTransform()
      if (
        Math.abs(dragRef.current.vx) > INERTIA_MIN ||
        Math.abs(dragRef.current.vy) > INERTIA_MIN
      ) {
        inertiaRef.current = requestAnimationFrame(step)
      } else {
        inertiaRef.current = 0
      }
    }
    inertiaRef.current = requestAnimationFrame(step)
  }, [applyTransform, clampPan, stopInertia])

  const onPointerMove = useCallback((event: PointerEvent | globalThis.PointerEvent) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return
    const dx = (event.clientX - dragRef.current.startX) * SENSITIVITY
    const dy = (event.clientY - dragRef.current.startY) * SENSITIVITY
    if (
      Math.hypot(
        event.clientX - dragRef.current.startX,
        event.clientY - dragRef.current.startY,
      ) > DRAG_THRESHOLD
    ) {
      dragRef.current.moved = true
    }
    panRef.current.x = dragRef.current.originX + dx
    panRef.current.y = dragRef.current.originY + dy
    const now = performance.now()
    const dt = Math.max(now - dragRef.current.lastT, 1)
    dragRef.current.vx = ((event.clientX - dragRef.current.lastX) * SENSITIVITY) / dt * 16
    dragRef.current.vy = ((event.clientY - dragRef.current.lastY) * SENSITIVITY) / dt * 16
    dragRef.current.lastX = event.clientX
    dragRef.current.lastY = event.clientY
    dragRef.current.lastT = now
    clampPan()
    applyTransform()
  }, [applyTransform, clampPan])

  const endDrag = useCallback((event: PointerEvent | globalThis.PointerEvent) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return
    dragRef.current.active = false
    setDragging(false)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
    if (
      dragRef.current.moved &&
      (Math.abs(dragRef.current.vx) > INERTIA_MIN ||
        Math.abs(dragRef.current.vy) > INERTIA_MIN)
    ) {
      startInertia()
    }
  }, [onPointerMove, startInertia])

  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (isHotspotTarget(event.target)) return
    stopInertia()
    const viewport = viewportRef.current
    if (!viewport) return
    if (event.pointerType === 'mouse') {
      try {
        viewport.setPointerCapture(event.pointerId)
      } catch {
        // iOS / unsupported capture
      }
    }
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: panRef.current.x,
      originY: panRef.current.y,
      moved: false,
      lastX: event.clientX,
      lastY: event.clientY,
      lastT: performance.now(),
      vx: 0,
      vy: 0,
    }
    setDragging(true)
    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', endDrag)
    window.addEventListener('pointercancel', endDrag)
  }

  useEffect(() => {
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', endDrag)
      window.removeEventListener('pointercancel', endDrag)
    }
  }, [endDrag, onPointerMove])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (viewport.clientWidth < 8 || viewport.clientHeight < 8) return
      const oldZoom = panRef.current.zoom
      const nextZoom = clamp(
        oldZoom * (event.deltaY > 0 ? 0.96 : 1.04),
        MIN_ZOOM,
        MAX_ZOOM,
      )
      if (nextZoom === oldZoom) return
      const oldScale = coverRef.current * oldZoom
      const newScale = coverRef.current * nextZoom
      if (oldScale <= 0) return
      const centerX = viewport.clientWidth / 2
      const centerY = viewport.clientHeight / 2
      const imageX = (centerX - panRef.current.x) / oldScale
      const imageY = (centerY - panRef.current.y) / oldScale
      panRef.current.zoom = nextZoom
      panRef.current.x = centerX - imageX * newScale
      panRef.current.y = centerY - imageY * newScale
      clampPan()
      applyTransform()
    }

    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [applyTransform, clampPan])

  const resetView = () => {
    stopInertia()
    applyRoomView(visibleRoom)
  }

  const handleHotspotClick = (destination: RoomId) => {
    if (fading) return
    stopInertia()
    onNavigate(destination)
  }

  return (
    <div className="scene walkthrough">
      <div
        ref={viewportRef}
        className={`panorama-viewport ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
      >
        <div
          ref={canvasRef}
          className={`panorama-canvas ${fading ? 'is-fading' : ''}`}
        >
          <img
            className="panorama-image"
            src={ROOM_ASSETS[visibleRoom].src}
            alt={ROOM_ASSETS[visibleRoom].label}
            draggable={false}
            decoding="async"
            onDragStart={(event) => event.preventDefault()}
          />
          <div className={`walkthrough-points ${fading ? 'is-hidden' : ''}`}>
            {points.map((point) => {
              const destination = point.to as RoomId
              return (
                <button
                  key={`${visibleRoom}-${destination}`}
                  type="button"
                  className="room-pointer"
                  style={{ left: `${point.xPercent}%`, top: `${point.yPercent}%` }}
                  onPointerDown={(event) => event.stopPropagation()}
                  onClick={(event) => {
                    event.stopPropagation()
                    handleHotspotClick(destination)
                  }}
                  disabled={fading}
                >
                  <span
                    className="room-pointer-thumb"
                    style={
                      PHOTO_THUMBS
                        ? { backgroundImage: `url(${ROOM_ASSETS[destination].src})` }
                        : undefined
                    }
                  />
                  <span className="room-pointer-label">
                    {ROOM_ASSETS[destination].label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {showHint && (
        <div className="drag-hint" aria-hidden="true">
          <span className="drag-hint-icon" />
          Drag to look around
        </div>
      )}

      <div className="walkthrough-topbar">
        <button type="button" className="back-control" onClick={onExit}>
          ← Exit Walkthrough
        </button>
        <div className="walkthrough-topbar-right">
          {audioControl}
          <button type="button" className="reset-view" onClick={resetView}>
            Reset View
          </button>
        </div>
      </div>
    </div>
  )
}
