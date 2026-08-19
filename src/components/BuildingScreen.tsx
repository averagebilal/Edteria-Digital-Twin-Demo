import {
  ASSETS,
  DEFAULT_OPACITY,
  HIGHLIGHT_COLOR,
  HOVER_OPACITY,
  SCENE_CONFIG,
} from '../assets'
import interactionMap from '../data/esteriaInteractionMap.json'
import type { BuildingMode, FloorId } from '../types'
import ApartmentModal from './ApartmentModal'
import Stage from './Stage'

const FLOOR_IDS: FloorId[] = ['01', '02', '03', '04', '05']

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
  const apartments =
    buildingMode === 'apartment-selection' && selectedFloor
      ? interactionMap.apartments[selectedFloor]
      : []

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
            apartments.map((apt) => (
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
        </svg>
      </Stage>
      <img className="brand-logo" src={ASSETS.logo} alt="ESTERIA" draggable={false} />
      {buildingMode === 'apartment-selection' && (
        <button type="button" className="back-control change-floor" onClick={onChangeFloor}>
          ← Change Floor
        </button>
      )}
      {apartmentModalOpen && (
        <ApartmentModal
          onClose={onCloseModal}
          onWalkthrough={onStartWalkthrough}
        />
      )}
    </div>
  )
}
