import type { ApartmentInfo } from '../data/apartmentCatalog'

type ApartmentModalProps = {
  info: ApartmentInfo
  onClose: () => void
  onWalkthrough: () => void
}

export default function ApartmentModal({
  info,
  onClose,
  onWalkthrough,
}: ApartmentModalProps) {
  return (
    <div className="apartment-modal" role="dialog" aria-labelledby="apartment-title">
      <div className="apartment-modal-header">
        <h2 id="apartment-title">{info.title}</h2>
        <button
          type="button"
          className="apartment-modal-close"
          onClick={onClose}
          aria-label="Close apartment details"
        >
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M6.4 6.4 17.6 17.6M17.6 6.4 6.4 17.6"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
          </svg>
        </button>
      </div>

      <div className="apartment-stat apartment-stat-wide">
        <strong>{info.area}</strong>
        <span>{info.areaLabel}</span>
      </div>

      <div className="apartment-stat-row">
        <div className="apartment-stat">
          <strong>{info.floors}</strong>
          <span>Floors</span>
        </div>
        <div className="apartment-stat">
          <strong>{info.rooms}</strong>
          <span>Rooms</span>
        </div>
        <div className="apartment-stat">
          <strong>{info.location}</strong>
          <span>View</span>
        </div>
      </div>

      <button type="button" className="apartment-walkthrough" onClick={onWalkthrough}>
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          />
          <circle cx="12" cy="12" r="2.6" fill="currentColor" />
        </svg>
        Apartment Walkthrough
      </button>
    </div>
  )
}
