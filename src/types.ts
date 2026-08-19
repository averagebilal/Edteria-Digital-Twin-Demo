export type Screen = 'opening' | 'masterplan' | 'building' | 'walkthrough'

export type BuildingMode = 'floor-selection' | 'apartment-selection'

export type FloorId = '01' | '02' | '03' | '04' | '05'

export type RoomId = 'lounge' | 'balcony' | 'kitchen' | 'master' | 'bathroom'

export type WalkthroughPoint = {
  to: RoomId
  xPercent: number
  yPercent: number
}

export type ApartmentPath = {
  id: string
  path: string
}

export type ExperienceState = {
  screen: Screen
  buildingMode: BuildingMode
  hoveredFloor: FloorId | null
  selectedFloor: FloorId | null
  hoveredApartment: string | null
  selectedApartment: string | null
  apartmentModalOpen: boolean
  currentRoom: RoomId
  audioEnabled: boolean
}
