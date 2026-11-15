type Name = 'sun' | 'drop' | 'cloud' | 'farmer' | 'arch' | 'health' | 'city' | 'compass' | 'search' | 'flask' | 'check'

const PATHS: Record<Name, string> = {
  sun: 'M12 4V2M12 22v-2M4.9 4.9 3.5 3.5M20.5 20.5l-1.4-1.4M4 12H2M22 12h-2M4.9 19.1 3.5 20.5M20.5 3.5l-1.4 1.4M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  drop: 'M12 3s6 6.2 6 10a6 6 0 0 1-12 0c0-3.8 6-10 6-10z',
  cloud: 'M7 18h10a4 4 0 0 0 .4-8 6 6 0 0 0-11.5 1.6A3.5 3.5 0 0 0 7 18z',
  farmer: 'M4 20c2-4 4.5-6 8-6s6 2 8 6M12 14V9M8 9h8M9 9c0-2 1.2-4 3-4s3 2 3 4',
  arch: 'M4 20V9l8-5 8 5v11M9 20v-6h6v6',
  health: 'M12 21s-7-4.4-7-10a4 4 0 0 1 7-2 4 4 0 0 1 7 2c0 5.6-7 10-7 10z',
  city: 'M4 20V10l5-3v13M9 20V6l6-3v17M15 20v-8h5v8M3 20h18',
  compass: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM14.5 9.5 13 13l-3.5 1.5L11 11l3.5-1.5z',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  flask: 'M9 3h6M10 3v6L5.5 19a2 2 0 0 0 1.8 3h9.4a2 2 0 0 0 1.8-3L14 9V3',
  check: 'M5 12.5 9.2 17 19 7',
}

export function Icon({ name }: { name: Name }) {
  return (
    <svg className="icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={PATHS[name]} />
    </svg>
  )
}
