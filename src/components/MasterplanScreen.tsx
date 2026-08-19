import { ASSETS, HIGHLIGHT_COLOR, HOVER_OPACITY, MASTERPLAN_DEFAULT_OPACITY, SCENE_CONFIG } from '../assets'
import interactionMap from '../data/esteriaInteractionMap.json'
import { isTouchUI } from '../mobileViewport'
import Stage from './Stage'
import type { MouseEvent } from 'react'

type MasterplanScreenProps = {
  hovered: boolean
  onHoverChange: (hovered: boolean) => void
  onSelectBuilding: () => void
}

export default function MasterplanScreen({
  hovered,
  onHoverChange,
  onSelectBuilding,
}: MasterplanScreenProps) {
  const touchUI = isTouchUI()

  const handleBuildingClick = (event: MouseEvent) => {
    event.stopPropagation()
    if (touchUI && !hovered) {
      onHoverChange(true)
      return
    }
    onSelectBuilding()
  }

  return (
    <div
      className="scene"
      onClick={() => {
        if (touchUI && hovered) onHoverChange(false)
      }}
    >
      <Stage focalX={SCENE_CONFIG.masterplan.focalX} focalY={SCENE_CONFIG.masterplan.focalY}>
        <img
          className="scene-image"
          src={ASSETS.masterplan}
          alt="ESTERIA masterplan"
          draggable={false}
        />
        <svg
          className="scene-overlay"
          viewBox="0 0 1920 1080"
          preserveAspectRatio="xMidYMid meet"
        >
          <path
            className="hit-path"
            d={interactionMap.masterplan.building.path}
            fill={HIGHLIGHT_COLOR}
            stroke={HIGHLIGHT_COLOR}
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
            style={{
              fillOpacity: hovered ? HOVER_OPACITY : MASTERPLAN_DEFAULT_OPACITY,
              strokeOpacity: hovered ? 1 : 0,
            }}
            onMouseEnter={() => {
              if (!touchUI) onHoverChange(true)
            }}
            onMouseLeave={() => {
              if (!touchUI) onHoverChange(false)
            }}
            onClick={handleBuildingClick}
          />
        </svg>
        <div
          className={`building-callout ${hovered ? 'is-visible' : ''}`}
          aria-hidden={!hovered}
        >
          <div className="building-callout-inner">
            <strong>ESTERIA</strong>
            <span>PRIVATE RESIDENCE</span>
          </div>
        </div>
      </Stage>
      <img className="brand-logo" src={ASSETS.logo} alt="ESTERIA" draggable={false} />
    </div>
  )
}
