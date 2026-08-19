import { ASSETS, HIGHLIGHT_COLOR, HOVER_OPACITY, MASTERPLAN_DEFAULT_OPACITY, SCENE_CONFIG } from '../assets'
import interactionMap from '../data/esteriaInteractionMap.json'
import Stage from './Stage'

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
  return (
    <div className="scene">
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
            onMouseEnter={() => onHoverChange(true)}
            onMouseLeave={() => onHoverChange(false)}
            onClick={onSelectBuilding}
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
