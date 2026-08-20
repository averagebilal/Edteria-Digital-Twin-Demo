import { ASSETS, SCENE_CONFIG } from '../assets'
import Stage from './Stage'

type OpeningScreenProps = {
  fading: boolean
  imageReady: boolean
  onStart: () => void
}

export default function OpeningScreen({
  fading,
  imageReady,
  onStart,
}: OpeningScreenProps) {
  return (
    <div className={`opening ${fading ? 'is-fading' : ''} ${imageReady ? 'is-ready' : ''}`}>
      <Stage focalX={SCENE_CONFIG.opening.focalX} focalY={SCENE_CONFIG.opening.focalY}>
        <img
          className="scene-image"
          src={ASSETS.masterplan}
          alt=""
          draggable={false}
        />
      </Stage>
      <div className="opening-veil" />
      <div className="opening-content">
        <img
          className="opening-logo"
          src={ASSETS.logo}
          alt="ESTERIA"
          draggable={false}
        />
        <button type="button" className="opening-cta" onClick={onStart}>
          <img
            className="opening-cta-idle"
            src={ASSETS.startButton}
            alt="Start Experience"
            draggable={false}
          />
          <span className="opening-cta-hover" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="M8.4 5.8v12.4L19 12 8.4 5.8Z" fill="currentColor" />
            </svg>
            Start Experience
          </span>
        </button>
      </div>
    </div>
  )
}
