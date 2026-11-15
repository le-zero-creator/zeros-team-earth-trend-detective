export type TerraMood = 'idle' | 'think' | 'happy'

/** Petit compagnon : une planète qui flotte, cligne des yeux, et a une lune. */
export function TerraMascot({ mood = 'idle' }: { mood?: TerraMood }) {
  return (
    <svg className={`terra terra--${mood}`} viewBox="0 0 64 64" aria-hidden="true">
      <circle className="terra__glow" cx="32" cy="32" r="18" />
      <g className="terra__spin">
        <circle className="terra__moon" cx="32" cy="8" r="3.2" />
      </g>
      <g className="terra__body">
        <circle className="terra__face" cx="32" cy="34" r="14" />
        <ellipse className="terra__eye" cx="27" cy="33" rx="1.7" ry="2.2" />
        <ellipse className="terra__eye terra__eye--r" cx="37" cy="33" rx="1.7" ry="2.2" />
        {mood === 'happy' && <path className="terra__smile" d="M27 38 Q32 42 37 38" />}
      </g>
    </svg>
  )
}
