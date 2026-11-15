import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Building2 } from 'lucide-react'
import { useI18n } from '../i18n'

const EASE = [0.16, 0.84, 0.24, 1] as const

/** Where each of the three existing reading points sits on the drawing (viewBox 320 × 220). */
const SPOTS: Record<string, [number, number][]> = {
  heat: [[198, 120], [150, 72], [38, 142]],
  air: [[198, 120], [38, 142], [151, 174]],
  rain: [[265, 176], [150, 72], [276, 40]],
}

/**
 * Architect reading: a line drawing of a building that draws itself, with three hot spots.
 * Each hot spot shows one of the three points already written for this profile and this trace.
 * No number here: the figure stays in the card above, read from results.json.
 */
export function ArchitectSketch({ variable, points }: { variable: string; points: string[] }) {
  const { t } = useI18n()
  const family = variable === 'precip' ? 'rain' : variable === 'rh2m' ? 'air' : 'heat'
  const [active, setActive] = useState(0)
  useEffect(() => setActive(0), [variable])
  const spots = SPOTS[family]
  return (
    <div className="you-sketch" data-sketch={family}>
      <div className="you-sketch__art">
        <svg viewBox="0 0 320 220" role="img" aria-label={t('you.sketch.alt')}>
          <g className="you-sketch__line">
            <path pathLength={1} style={{ ['--i' as string]: 0 }} d="M10 196 H310" />
            <path pathLength={1} style={{ ['--i' as string]: 1 }} d="M70 196 V92 M230 196 V70" />
            <path pathLength={1} style={{ ['--i' as string]: 2 }} d="M54 88 L246 62 V72 L54 98 Z" />
            <path pathLength={1} style={{ ['--i' as string]: 3 }} d="M84 106 H216" />
            <rect pathLength={1} style={{ ['--i' as string]: 4 }} x="88" y="110" width="28" height="22" rx="2" />
            <rect pathLength={1} style={{ ['--i' as string]: 4 }} x="136" y="110" width="28" height="22" rx="2" />
            <rect pathLength={1} style={{ ['--i' as string]: 4 }} x="184" y="110" width="28" height="22" rx="2" />
            <rect pathLength={1} style={{ ['--i' as string]: 5 }} x="88" y="152" width="28" height="22" rx="2" />
            <rect pathLength={1} style={{ ['--i' as string]: 5 }} x="138" y="150" width="26" height="46" rx="2" />
            <rect pathLength={1} style={{ ['--i' as string]: 5 }} x="184" y="152" width="28" height="22" rx="2" />
            <path pathLength={1} style={{ ['--i' as string]: 6 }} d="M38 196 V164" />
            <circle pathLength={1} style={{ ['--i' as string]: 6 }} cx="38" cy="142" r="22" />
            <path pathLength={1} style={{ ['--i' as string]: 7 }} d="M246 72 V150 H265 V158" />
            <rect pathLength={1} style={{ ['--i' as string]: 7 }} x="250" y="158" width="30" height="38" rx="6" />
          </g>
          <g className="you-sketch__line you-sketch__sun">
            <circle pathLength={1} style={{ ['--i' as string]: 8 }} cx="276" cy="40" r="13" />
            <path pathLength={1} style={{ ['--i' as string]: 9 }} d="M276 14 V20 M276 60 V66 M250 40 H256 M296 40 H302 M258 22 L262 26 M294 22 L290 26 M258 58 L262 54 M294 58 L290 54" />
          </g>
        </svg>
        {spots.map(([x, y], index) => (
          <button
            key={`${family}-${index}`}
            type="button"
            className="you-sketch__spot"
            style={{ left: `${(x / 320) * 100}%`, top: `${(y / 220) * 100}%` }}
            aria-pressed={active === index}
            aria-label={points[index]}
            onClick={() => setActive(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
      <div className="you-sketch__copy">
        <h3 className="sec-sub"><Building2 aria-hidden="true" /> {t('you.sketch.t')}</h3>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={`${family}-${active}`}
            className="you-sketch__text"
            aria-live="polite"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <span>{active + 1}</span>
            {points[active]}
          </motion.p>
        </AnimatePresence>
        <p className="note">{t('you.sketch.hint')} {t('you.sketch.note')}</p>
      </div>
    </div>
  )
}
