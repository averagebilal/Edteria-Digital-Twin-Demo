import { ASSETS, HIGHLIGHT_COLOR, SCENE_CONFIG } from '../assets'
import interactionMap from '../data/esteriaInteractionMap.json'
import BrandLogo from './BrandLogo'
import Stage from './Stage'

type MasterplanScreenProps = {
  hovered: boolean
  onHoverChange: (hovered: boolean) => void
  onSelectBuilding: () => void
  onReturnToMasterplan: () => void
}

export default function MasterplanScreen({
  hovered,
  onHoverChange,
  onSelectBuilding,
  onReturnToMasterplan,
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
            className={`hit-path masterplan-building-hit ${hovered ? 'is-hovered' : ''}`}
            d={interactionMap.masterplan.building.path}
            fill={HIGHLIGHT_COLOR}
            stroke={HIGHLIGHT_COLOR}
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
            onPointerEnter={(event) => {
              if (event.pointerType === 'mouse') onHoverChange(true)
            }}
            onPointerLeave={(event) => {
              if (event.pointerType === 'mouse') onHoverChange(false)
            }}
            onClick={(event) => {
              event.stopPropagation()
              onSelectBuilding()
            }}
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
      <BrandLogo onReturnToMasterplan={onReturnToMasterplan} />
    </div>
  )
}
