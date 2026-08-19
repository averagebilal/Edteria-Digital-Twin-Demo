import type { RoomId } from './types'

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080

export const SCENE_CONFIG = {
  opening: { focalX: 0.5, focalY: 0.5 },
  masterplan: { focalX: 0.5, focalY: 0.5 },
  building: { focalX: 0.5, focalY: 0.5 },
} as const

export const ROOM_VIEW_CONFIG: Record<
  RoomId,
  { initialX: number; initialY: number; initialZoom: number }
> = {
  lounge: { initialX: 0, initialY: 0, initialZoom: 1.28 },
  kitchen: { initialX: 0, initialY: 0, initialZoom: 1.28 },
  balcony: { initialX: 0, initialY: 0, initialZoom: 1.28 },
  master: { initialX: 0, initialY: 0, initialZoom: 1.28 },
  bathroom: { initialX: 0, initialY: 0, initialZoom: 1.28 },
}

export const ASSETS = {
  logo: '/assets/branding/esteria-logo.svg',
  masterplan: '/assets/masterplan/masterplan.webp',
  building: '/assets/building/building-front.webp',
  audio: '/assets/audio/ambient.mp3',
} as const

export const ROOM_ASSETS: Record<RoomId, { src: string; label: string }> = {
  lounge: { src: '/assets/walkthrough/lounge.webp', label: 'Lounge' },
  balcony: { src: '/assets/walkthrough/balcony.webp', label: 'Balcony' },
  kitchen: { src: '/assets/walkthrough/kitchen.webp', label: 'Kitchen' },
  master: { src: '/assets/walkthrough/master-bedroom.webp', label: 'Master' },
  bathroom: { src: '/assets/walkthrough/bathroom.webp', label: 'Bathroom' },
}

export const WALKTHROUGH_ROOMS: RoomId[] = [
  'lounge',
  'balcony',
  'kitchen',
  'master',
  'bathroom',
]

export const HIGHLIGHT_COLOR = '#F6EA8C'
export const DEFAULT_OPACITY = 0.24
export const HOVER_OPACITY = 0.74
export const MASTERPLAN_DEFAULT_OPACITY = 0

export const APARTMENT_INFO = {
  title: 'Penthouse',
  area: '1850 m²',
  areaLabel: 'Apartments Area',
  floors: '2',
  rooms: '4',
  location: '7',
}

export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve()
    img.src = src
  })
}

export function preloadImages(srcs: string[]): Promise<void[]> {
  return Promise.all(srcs.map(preloadImage))
}
