import * as THREE from 'three'
import type { RoomId } from '../types'

export type RoomHotspot = {
  id: string
  label: string
  targetRoom: RoomId
  u: number
  v: number
}

export const PANORAMA_YAW_OFFSET = 0
export const HOTSPOT_RADIUS = 80
export const DEFAULT_FOV = 70
export const MIN_FOV = 45
export const MAX_FOV = 85
export const MIN_LATITUDE = -85
export const MAX_LATITUDE = 85

export const ROOM_VIEW_CONFIG: Record<
  RoomId,
  { longitude: number; latitude: number; fov: number }
> = {
  lounge: { longitude: 0, latitude: -6, fov: DEFAULT_FOV },
  kitchen: { longitude: 0, latitude: -8, fov: DEFAULT_FOV },
  balcony: { longitude: 0, latitude: -4, fov: DEFAULT_FOV },
  master: { longitude: 0, latitude: -8, fov: DEFAULT_FOV },
  bathroom: { longitude: 0, latitude: -6, fov: DEFAULT_FOV },
}

export const ROOM_HOTSPOTS: Record<RoomId, RoomHotspot[]> = {
  lounge: [
    {
      id: 'lounge-balcony',
      label: 'Balcony',
      targetRoom: 'balcony',
      u: 0.3470695971,
      v: 0.4888888889,
    },
    {
      id: 'lounge-kitchen',
      label: 'Kitchen',
      targetRoom: 'kitchen',
      u: 0.6515567766,
      v: 0.5166666667,
    },
    {
      id: 'lounge-master',
      label: 'Bedroom',
      targetRoom: 'master',
      u: 0.8679029304,
      v: 0.4814814815,
    },
  ],
  kitchen: [
    {
      id: 'kitchen-balcony',
      label: 'Balcony',
      targetRoom: 'balcony',
      u: 0.2165750916,
      v: 0.4814814815,
    },
    {
      id: 'kitchen-master',
      label: 'Bedroom',
      targetRoom: 'master',
      u: 0.7561813187,
      v: 0.4935185185,
    },
    {
      id: 'kitchen-lounge',
      label: 'Living Room',
      targetRoom: 'lounge',
      u: 0.9127747253,
      v: 0.5666666667,
    },
  ],
  balcony: [
    {
      id: 'balcony-lounge',
      label: 'Living Room',
      targetRoom: 'lounge',
      u: 0.5002289377,
      v: 0.5,
    },
  ],
  master: [
    {
      id: 'master-lounge',
      label: 'Living Room',
      targetRoom: 'lounge',
      u: 0.4603937729,
      v: 0.4898148148,
    },
    {
      id: 'master-bathroom',
      label: 'Bathroom',
      targetRoom: 'bathroom',
      u: 0.7387820513,
      v: 0.4740740741,
    },
  ],
  bathroom: [
    {
      id: 'bathroom-master',
      label: 'Bedroom',
      targetRoom: 'master',
      u: 0.2170631299,
      v: 0.5138888889,
    },
  ],
}

export function equirectToWorld(
  u: number,
  v: number,
  radius = HOTSPOT_RADIUS,
  yawOffset = PANORAMA_YAW_OFFSET,
) {
  const lon = u * 360 - 180 + yawOffset
  const lat = 90 - v * 180
  const lonRad = THREE.MathUtils.degToRad(lon)
  const latRad = THREE.MathUtils.degToRad(lat)
  return new THREE.Vector3(
    radius * Math.cos(latRad) * Math.sin(lonRad),
    radius * Math.sin(latRad),
    radius * Math.cos(latRad) * Math.cos(lonRad),
  )
}
