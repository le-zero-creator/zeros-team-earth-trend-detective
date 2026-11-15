import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'

export const PROFILE_IDS = ['farmer', 'architect', 'health', 'urban_planner', 'student', 'researcher'] as const
export type ProfileId = (typeof PROFILE_IDS)[number]

const KEY = 'td.profile'

function readProfile(): ProfileId {
  try {
    const query = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('who')
    if (query && (PROFILE_IDS as readonly string[]).includes(query)) return query as ProfileId
    const stored = localStorage.getItem(KEY)
    if (stored && (PROFILE_IDS as readonly string[]).includes(stored)) return stored as ProfileId
  } catch {
    /* stockage ou URL indisponible */
  }
  return 'student'
}

const Ctx = createContext<{ profile: ProfileId; setProfile: (id: ProfileId) => void }>({
  profile: 'student',
  setProfile: () => {},
})

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setState] = useState<ProfileId>(readProfile)
  const setProfile = useCallback((id: ProfileId) => {
    setState(id)
    try {
      localStorage.setItem(KEY, id)
    } catch {
      /* la session garde le choix */
    }
  }, [])
  const value = useMemo(() => ({ profile, setProfile }), [profile, setProfile])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useProfile() {
  return useContext(Ctx)
}
