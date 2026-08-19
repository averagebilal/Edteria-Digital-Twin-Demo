type AudioControlProps = {
  enabled: boolean
  available: boolean
  onToggle: () => void
}

export default function AudioControl({
  enabled,
  available,
  onToggle,
}: AudioControlProps) {
  if (!available) return null

  return (
    <button
      type="button"
      className="audio-control"
      onClick={onToggle}
      aria-label={enabled ? 'Mute background audio' : 'Unmute background audio'}
      aria-pressed={enabled}
    >
      {enabled ? (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 10v4h3.2L12 18.5V5.5L7.2 10H4Z"
            fill="currentColor"
          />
          <path
            d="M16.2 8.3a4.5 4.5 0 0 1 0 7.4M18.6 5.8a8 8 0 0 1 0 12.4"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M4 10v4h3.2L12 18.5V5.5L7.2 10H4Z"
            fill="currentColor"
          />
          <path
            d="M17 9.2 21 13.2M21 9.2 17 13.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      )}
    </button>
  )
}
