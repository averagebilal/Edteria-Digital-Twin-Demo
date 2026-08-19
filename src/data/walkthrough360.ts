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

function wrapU(u: number) {
  return THREE.MathUtils.euclideanModulo(u + PANORAMA_YAW_OFFSET / 360, 1)
}

/**
 * Convert equirect UVs into a point on the inverted SphereGeometry used
 * by the 360 viewer. This must match Three.js sphere UVs after scale(-1,1,1)
 * so hotspots sit on the same pixels as the reference SVG.
 */
export function uvToSphere(u: number, v: number, radius = HOTSPOT_RADIUS) {
  const phi = wrapU(u) * Math.PI * 2
  const theta = THREE.MathUtils.clamp(v, 0.001, 0.999) * Math.PI
  return new THREE.Vector3(
    radius * Math.cos(phi) * Math.sin(theta),
    radius * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
  )
}

export function lonLatToSphere(
  longitude: number,
  latitude: number,
  radius = 1,
) {
  const u = longitude / 360 + 0.5
  const v = 0.5 - latitude / 180
  return uvToSphere(u, v, radius)
}
