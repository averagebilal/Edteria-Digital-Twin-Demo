import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'
import * as THREE from 'three'
import { ROOM_ASSETS } from '../assets'
import {
  DEFAULT_FOV,
  lonLatToSphere,
  MAX_FOV,
  MAX_LATITUDE,
  MIN_FOV,
  MIN_LATITUDE,
  ROOM_HOTSPOTS,
  ROOM_VIEW_CONFIG,
  uvToSphere,
} from '../data/walkthrough360'
import type { RoomId } from '../types'

type WalkthroughScreenProps = {
  currentRoom: RoomId
  onNavigate: (room: RoomId) => void
  onExit: () => void
  audioControl?: ReactNode
}

type HotspotScreen = {
  id: string
  x: number
  y: number
  visible: boolean
}

const DRAG_THRESHOLD = 6
const LOOK_SENSITIVITY = 0.18
const CROSSFADE_MS = 400
const HINT_MS = 2600
const HOTSPOT_FRONT_DOT = 0.12

let dragHintShown = false

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value))
}

function isUiControl(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest('.walkthrough-topbar'))
}

function lookTarget(longitude: number, latitude: number) {
  return lonLatToSphere(longitude, latitude, 1)
}

export default function WalkthroughScreen({
  currentRoom,
  onNavigate,
  onExit,
  audioControl,
}: WalkthroughScreenProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null)
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null)
  const meshRef = useRef<THREE.Mesh<THREE.SphereGeometry, THREE.MeshBasicMaterial> | null>(null)
  const loaderRef = useRef(new THREE.TextureLoader())
  const texturesRef = useRef(new Map<string, THREE.Texture>())
  const loadingUrlsRef = useRef(new Map<string, Promise<THREE.Texture>>())
  const longitudeRef = useRef(ROOM_VIEW_CONFIG[currentRoom].longitude)
  const latitudeRef = useRef(ROOM_VIEW_CONFIG[currentRoom].latitude)
  const fovRef = useRef(ROOM_VIEW_CONFIG[currentRoom].fov)
  const visibleRoomRef = useRef<RoomId>(currentRoom)
  const projectVecRef = useRef(new THREE.Vector3())
  const cameraDirRef = useRef(new THREE.Vector3())
  const dragRef = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    originLon: 0,
    originLat: 0,
    moved: false,
  })
  const hotspotMovedRef = useRef(false)

  const [viewerReady, setViewerReady] = useState(false)
  const [visibleRoom, setVisibleRoom] = useState(currentRoom)
  const [dragging, setDragging] = useState(false)
  const [fading, setFading] = useState(true)
  const [loading, setLoading] = useState(true)
  const [showHint, setShowHint] = useState(!dragHintShown)
  const [hotspotScreens, setHotspotScreens] = useState<HotspotScreen[]>([])

  const applyLook = useCallback(() => {
    const camera = cameraRef.current
    if (!camera) return
    camera.fov = fovRef.current
    camera.updateProjectionMatrix()
    camera.position.set(0, 0, 0)
    camera.lookAt(lookTarget(longitudeRef.current, latitudeRef.current))
  }, [])

  const applyRoomView = useCallback(
    (room: RoomId) => {
      const config = ROOM_VIEW_CONFIG[room]
      longitudeRef.current = config.longitude
      latitudeRef.current = config.latitude
      fovRef.current = config.fov
      applyLook()
    },
    [applyLook],
  )

  const projectHotspots = useCallback((room: RoomId) => {
    const camera = cameraRef.current
    const viewport = viewportRef.current
    if (!camera || !viewport) return

    const width = viewport.clientWidth
    const height = viewport.clientHeight
    if (width < 8 || height < 8) return

    camera.getWorldDirection(cameraDirRef.current)
    const next = ROOM_HOTSPOTS[room].map((hotspot) => {
      const position = uvToSphere(hotspot.u, hotspot.v)
      const facing = projectVecRef.current.copy(position).normalize().dot(cameraDirRef.current)
      const projected = position.project(camera)
      return {
        id: hotspot.id,
        x: (projected.x * 0.5 + 0.5) * width,
        y: (-projected.y * 0.5 + 0.5) * height,
        visible: facing > HOTSPOT_FRONT_DOT && projected.z > -1 && projected.z < 1,
      }
    })

    setHotspotScreens((prev) => {
      if (
        prev.length === next.length &&
        prev.every(
          (item, index) =>
            item.id === next[index].id &&
            item.visible === next[index].visible &&
            Math.abs(item.x - next[index].x) < 0.6 &&
            Math.abs(item.y - next[index].y) < 0.6,
        )
      ) {
        return prev
      }
      return next
    })
  }, [])

  const loadTexture = useCallback((url: string) => {
    const cached = texturesRef.current.get(url)
    if (cached) return Promise.resolve(cached)

    const pending = loadingUrlsRef.current.get(url)
    if (pending) return pending

    const promise = new Promise<THREE.Texture>((resolve, reject) => {
      loaderRef.current.load(
        url,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace
          texture.anisotropy = rendererRef.current?.capabilities.getMaxAnisotropy() ?? 8
          texture.generateMipmaps = true
          texture.minFilter = THREE.LinearMipmapLinearFilter
          texture.magFilter = THREE.LinearFilter
          texturesRef.current.set(url, texture)
          loadingUrlsRef.current.delete(url)
          resolve(texture)
        },
        undefined,
        () => {
          loadingUrlsRef.current.delete(url)
          reject(new Error(`Failed to load panorama ${url}`))
        },
      )
    })
    loadingUrlsRef.current.set(url, promise)
    return promise
  }, [])

  const assignTexture = useCallback((texture: THREE.Texture) => {
    const mesh = meshRef.current
    if (!mesh) return
    mesh.material.map = texture
    mesh.material.needsUpdate = true
  }, [])

  const resizeRenderer = useCallback(() => {
    const viewport = viewportRef.current
    const renderer = rendererRef.current
    const camera = cameraRef.current
    if (!viewport || !renderer || !camera) return
    const width = viewport.clientWidth || window.innerWidth
    const height = viewport.clientHeight || window.innerHeight
    if (width < 8 || height < 8) return
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
    renderer.setSize(width, height, false)
  }, [])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color(0x09090b)
    const camera = new THREE.PerspectiveCamera(DEFAULT_FOV, 1, 0.1, 200)
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    })
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.setClearColor(0x09090b, 1)
    renderer.domElement.className = 'pano-canvas'
    viewport.insertBefore(renderer.domElement, viewport.firstChild)

    const geometry = new THREE.SphereGeometry(100, 96, 64)
    geometry.scale(-1, 1, 1)
    const material = new THREE.MeshBasicMaterial()
    const mesh = new THREE.Mesh(geometry, material)
    scene.add(mesh)

    cameraRef.current = camera
    rendererRef.current = renderer
    meshRef.current = mesh
    setViewerReady(true)

    resizeRenderer()
    applyLook()

    let frame = 0
    const tick = () => {
      frame = window.requestAnimationFrame(tick)
      applyLook()
      renderer.render(scene, camera)
      projectHotspots(visibleRoomRef.current)
    }
    frame = window.requestAnimationFrame(tick)

    const observer = new ResizeObserver(resizeRenderer)
    observer.observe(viewport)
    window.addEventListener('orientationchange', resizeRenderer)
    window.visualViewport?.addEventListener('resize', resizeRenderer)

    return () => {
      setViewerReady(false)
      window.cancelAnimationFrame(frame)
      observer.disconnect()
      window.removeEventListener('orientationchange', resizeRenderer)
      window.visualViewport?.removeEventListener('resize', resizeRenderer)
      geometry.dispose()
      material.dispose()
      for (const texture of texturesRef.current.values()) texture.dispose()
      texturesRef.current.clear()
      loadingUrlsRef.current.clear()
      renderer.dispose()
      renderer.domElement.remove()
      cameraRef.current = null
      rendererRef.current = null
      meshRef.current = null
    }
  }, [applyLook, projectHotspots, resizeRenderer])

  useEffect(() => {
    visibleRoomRef.current = visibleRoom
  }, [visibleRoom])

  useEffect(() => {
    if (!viewerReady) return
    let cancelled = false
    const destination = currentRoom
    const url = ROOM_ASSETS[destination].src
    const hadTexture = Boolean(meshRef.current?.material.map)
    setLoading(true)

    void loadTexture(url)
      .then(async (texture) => {
        if (cancelled) return
        if (hadTexture) {
          setFading(true)
          await new Promise((resolve) => window.setTimeout(resolve, CROSSFADE_MS / 2))
          if (cancelled) return
        }
        assignTexture(texture)
        setVisibleRoom(destination)
        visibleRoomRef.current = destination
        applyRoomView(destination)
        requestAnimationFrame(() => {
          if (cancelled) return
          setFading(false)
          setLoading(false)
        })
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })

    for (const hotspot of ROOM_HOTSPOTS[destination]) {
      void loadTexture(ROOM_ASSETS[hotspot.targetRoom].src)
    }

    return () => {
      cancelled = true
    }
  }, [applyRoomView, assignTexture, currentRoom, loadTexture, viewerReady])

  useEffect(() => {
    if (!showHint) return
    dragHintShown = true
    const timer = window.setTimeout(() => setShowHint(false), HINT_MS)
    return () => window.clearTimeout(timer)
  }, [showHint])

  const onPointerMove = useCallback((event: PointerEvent | ReactPointerEvent) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return
    const dx = event.clientX - dragRef.current.startX
    const dy = event.clientY - dragRef.current.startY
    if (Math.hypot(dx, dy) > DRAG_THRESHOLD) {
      dragRef.current.moved = true
      hotspotMovedRef.current = true
    }
    longitudeRef.current = dragRef.current.originLon - dx * LOOK_SENSITIVITY
    latitudeRef.current = clamp(
      dragRef.current.originLat + dy * LOOK_SENSITIVITY,
      MIN_LATITUDE,
      MAX_LATITUDE,
    )
  }, [])

  const endDrag = useCallback((event: PointerEvent | ReactPointerEvent) => {
    if (!dragRef.current.active || dragRef.current.pointerId !== event.pointerId) return
    dragRef.current.active = false
    setDragging(false)
    window.removeEventListener('pointermove', onPointerMove)
    window.removeEventListener('pointerup', endDrag)
    window.removeEventListener('pointercancel', endDrag)
  }, [onPointerMove])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return
    if (isUiControl(event.target)) return
    hotspotMovedRef.current = false
    dragRef.current = {
      active: true,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originLon: longitudeRef.current,
      originLat: latitudeRef.current,
      moved: false,
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
      const direction = event.deltaY > 0 ? 1 : -1
      fovRef.current = clamp(fovRef.current + direction * 2.2, MIN_FOV, MAX_FOV)
    }

    viewport.addEventListener('wheel', onWheel, { passive: false })
    return () => viewport.removeEventListener('wheel', onWheel)
  }, [])

  const resetView = () => {
    applyRoomView(visibleRoom)
  }

  const handleHotspotClick = (destination: RoomId) => {
    if (fading || hotspotMovedRef.current || dragRef.current.moved) return
    onNavigate(destination)
  }

  const hotspots = ROOM_HOTSPOTS[visibleRoom]

  return (
    <div className="scene walkthrough">
      <div
        ref={viewportRef}
        className={`pano-viewport ${dragging ? 'is-dragging' : ''}`}
        onPointerDown={onPointerDown}
        onContextMenu={(event) => event.preventDefault()}
      >
        <div className={`pano-hotspots ${fading ? 'is-hidden' : ''}`}>
          {hotspots.map((hotspot) => {
            const screen = hotspotScreens.find((item) => item.id === hotspot.id)
            const destination = hotspot.targetRoom
            const visible = Boolean(screen?.visible) && !fading
            return (
              <button
                key={hotspot.id}
                type="button"
                className="room-pointer"
                style={{
                  left: `${screen?.x ?? 0}px`,
                  top: `${screen?.y ?? 0}px`,
                  opacity: visible ? 1 : 0,
                  pointerEvents: visible ? 'auto' : 'none',
                }}
                tabIndex={visible ? 0 : -1}
                aria-hidden={!visible}
                onClick={(event) => {
                  event.stopPropagation()
                  handleHotspotClick(destination)
                }}
                disabled={fading || loading}
              >
                <span
                  className="room-pointer-thumb"
                  style={{ backgroundImage: `url(${ROOM_ASSETS[destination].icon})` }}
                />
                <span className="room-pointer-label">
                  {hotspot.label}
                </span>
              </button>
            )
          })}
        </div>
        <div className={`pano-veil ${fading ? 'is-on' : ''}`} />
      </div>

      {showHint && (
        <div className="drag-hint" aria-hidden="true">
          <span className="drag-hint-icon" />
          Drag to look around
        </div>
      )}

      {loading && (
        <div className="pano-loading" aria-live="polite">
          Loading
        </div>
      )}

      <div className="walkthrough-topbar">
        <button type="button" className="exit-walkthrough" onClick={onExit}>
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
