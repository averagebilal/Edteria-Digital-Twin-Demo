import { useEffect, useRef, useState } from 'react'
import {
  ASSETS,
  DEFAULT_OPACITY,
  HIGHLIGHT_COLOR,
  HOVER_OPACITY,
  SCENE_CONFIG,
} from '../assets'
import interactionMap from '../data/esteriaInteractionMap.json'
import { getApartmentInfo } from '../data/apartmentCatalog'
import type { BuildingMode, FloorId } from '../types'
import ApartmentModal from './ApartmentModal'
import Stage from './Stage'

const FLOOR_IDS: FloorId[] = ['01', '02', '03', '04', '05']
const APARTMENT_FADE_MS = 180

type BuildingScreenProps = {
  buildingMode: BuildingMode
  hoveredFloor: FloorId | null
  selectedFloor: FloorId | null
  hoveredApartment: string | null
  selectedApartment: string | null
  apartmentModalOpen: boolean
  onHoverFloor: (floor: FloorId | null) => void
  onSelectFloor: (floor: FloorId) => void
  onHoverApartment: (id: string | null) => void
  onSelectApartment: (id: string) => void
  onChangeFloor: () => void
  onCloseModal: () => void
  onStartWalkthrough: () => void
}

function floorOpacity(id: FloorId, hoveredFloor: FloorId | null) {
  return id === hoveredFloor ? HOVER_OPACITY : DEFAULT_OPACITY
}

function apartmentOpacity(
  id: string,
  hoveredApartment: string | null,
  selectedApartment: string | null,
) {
  if (id === selectedApartment || id === hoveredApartment) return HOVER_OPACITY
  return DEFAULT_OPACITY
}

export default function BuildingScreen({
  buildingMode,
  hoveredFloor,
  selectedFloor,
  hoveredApartment,
  selectedApartment,
  apartmentModalOpen,
  onHoverFloor,
  onSelectFloor,
  onHoverApartment,
  onSelectApartment,
  onChangeFloor,
  onCloseModal,
  onStartWalkthrough,
}: BuildingScreenProps) {
  const [visibleFloor, setVisibleFloor] = useState<FloorId | null>(selectedFloor)
  const [outgoingFloor, setOutgoingFloor] = useState<FloorId | null>(null)
  const visibleFloorRef = useRef<FloorId | null>(selectedFloor)
  visibleFloorRef.current = visibleFloor

  useEffect(() => {
    if (buildingMode !== 'apartment-selection' || !selectedFloor) {
      setVisibleFloor(selectedFloor)
      setOutgoingFloor(null)
      return
    }

    const current = visibleFloorRef.current
    if (!current) {
      setVisibleFloor(selectedFloor)
      return
    }
    if (current === selectedFloor) return

    setOutgoingFloor(current)
    setVisibleFloor(selectedFloor)
  }, [buildingMode, selectedFloor])

  useEffect(() => {
    if (!outgoingFloor) return
    const timer = window.setTimeout(() => setOutgoingFloor(null), APARTMENT_FADE_MS)
    return () => window.clearTimeout(timer)
  }, [outgoingFloor])

  const visibleApartments =
    buildingMode === 'apartment-selection' && visibleFloor
      ? interactionMap.apartments[visibleFloor]
      : []
  const outgoingApartments =
    buildingMode === 'apartment-selection' && outgoingFloor
      ? interactionMap.apartments[outgoingFloor]
      : []
  const selectedInfo = getApartmentInfo(selectedApartment)

  return (
    <div className="scene">
      <Stage focalX={SCENE_CONFIG.building.focalX} focalY={SCENE_CONFIG.building.focalY}>
        <img
          className="scene-image"
          src={ASSETS.building}
          alt="ESTERIA building"
          draggable={false}
        />
        <svg
          className="scene-overlay"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid meet"
        >
          {buildingMode === 'floor-selection' &&
            FLOOR_IDS.map((id) => (
              <path
                key={id}
                className="hit-path"
                d={interactionMap.floors[id].path}
                fill={HIGHLIGHT_COLOR}
                stroke={HIGHLIGHT_COLOR}
                strokeWidth={4}
                vectorEffect="non-scaling-stroke"
                style={{ fillOpacity: floorOpacity(id, hoveredFloor) }}
                onMouseEnter={() => onHoverFloor(id)}
                onMouseLeave={() => onHoverFloor(null)}
                onClick={() => onSelectFloor(id)}
              />
            ))}
          {buildingMode === 'apartment-selection' &&
            FLOOR_IDS.filter((id) => id !== selectedFloor).map((id) => (
              <path
                key={`switch-${id}`}
                className="hit-path floor-switch-path"
                d={interactionMap.floors[id].path}
                fill={HIGHLIGHT_COLOR}
                stroke={HIGHLIGHT_COLOR}
                strokeWidth={4}
                vectorEffect="non-scaling-stroke"
                style={{
                  fillOpacity: id === hoveredFloor ? HOVER_OPACITY : 0,
                  strokeOpacity: id === hoveredFloor ? 1 : 0,
                }}
                onMouseEnter={() => onHoverFloor(id)}
                onMouseLeave={() => onHoverFloor(null)}
                onClick={() => onSelectFloor(id)}
              />
            ))}
          {outgoingFloor && (
            <g className="apartment-layer is-exiting">
              {outgoingApartments.map((apt) => (
                <path
                  key={`out-${apt.id}`}
                  className="hit-path"
                  d={apt.path}
                  fill={HIGHLIGHT_COLOR}
                  stroke={HIGHLIGHT_COLOR}
                  strokeWidth={4}
                  vectorEffect="non-scaling-stroke"
                  style={{
                    fillOpacity: apartmentOpacity(
                      apt.id,
                      hoveredApartment,
                      selectedApartment,
                    ),
                    pointerEvents: 'none',
                  }}
                />
              ))}
            </g>
          )}
          {visibleFloor && (
            <g key={visibleFloor} className="apartment-layer is-entering">
              {visibleApartments.map((apt) => (
                <path
                  key={apt.id}
                  className="hit-path"
                  d={apt.path}
                  fill={HIGHLIGHT_COLOR}
                  stroke={HIGHLIGHT_COLOR}
                  strokeWidth={4}
                  vectorEffect="non-scaling-stroke"
                  style={{
                    fillOpacity: apartmentOpacity(
                      apt.id,
                      hoveredApartment,
                      selectedApartment,
                    ),
                  }}
                  onMouseEnter={() => onHoverApartment(apt.id)}
                  onMouseLeave={() => onHoverApartment(null)}
                  onClick={() => onSelectApartment(apt.id)}
                />
              ))}
            </g>
          )}
        </svg>
      </Stage>
      <img className="brand-logo" src={ASSETS.logo} alt="ESTERIA" draggable={false} />
      {buildingMode === 'apartment-selection' && (
        <button type="button" className="back-control change-floor" onClick={onChangeFloor}>
          ← Change Floor
        </button>
      )}
      {apartmentModalOpen && selectedApartment && (
        <ApartmentModal
          info={selectedInfo}
          onClose={onCloseModal}
          onWalkthrough={onStartWalkthrough}
        />
      )}
    </div>
  )
}
