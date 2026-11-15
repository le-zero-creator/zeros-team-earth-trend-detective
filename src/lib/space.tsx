import { useEffect, useState } from 'react'
import { ZONE_IDS } from './params'

const NAME = 'td.name'
const PLACE = 'td.place'

export function useSpace() {
  const [name, setName] = useState('')
  const [place, setPlace] = useState<string>('cmr_yaounde')
  useEffect(() => {
    try {
      setName(localStorage.getItem(NAME) ?? '')
      const stored = localStorage.getItem(PLACE)
      if (stored && (ZONE_IDS as readonly string[]).includes(stored)) setPlace(stored)
    } catch {
      /* rien n'est lu */
    }
  }, [])
  function save(nextName: string, nextPlace: string) {
    const clean = nextName.trim().slice(0, 40)
    const zone = (ZONE_IDS as readonly string[]).includes(nextPlace) ? nextPlace : 'cmr_yaounde'
    setName(clean)
    setPlace(zone)
    try {
      localStorage.setItem(NAME, clean)
      localStorage.setItem(PLACE, zone)
    } catch {
      /* reste en mémoire pour la session */
    }
  }
  return { name, place, save }
}
