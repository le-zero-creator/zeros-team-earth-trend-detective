import { useState } from 'react'
import { useI18n, type Key } from '../i18n'

const STEPS: Key[] = ['tour.1', 'tour.2', 'tour.3', 'tour.4']

/** Quatre étapes, passables, rejouables. */
export function Tour() {
  const { t } = useI18n()
  const [step, setStep] = useState<number | null>(null)
  return (
    <div className="tour">
      <button type="button" onClick={() => setStep(0)}>{t('tour.button')}</button>
      {step !== null && (
        <div className="tour-card" role="dialog" aria-label={t('tour.button')}>
          <p>{t(STEPS[step])}</p>
          <button
            type="button"
            onClick={() => setStep((value) => (value === null || value >= STEPS.length - 1 ? null : value + 1))}
          >
            {step >= STEPS.length - 1 ? t('tour.skip') : t('tour.next')}
          </button>
          <button type="button" onClick={() => setStep(null)}>{t('tour.skip')}</button>
        </div>
      )}
    </div>
  )
}
