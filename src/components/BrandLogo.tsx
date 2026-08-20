import { ASSETS } from '../assets'

type BrandLogoProps = {
  onReturnToMasterplan?: () => void
  className?: string
}

export default function BrandLogo({
  onReturnToMasterplan,
  className = '',
}: BrandLogoProps) {
  if (onReturnToMasterplan) {
    return (
      <button
        type="button"
        className={`esteria-logo esteria-logo-button ${className}`.trim()}
        onClick={onReturnToMasterplan}
        aria-label="Return to masterplan"
      >
        <img src={ASSETS.logo} alt="" draggable={false} />
      </button>
    )
  }

  return (
    <img
      className={`esteria-logo ${className}`.trim()}
      src={ASSETS.logo}
      alt="ESTERIA"
      draggable={false}
    />
  )
}
