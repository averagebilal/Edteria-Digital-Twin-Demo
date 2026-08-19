import type { RoomId } from './types'
import { ROOM_VIEW_CONFIG as WALKTHROUGH_VIEW_CONFIG } from './data/walkthrough360'

export const DESIGN_WIDTH = 1920
export const DESIGN_HEIGHT = 1080

export const SCENE_CONFIG = {
  opening: { focalX: 0.5, focalY: 0.5 },
  masterplan: { focalX: 0.5, focalY: 0.5 },
  building: { focalX: 0.5, focalY: 0.5 },
} as const

export const ROOM_VIEW_CONFIG = WALKTHROUGH_VIEW_CONFIG

export const ASSETS = {
  logo: '/assets/branding/esteria-logo.svg',
  masterplan: '/assets/masterplan/masterplan.webp',
  building: '/assets/building/building-front.webp',
  audio: '/assets/audio/ambient.mp3',
} as const

export const ROOM_ASSETS: Record<RoomId, { src: string; label: string; icon: string }> = {
  lounge: {
    src: '/assets/walkthrough-360/lounge.jpg',
    label: 'Living Room',
    icon: '/assets/walkthrough/icons/lounge.png',
  },
  balcony: {
    src: '/assets/walkthrough-360/balcony.jpg',
    label: 'Balcony',
    icon: '/assets/walkthrough/icons/balcony.png',
  },
  kitchen: {
    src: '/assets/walkthrough-360/kitchen.png',
    label: 'Kitchen',
    icon: '/assets/walkthrough/icons/kitchen.png',
  },
  master: {
    src: '/assets/walkthrough-360/master.jpg',
    label: 'Bedroom',
    icon: '/assets/walkthrough/icons/master.png',
  },
  bathroom: {
    src: '/assets/walkthrough-360/bathroom.jpg',
    label: 'Bathroom',
    icon: '/assets/walkthrough/icons/bathroom.png',
  },
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
