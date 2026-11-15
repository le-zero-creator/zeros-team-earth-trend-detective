/** Terra Trace mark: a planet, its orbit, a satellite that circles, and a trace line. */
export function LogoMark({ className = '' }: { className?: string }) {
  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 40 40" aria-hidden="true">
      <circle className="lm-planet" cx="20" cy="20" r="9.5" pathLength={1} />
      <path className="lm-trace" d="M12.6 22.6c2.2-1.4 3.6 1.6 5.8 0.2s3.2-3.4 5.6-2.4 2.6 0.8 3.6 0" pathLength={1} />
      <ellipse className="lm-orbit" cx="20" cy="20" rx="17" ry="6.4" transform="rotate(-24 20 20)" pathLength={1} />
      <g className="lm-sat-spin">
        <circle className="lm-sat" cx="37" cy="20" r="2" transform="rotate(-24 20 20)" />
      </g>
    </svg>
  )
}

export function Wordmark() {
  return (
    <span className="wordmark">
      <span className="wordmark__a">Terra</span>
      <span className="wordmark__b">Trace</span>
    </span>
  )
}
